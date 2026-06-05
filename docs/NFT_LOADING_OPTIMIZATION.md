# NFT Loading Optimization — Technical Specification

## Problem Statement

The frontend currently discovers user-owned CoreMiners and Geodes by scanning blockchain events (`MinerMinted`, `GeodeForged`) across millions of blocks. On Ronin Saigon testnet, the deployment block is ~44.8M and the current block is ~50.6M, meaning **~5.8 million blocks** must be scanned on every page load. Even with 50k-block chunks, this requires ~116 sequential RPC calls at ~180ms each = **~21 seconds minimum**, plus additional `ownerOf` calls per discovered token.

Neither `CoreMinerNFT` nor `GeodeNFT` implement ERC721Enumerable, so there is no `tokenOfOwnerByIndex()` or `tokensOfOwner()` function. The only available on-chain enumeration is `totalSupply() + ownerOf(1..n)`, which is O(totalSupply) and gets slow as more tokens are minted globally.

---

## Phase 1: Smart Contract Improvements

### 1.1 CoreMinerNFT — Add token enumeration

**Contract address (Saigon):** `0xa105F44F96A733C1eADEecDd9ade3f03Ce11B79b`

**Current functions available:**

```
balanceOf(address) → uint256
ownerOf(uint256) → address
totalSupply() → uint256
getMinerData(uint256) → (category, minerType, minerIndex)
getPower(uint256) → uint256
exists(uint256) → bool
```

**Missing — functions to add:**

#### Option A: ERC721Enumerable extension (recommended)

Inherit from OpenZeppelin's `ERC721Enumerable` instead of plain `ERC721`. This adds three view functions:

```solidity
// Returns the tokenId at a given index in the owner's token list
function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256);

// Returns the tokenId at a given index in the global token list
function tokenByIndex(uint256 index) external view returns (uint256);

// totalSupply() is already available
```

**Impact:** The frontend can enumerate all tokens of a user with exactly `balanceOf + 1` RPC calls:

```typescript
const balance = await contract.balanceOf(address);   // 1 call
const tokenIds = [];
for (let i = 0; i < balance; i++) {
  tokenIds.push(await contract.tokenOfOwnerByIndex(address, i));  // N calls
}
```

**Gas cost:** ERC721Enumerable increases `mint`, `transfer`, and `burn` gas by ~40-60k due to internal bookkeeping arrays. This is the standard trade-off.

**OpenZeppelin reference:**
```solidity
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract CoreMinerNFT is ERC721Enumerable, AccessControl {
    // ... existing code unchanged
    // tokenOfOwnerByIndex, tokenByIndex, totalSupply are auto-inherited
}
```

#### Option B: Custom `tokensOfOwner` view (lightweight alternative)

If ERC721Enumerable's gas overhead is unacceptable, add a single custom view function that returns all tokenIds for an owner in one call:

```solidity
// Stores token list per owner (updated on mint/transfer/burn)
mapping(address => uint256[]) private _ownedTokens;
mapping(uint256 => uint256) private _ownedTokensIndex;

function tokensOfOwner(address owner) external view returns (uint256[] memory) {
    return _ownedTokens[owner];
}
```

**Impact:** One single RPC call returns ALL tokenIds for a user. No scanning, no iteration.

**Trade-off:** Requires maintaining the `_ownedTokens` mapping in `_beforeTokenTransfer` or `_update` (OpenZeppelin v5). Slightly less gas overhead than full ERC721Enumerable since it skips the global index.

---

### 1.2 GeodeNFT — Add token enumeration

**Contract address (Saigon):** `0x4581b630DC14905a2C13B21654610a547733A287`

**Current functions available:**

```
balanceOf(address) → uint256
ownerOf(uint256) → address
totalSupply() → uint256
getGeodeData(uint256) → (category, axieClass, ...)
exists(uint256) → bool
burn(uint256)
```

**Same changes as CoreMinerNFT** — add either ERC721Enumerable or custom `tokensOfOwner(address)`.

---

### 1.3 ForgeFactory — Add user forge history view

**Contract address (Saigon):** `0xe1C50543735A20f7A98b383DD7848350FdfB5FBF`

Currently the only way to know which geodes a user forged is scanning `GeodeForged` events. A storage mapping would eliminate this entirely.

**Function to add:**

```solidity
mapping(address => uint256[]) private _userGeodes;

function getUserGeodes(address user) external view returns (uint256[] memory) {
    return _userGeodes[user];
}
```

Updated in `forgeGeode()`:
```solidity
function forgeGeode(...) external {
    // ... existing forge logic ...
    uint256 geodeId = geodeNFT.mint(msg.sender, category, axieClass);
    _userGeodes[msg.sender].push(geodeId);
    emit GeodeForged(msg.sender, geodeId, category, axieClass);
}
```

**Impact:** Eliminates the need to scan `GeodeForged` events entirely. One RPC call → all geode IDs.

---

### 1.4 ForgeFactory — Add hatched status to GeodeNFT or ForgeFactory

Currently, checking if a geode was hatched requires scanning `MinerHatched` events. This should be stored as state.

**Option A: Add to GeodeNFT**

```solidity
mapping(uint256 => bool) public isHatched;

// Called by ForgeFactory/GeodeHatcher when hatching
function markHatched(uint256 geodeId) external onlyRole(HATCHER_ROLE) {
    isHatched[geodeId] = true;
}
```

Then the frontend reads `geodeNFT.isHatched(geodeId)` — one RPC call per geode, no event scanning.

**Option B: Add to ForgeFactory**

```solidity
mapping(uint256 => bool) public geodeHatched;

function hatchMiner(...) external {
    // ... existing hatching logic ...
    geodeHatched[geodeId] = true;
    emit MinerHatched(msg.sender, geodeId, minerId, ...);
}

// Batch check
function getHatchedStatus(uint256[] calldata geodeIds) external view returns (bool[] memory) {
    bool[] memory results = new bool[](geodeIds.length);
    for (uint256 i = 0; i < geodeIds.length; i++) {
        results[i] = geodeHatched[geodeIds[i]];
    }
    return results;
}
```

**Impact:** Eliminates scanning `MinerHatched` events. `getHatchedStatus` checks all geodes in a single call.

---

### 1.5 Summary of contract changes

| Contract | Function to Add | Replaces | RPC Calls Saved |
|----------|----------------|----------|-----------------|
| CoreMinerNFT | `tokenOfOwnerByIndex` or `tokensOfOwner` | MinerMinted event scanning (~116 chunks) | ~116 → 1 |
| GeodeNFT | `tokenOfOwnerByIndex` or `tokensOfOwner` | GeodeForged event scanning (~116 chunks) | ~116 → 1 |
| ForgeFactory | `getUserGeodes(address)` | GeodeForged event scanning | ~116 → 1 |
| ForgeFactory or GeodeNFT | `isHatched(uint256)` or `getHatchedStatus(uint256[])` | MinerHatched event scanning per geode | N×116 → 1 |

**Total impact:** Current worst case ~500+ RPC calls → **4-5 RPC calls** for the entire inventory page.

---

## Phase 2: Supabase Cache Layer (Frontend)

While contract changes are the ideal solution, they require redeployment. The Supabase cache layer can be implemented immediately on the frontend to dramatically reduce load times **without any contract changes**.

### 2.1 Architecture

```
Page Load
    │
    ├─ 1. Query Supabase: "cached tokens for this wallet?"
    │      └─ Returns: { tokenIds, lastScannedBlock } or null
    │
    ├─ 2a. Cache HIT (common case):
    │      ├─ Show cached data immediately
    │      ├─ Incremental scan: lastScannedBlock+1 → currentBlock (seconds)
    │      ├─ Merge new tokens with cached list
    │      └─ Update Supabase with new lastScannedBlock
    │
    └─ 2b. Cache MISS (first load ever):
           ├─ Use totalSupply() + ownerOf(1..n) iteration
           ├─ Show tokens progressively via onProgress callback
           └─ Save results to Supabase for next time
```

### 2.2 Supabase Table

```sql
create table nft_scan_cache (
  id bigserial primary key,
  chain_id int not null,
  wallet_address text not null,
  contract_type text not null check (contract_type in ('miner', 'geode')),
  token_ids jsonb not null default '[]',
  last_scanned_block bigint not null,
  updated_at timestamptz not null default now(),

  unique(chain_id, wallet_address, contract_type)
);

-- Fast lookups
create index idx_nft_scan_cache_lookup
  on nft_scan_cache(chain_id, wallet_address, contract_type);

-- Row Level Security (public read/write via anon key, scoped to wallet)
alter table nft_scan_cache enable row level security;

create policy "Anyone can read their cache"
  on nft_scan_cache for select
  using (true);

create policy "Anyone can insert their cache"
  on nft_scan_cache for insert
  with check (true);

create policy "Anyone can update their cache"
  on nft_scan_cache for update
  using (true);
```

### 2.3 NftScanCacheService

**New file:** `src/lib/services/nftScanCache.ts`

```typescript
interface CachedScanResult {
  tokenIds: string[];
  lastScannedBlock: number;
}

class NftScanCacheService {
  // Read cached data
  async get(chainId, wallet, contractType): Promise<CachedScanResult | null>

  // Upsert after scan
  async update(chainId, wallet, contractType, tokenIds, lastBlock): Promise<void>
}
```

### 2.4 Facade changes

**NFTFacade.getMinersFromWallet():**

```
1. balanceOf(address) → if 0, return []
2. supabaseCache.get(chainId, address, 'miner')
3. IF cache exists AND balance matches cache:
     - Scan only blocks [lastScannedBlock+1 .. currentBlock]
     - Merge new tokenIds with cached
     - Verify any ownership changes if balance differs
4. IF no cache (first time):
     - totalSupply() → iterate ownerOf(1..totalSupply)
     - Progressive loading via onProgress
5. supabaseCache.update(chainId, address, 'miner', tokenIds, currentBlock)
6. Load miner data for all tokenIds
```

**InventoryFacade.getUserGeodes():** Same pattern.

### 2.5 Performance comparison

| Scenario | Current | With Supabase Cache |
|----------|---------|-------------------|
| First load (no cache) | ~21s (event scan) | ~5-15s (totalSupply iteration, depends on supply) |
| Subsequent loads | ~21s (rescans everything) | **<1s** (Supabase query + tiny incremental scan) |
| After forge transaction | ~21s (rescans everything) | **<2s** (Supabase + incremental scan of new blocks) |
| After hatch transaction | ~21s | **<2s** |

### 2.6 Integration with existing TanStack Query

The Supabase cache is transparent to the TanStack Query layer:
- `useUserMiners()` and `useUserGeodes()` hooks remain unchanged
- The facade internally uses Supabase as a fast path
- TanStack Query's 2-minute staleTime prevents unnecessary re-fetches
- `useInvalidateOnTx` triggers re-fetch after transactions → facade does incremental scan

---

## Implementation Priority

1. **Immediate (no contract changes):** Supabase cache layer (Phase 2) — reduces subsequent loads from ~21s to <1s
2. **Next contract deployment:** Add `tokensOfOwner` or ERC721Enumerable + `isHatched` — reduces ALL loads to <1s, eliminates event scanning entirely
3. **Long-term (at scale):** Consider The Graph subgraph or dedicated indexer if token supply exceeds ~10,000
