# Axie NFT Burn Integration

This document lists the missing pieces required for fake Axie NFT burning to work correctly in the Forge flow.

## Current Frontend State

- The Forge UI no longer sends SLP as a material.
- AXS remains as an ERC-20 material.
- Mementos remain as ERC-20 materials.
- Fake Axies replace SLP and are passed as `axieIds` to:

```ts
forgeGeode(category, geodeType, mementosToUse, axieIds)
```

The fake Axie faucet contract on Ronin Saigon is:

```txt
0xC1cc4ac6f5d6Bf893EF44f6eDA0Dc7d019222b38
```

The frontend reads fake Axies from this contract on chain `202601` and maps classes as:

```txt
0 Beast
1 Aqua
2 Bird
3 Reptile
4 Bug
5 Plant
6 Mech
7 Dusk
8 Dawn
```

## Required Burn Architecture

The future `MaterialValidator` must be the contract that burns the selected fake Axies.

Expected call flow:

```txt
User
  -> approves MaterialValidator as ERC-721 operator
  -> calls ForgeFactory.forgeGeode(category, geodeType, mementosToUse, axieIds)
ForgeFactory
  -> calls MaterialValidator.validateAxies(user, category, geodeType, axieIds)
MaterialValidator
  -> validates ownership, duplicates, category rules and special rules
  -> burns selected fake Axies
```

Important: the user should approve the `MaterialValidator`, not the `ForgeFactory`, unless the final contracts are changed so the factory burns NFTs directly.

## Missing Frontend Step

Once the validator address is available, add an ERC-721 approval step before forging:

```ts
setApprovalForAll(materialValidatorAddress, true)
```

The UI should check:

```ts
isApprovedForAll(userAddress, materialValidatorAddress)
```

If approval is missing, show an approval action before the final Forge button. This should be separate from AXS and Memento approvals, because it is ERC-721 operator approval.

Recommended config to add when ready:

```txt
NEXT_PUBLIC_MATERIAL_VALIDATOR_ADDRESS=0x...
```

Minimal ABI needed by the frontend:

```ts
const MOCK_AXIE_NFT_APPROVAL_ABI = [
  {
    type: "function",
    name: "isApprovedForAll",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "operator", type: "address" },
    ],
    outputs: [{ name: "approved", type: "bool" }],
  },
  {
    type: "function",
    name: "setApprovalForAll",
    stateMutability: "nonpayable",
    inputs: [
      { name: "operator", type: "address" },
      { name: "approved", type: "bool" },
    ],
    outputs: [],
  },
] as const;
```

## MaterialValidator Requirements

The validator should expose a function compatible with the existing ForgeFactory flow:

```solidity
function validateAxies(
    address user,
    uint8 category,
    uint8 geodeType,
    uint256[] calldata axieIds
) external;
```

Required checks:

- `msg.sender` must be the trusted `ForgeFactory`.
- `axieIds.length` must match the selected category.
- Every `tokenId` must be owned by `user` before burning.
- Duplicated `tokenId` values must revert.
- `axieClass(tokenId)` must return a valid class `0-8`.
- `TANQUE` must include at least one Plant Axie.
- Burns must happen only after all validations pass.

Recommended category requirements:

```txt
PETIT      1 fake Axie
ALTO       2 fake Axies
ANIMAL     2 fake Axies
ULTRAMECH  2 fake Axies
TANQUE     3 fake Axies, including at least 1 Plant
```

Recommended category ids:

```txt
0 PETIT
1 ALTO
2 ANIMAL
3 ULTRAMECH
4 TANQUE
```

## Burn Contract Expectations

The fake Axie contract must allow burns from:

- token owner
- approved token address
- approved operator via `setApprovalForAll`

The `MaterialValidator` should rely on operator approval:

```txt
owner -> setApprovalForAll(MaterialValidator, true)
MaterialValidator -> burn(tokenId)
```

The fake Axie contract should emit a burn event, and after burn:

- `ownerOf(tokenId)` must revert.
- `balanceOf(user)` must decrease.
- `tokenOfOwnerByIndex` should no longer list the burned token.

## ForgeFactory Wiring

The ForgeFactory admin must wire the new validator:

```txt
updateMaterialValidator(materialValidatorAddress)
toggleMaterialValidation(true)
```

The deployer used for this step must have the admin role on `ForgeFactory`. If the call reverts with AccessControl role `0x00`, the wallet is not admin.

## Frontend Forge Payload

When forging, frontend materials should contain only:

```ts
[
  { tokenAddress: contracts.axsToken, amount: axsAmount },
  { tokenAddress: selectedMementoAddress, amount: mementoAmount },
]
```

And `axieIds` should be passed separately:

```ts
await forgeFacade.forgeRecipe(
  recipeId,
  materials,
  selectedClass,
  mementosToUse,
  selectedAxieIds.map((id) => BigInt(id)),
);
```

Do not re-add SLP to `materials`.

## Saigon QA Checklist

1. Deploy or confirm `MaterialValidator`.
2. Wire validator into `ForgeFactory`.
3. Enable material validation.
4. Claim fake Axies from the faucet.
5. Select category and class in Forge.
6. Select the required fake Axies.
7. Approve AXS.
8. Approve Mementos.
9. Approve `MaterialValidator` with `setApprovalForAll`.
10. Forge.
11. Confirm selected NFTs were burned.
12. Confirm no SLP approval or SLP material was used.

## Failure Cases To Test

- Forging with no `axieIds`.
- Forging with too few `axieIds`.
- Forging with duplicated `axieIds`.
- Forging with Axies not owned by the user.
- Forging TANQUE with 3 Axies but no Plant.
- Forging without ERC-721 operator approval.
- Forging from a non-ForgeFactory caller directly against validator.

## Ownership Boundary

Frontend responsibility:

- Let user claim fake Axies.
- Read fake Axies from wallet.
- Let user select valid `axieIds`.
- Request ERC-721 operator approval when validator address is known.
- Send `axieIds` to ForgeFactory through the existing forge flow.

MaterialValidator responsibility:

- Enforce all NFT rules on-chain.
- Burn selected fake Axies atomically during forge.

ForgeFactory responsibility:

- Own the forge transaction.
- Call the validator when material validation is enabled.
- Continue charging AXS and Mementos as ERC-20 materials.
