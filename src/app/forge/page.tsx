"use client";

import { Contract } from "ethers";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import {
  ArrowRight,
  BarChart3,
  ChevronLeft,
  Coins,
  Lock,
  Plus,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { encodeFunctionData, numberToHex, parseEther } from "viem";
import { useAccount, useChainId, useReadContract, useSwitchChain } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { AxieBonusIndicator } from "@/components/axie";
import { GeodeVideo } from "@/components/GeodeVideo";
import {
  TrustScoreBadge,
  TrustScoreRequirementTooltip,
} from "@/components/trustscore";
import {
  Badge,
  Button,
  Card,
  ForgeShader,
  Loading,
  Toast,
  useToast,
} from "@/components/ui";
import { FORGEFACTORY_ABI } from "@/lib/abis/forge.abis";
import { CONTRACT_ADDRESSES } from "@/lib/config/deployment.config";
import { RONIN_TESTNET_ID, config as wagmiConfig } from "@/lib/config/wagmi";
import type { GeodeType } from "@/lib/constants/forge";
import {
  ALL_AXIE_CLASSES,
  AVAILABLE_CATEGORIES,
  AXIE_CLASS_INFO,
  AxieClass,
  CATEGORY_INFO,
  GeodeCategory,
  getGeodeName,
} from "@/lib/constants/geodes";
import type { MaterialInput } from "@/lib/contracts/interfaces/IForgeContract";
import type { AxieNFT } from "@/lib/facades/NFTFacade";
import { useContractManager } from "@/lib/hooks/contracts/useContractManager";
import { useContracts } from "@/lib/hooks/contracts/useContracts";
import { useAxsPriceOracle } from "@/lib/hooks/useAxsPriceOracle";
import { useWallet } from "@/lib/hooks/user/useWallet";
import {
  useInvalidateOnTx,
  useMementoBalancesQuery,
  useTrustScoreQuery,
  useUserAxies,
} from "@/lib/queries";
import { ForgeFacade } from "@/lib/services/forge/ForgeFacade";
import { createServiceLogger } from "@/lib/utils/logging/logger";
import { RONIN_TX_FEES } from "@/lib/utils/network/roninFeeSigner";

const logger = createServiceLogger("ForgePage");
const MOCK_AXIE_NFT_ADDRESS = "0xC1cc4ac6f5d6Bf893EF44f6eDA0Dc7d019222b38";
const FAKE_AXIE_FAUCET_GAS_LIMIT = 350000n;
const FAKE_AXIE_FAUCET_DATA = "0x0ffbdea7";
const PROTOCOL_FEE_ABI = [
  {
    type: "function",
    name: "getProtocolFee",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
  },
] as const;
const MOCK_AXIE_NFT_ABI = [
  {
    type: "function",
    name: "claimFakeAxies",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [
      { name: "tokenIds", type: "uint256[]", internalType: "uint256[]" },
    ],
  },
] as const;
const AXIE_CLASS_NAMES = [
  "Beast",
  "Aqua",
  "Bird",
  "Reptile",
  "Bug",
  "Plant",
  "Mech",
  "Dusk",
  "Dawn",
] as const;

function getRequiredAxieCount(category: GeodeCategory | undefined) {
  if (category === undefined) return 0;
  if (category === GeodeCategory.PETIT) return 1;
  if (category === GeodeCategory.TANQUE) return 3;
  return 2;
}

function getAxieClassId(axie: AxieNFT): AxieClass | undefined {
  const className = axie.metadata.class.toLowerCase();
  const classId = AXIE_CLASS_NAMES.findIndex(
    (name) => name.toLowerCase() === className,
  );
  return classId >= 0 ? (classId as AxieClass) : undefined;
}

function getAxieImagePath(className: string): string {
  const map: Record<string, string> = {
    Aqua: "/assets/Forge-assets/AXIE_AQUA.webp",
  };
  return map[className] || "/assets/Forge-assets/AXIE_AQUA.webp";
}

/* ──────────────  helpers  ────────────── */

function ChainStatusBanner({
  isUpdating,
  hasStaleError,
}: {
  isUpdating: boolean;
  hasStaleError: boolean;
}) {
  if (!isUpdating && !hasStaleError) return null;
  return (
    <div
      className={`mb-6 flex items-center gap-3 border px-4 py-3 text-xs uppercase tracking-wider backdrop-blur-md ${
        hasStaleError
          ? "border-magma-orange/35 bg-orange-500/8 text-magma-orange"
          : "border-ethereal-cyan/25 bg-cyan-300/8 text-ethereal-cyan/75"
      }`}
    >
      <RefreshCw
        className={`h-3.5 w-3.5 ${isUpdating ? "animate-spin" : ""}`}
      />
      <span>
        {hasStaleError
          ? "Showing cached forge data. Chain refresh failed."
          : "Updating chain data…"}
      </span>
    </div>
  );
}

function GlossImage({
  src,
  alt,
  width,
  height,
  className = "",
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}) {
  return (
    <div
      className={`group relative inline-flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      <Image
        src={src}
        alt=""
        width={width}
        height={height}
        className="absolute inset-0 blur-2xl opacity-55 scale-[1.6] object-contain pointer-events-none select-none brightness-125 saturate-150 transition-all duration-500 group-hover:opacity-90 group-hover:brightness-150 group-hover:scale-[1.9]"
        aria-hidden
      />
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="relative z-10 object-contain transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );
}

function GlossImageFill({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={`group relative ${className}`}>
      <Image
        src={src}
        alt=""
        fill
        className="object-contain blur-2xl opacity-75 scale-125 pointer-events-none select-none brightness-125 saturate-150 transition-all duration-500 group-hover:opacity-100 group-hover:brightness-150 group-hover:scale-140"
        aria-hidden
      />
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain relative z-10 transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );
}

/* ──────────────  page  ────────────── */

export default function ForgePage() {
  const router = useRouter();
  const { isConnected } = useWallet();
  const { address, chain: walletChain, connector } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const contracts = useContracts();
  const { contractManager, signer } = useContractManager();
  const { toast, showSuccess, showError, showInfo, hideToast } = useToast();
  const {
    data: mementoBalances,
    isFetching: isFetchingMementos,
    error: mementoError,
  } = useMementoBalancesQuery();
  const {
    trustScoreInfo,
    isFetching: isFetchingTrustScore,
    error: trustScoreError,
  } = useTrustScoreQuery();
  const {
    data: axies = [],
    isFetching: isFetchingAxies,
    error: axiesError,
  } = useUserAxies();
  const { afterForge, afterMockAxieClaim } = useInvalidateOnTx();

  const forgeFacade = React.useMemo(() => {
    if (!contractManager || !isConnected || !address || !signer) {
      return null;
    }
    const provider = contractManager.getProvider();
    if (!provider) return null;
    return new ForgeFacade(contractManager);
  }, [contractManager, isConnected, address, signer]);

  /* state */
  const [selectedCategory, setSelectedCategory] = useState<
    GeodeCategory | undefined
  >(undefined);
  const [selectedClass, setSelectedClass] = useState<AxieClass | undefined>(
    undefined,
  );
  const [selectedAxieIds, setSelectedAxieIds] = useState<string[]>([]);
  const [mementosToUse, setMementosToUse] = useState<number>(0);
  const [forgeStep, setForgeStep] = useState<"select" | "forge" | "success">(
    "select",
  );
  const [_isForging, setIsForging] = useState(false);
  const [isClaimingFakeAxies, setIsClaimingFakeAxies] = useState(false);
  const [faucetClaims, setFaucetClaims] = useState(0);
  const MAX_FAUCET_CLAIMS = 10;
  const [forgedGeodeId, setForgedGeodeId] = useState<bigint | null>(null);
  const [_forgeFailed, setForgeFailed] = useState(false);
  const [isTransmuting, setIsTransmuting] = useState(false);
  const [transmutationHeat, setTransmutationHeat] = useState(0);
  const [wizardStep, setWizardStep] = useState(1);
  const contentRef = useRef<HTMLDivElement>(null);
  const [categoryView, setCategoryView] = useState<"grid" | "detail">("grid");
  const [previewCategory, setPreviewCategory] = useState<
    GeodeCategory | undefined
  >(undefined);
  const oracle = useAxsPriceOracle(
    (selectedCategory ?? GeodeCategory.PETIT) as unknown as GeodeType,
  );
  const { data: protocolFeeData } = useReadContract({
    address: CONTRACT_ADDRESSES.ProtocolFeeManager as `0x${string}`,
    abi: PROTOCOL_FEE_ABI,
    functionName: "getProtocolFee",
  });
  const { data: trustScoreEnabledData } = useReadContract({
    address: CONTRACT_ADDRESSES.ForgeFactory as `0x${string}`,
    abi: FORGEFACTORY_ABI,
    functionName: "trustScoreEnabled",
  });
  const { data: forgeFailureEnabledData } = useReadContract({
    address: CONTRACT_ADDRESSES.ForgeFactory as `0x${string}`,
    abi: FORGEFACTORY_ABI,
    functionName: "forgeFailureEnabled",
  });
  const protocolFee =
    (protocolFeeData as bigint | undefined) ?? parseEther("0.05");
  const trustScoreEnabled = Boolean(trustScoreEnabledData);
  const forgeFailureEnabled = Boolean(forgeFailureEnabledData);

  /* Faucet claim counter */
  useEffect(() => {
    if (address) {
      const key = `forge_faucet_claims:${address.toLowerCase()}`;
      const stored = Number(localStorage.getItem(key) || "0");
      setFaucetClaims(stored);
    }
  }, [address]);

  /* GSAP transition */
  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 40, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out" },
      );
    }
  }, []);

  const CATEGORY_TRUST_REQUIREMENTS: Record<
    GeodeCategory,
    { level: number; minScore: number }
  > = {
    [GeodeCategory.PETIT]: { level: 0, minScore: 0 },
    [GeodeCategory.ALTO]: { level: 1, minScore: 201 },
    [GeodeCategory.ANIMAL]: { level: 2, minScore: 401 },
    [GeodeCategory.ULTRAMECH]: { level: 2, minScore: 401 },
    [GeodeCategory.TANQUE]: { level: 3, minScore: 701 },
  };

  const categoryInfo =
    selectedCategory !== undefined
      ? CATEGORY_INFO[selectedCategory]
      : CATEGORY_INFO[GeodeCategory.PETIT];
  const classInfo =
    selectedClass !== undefined
      ? AXIE_CLASS_INFO[selectedClass]
      : AXIE_CLASS_INFO[AxieClass.BEAST];
  const geodeName =
    selectedCategory !== undefined && selectedClass !== undefined
      ? getGeodeName(selectedCategory, selectedClass)
      : "Selecciona una geoda";

  const categoryRequirement =
    selectedCategory !== undefined
      ? CATEGORY_TRUST_REQUIREMENTS[selectedCategory]
      : null;
  const hasAccessToCategory =
    !trustScoreEnabled ||
    !categoryRequirement ||
    !trustScoreInfo ||
    trustScoreInfo.level >= categoryRequirement.level;
  const userScore = trustScoreInfo?.score ?? 0;
  const userLevel = trustScoreInfo?.level ?? 0;

  const stakedAxiesCount = axies.filter(
    (axie: AxieNFT) => axie.isStaked,
  ).length;
  const isRefreshingForgeData =
    isFetchingMementos || isFetchingTrustScore || isFetchingAxies;
  const hasForgeData = Boolean(
    mementoBalances || trustScoreInfo || axies.length > 0,
  );
  const hasForgeStaleError =
    hasForgeData && Boolean(mementoError || trustScoreError || axiesError);

  const baseFailureChance = forgeFailureEnabled ? categoryInfo.failureRate : 0;
  const reduction = Math.floor(mementosToUse / 10);
  const currentFailureChance = Math.max(0, baseFailureChance - reduction);

  const axsCost = oracle.axsCostDisplay;
  const axsCostWei = oracle.axsCostWei;
  const mementoCost = [100, 200, 300, 300, 500][categoryInfo.id];
  const totalMementoCost = mementoCost + mementosToUse;
  const availableAxies = axies.filter((axie: AxieNFT) => !axie.isStaked);
  const selectedAxies = selectedAxieIds
    .map((tokenId) => availableAxies.find((axie) => axie.tokenId === tokenId))
    .filter((axie): axie is AxieNFT => Boolean(axie));
  const requiredAxieCount = getRequiredAxieCount(selectedCategory);
  const selectedHasPlant = selectedAxies.some(
    (axie) => getAxieClassId(axie) === AxieClass.PLANT,
  );
  const hasRequiredAxieSelection =
    selectedCategory !== undefined &&
    selectedAxieIds.length === requiredAxieCount &&
    (selectedCategory !== GeodeCategory.TANQUE || selectedHasPlant);
  const hasEnoughAxies = availableAxies.length >= requiredAxieCount;

  /* effects */
  useEffect(() => {
    if (!isConnected) {
      const timer = setTimeout(() => {
        if (!isConnected) router.push("/");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, router]);

  useEffect(() => {
    logger.info("Reset de selección", { selectedCategory, selectedClass });
    setMementosToUse(0);
    setForgeStep("select");
    setForgeFailed(false);
    setForgedGeodeId(null);
    setSelectedAxieIds([]);
  }, [selectedCategory, selectedClass]);

  /* handlers */
  // Nota: no hay paso de aprobación de tokens. El ForgeFactory desplegado en
  // Saigon L2 tiene materialValidationEnabled=false y no cobra ERC20/ERC1155;
  // forgeGeode solo consume los fake Axies seleccionados.

  /**
   * Garantiza que la wallet esté en Saigon L2 antes de firmar.
   * `useChainId()` devuelve el chain del config (no el real de la wallet),
   * por eso se usa `useAccount().chain` + switchChainAsync.
   */
  const ensureSaigonChain = async (): Promise<boolean> => {
    const getConnectorChainId = async () => {
      try {
        const provider = (await connector?.getProvider()) as
          | { request?: (args: { method: string }) => Promise<unknown> }
          | undefined;
        const providerChainId = await provider?.request?.({
          method: "eth_chainId",
        });
        if (typeof providerChainId === "string") {
          return Number(providerChainId);
        }
        return await connector?.getChainId();
      } catch {
        return undefined;
      }
    };

    const currentConnectorChainId = await getConnectorChainId();
    if (currentConnectorChainId === RONIN_TESTNET_ID) {
      return true;
    }

    try {
      showInfo("Switching wallet to Ronin Saigon Testnet...");
      await switchChainAsync({ chainId: RONIN_TESTNET_ID });

      for (let attempt = 0; attempt < 10; attempt += 1) {
        const nextConnectorChainId = await getConnectorChainId();
        if (nextConnectorChainId === RONIN_TESTNET_ID) {
          return true;
        }
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      logger.error("Wallet stayed on the wrong chain after switch", undefined, {
        expectedChainId: RONIN_TESTNET_ID,
        walletChainId: walletChain?.id,
        connectorChainId: await getConnectorChainId(),
      });
      showError(
        "Ronin Wallet is still on mainnet. Switch to Ronin Saigon Testnet (202601) and try again",
      );
      return false;
    } catch (err) {
      logger.error("Failed to switch chain", err, {
        walletChainId: walletChain?.id,
        connectorChainId: await getConnectorChainId(),
      });
      showError(
        "Switch your wallet to Ronin Saigon Testnet (202601) and try again",
      );
      return false;
    }
  };

  const handleToggleAxieSelection = (axie: AxieNFT) => {
    setSelectedAxieIds((current) => {
      if (current.includes(axie.tokenId)) {
        return current.filter((tokenId) => tokenId !== axie.tokenId);
      }

      if (current.length >= requiredAxieCount) {
        return current;
      }

      return [...current, axie.tokenId];
    });
  };

  const handleClaimFakeAxies = async () => {
    if (!address) {
      showError("Wallet not connected");
      return;
    }

    if (!(await ensureSaigonChain())) {
      return;
    }

    if (faucetClaims >= MAX_FAUCET_CLAIMS) {
      showError(`Faucet limit reached (${MAX_FAUCET_CLAIMS} max)`);
      return;
    }

    try {
      setIsClaimingFakeAxies(true);
      showInfo("Confirm the fake Axies claim in your wallet...");

      const isWaypointConnector = connector?.id === "WAYPOINT";
      if (isWaypointConnector) {
        showError(
          "Waypoint does not support Ronin Saigon L2 (202601) transactions yet. Use Ronin Wallet extension to claim fake Axies.",
        );
        return;
      }

      const provider = (await connector?.getProvider()) as
        | {
            request?: (args: {
              method: string;
              params: unknown[];
            }) => Promise<unknown>;
          }
        | undefined;

      if (!provider?.request) {
        showError("Wallet provider not available");
        return;
      }

      const data =
        encodeFunctionData({
          abi: MOCK_AXIE_NFT_ABI,
          functionName: "claimFakeAxies",
        }) || FAKE_AXIE_FAUCET_DATA;

      const hash = (await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: address,
            to: MOCK_AXIE_NFT_ADDRESS,
            data,
            chainId: numberToHex(RONIN_TESTNET_ID),
            type: "0x0",
            gas: numberToHex(FAKE_AXIE_FAUCET_GAS_LIMIT),
            gasPrice: numberToHex(RONIN_TX_FEES.gasPrice),
          },
        ],
      })) as `0x${string}`;

      showInfo("Waiting for fake Axies confirmation...");
      await waitForTransactionReceipt(wagmiConfig, {
        hash,
        chainId: RONIN_TESTNET_ID,
      });

      if (signer) {
        try {
          showInfo("Claiming testnet AXS...");
          const axsFaucet = new Contract(
            CONTRACT_ADDRESSES.axsToken,
            ["function faucet()"],
            signer,
          );
          await (await axsFaucet.faucet()).wait();
        } catch (error) {
          logger.warn("AXS faucet claim skipped", { error });
        }
        try {
          showInfo("Claiming testnet Mementos...");
          const mementoFaucet = new Contract(
            CONTRACT_ADDRESSES.MementoFaucet,
            ["function claim()"],
            signer,
          );
          await (await mementoFaucet.claim()).wait();
        } catch (error) {
          logger.warn("Memento faucet claim skipped", { error });
        }
      }

      const next = faucetClaims + 1;
      setFaucetClaims(next);
      localStorage.setItem(
        `forge_faucet_claims:${address.toLowerCase()}`,
        String(next),
      );
      afterMockAxieClaim();
      showSuccess("Testnet Axies and available forge materials claimed");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get fake Axies";
      logger.error("Error claiming fake Axies", err);
      showError(errorMessage);
    } finally {
      setIsClaimingFakeAxies(false);
    }
  };

  const handleForge = async (): Promise<boolean> => {
    logger.info("Iniciando forja de geoda", {
      address,
      selectedCategory,
      selectedClass,
      mementosToUse,
      costs: { axsCost, totalMementoCost },
      selectedAxieIds,
    });

    if (!address || !forgeFacade || !contracts || !signer) {
      showError("Wallet no conectada o facade no inicializado");
      return false;
    }
    if (selectedCategory === undefined || selectedClass === undefined) {
      showError("Selecciona una categoría y clase de geoda");
      return false;
    }
    if (!hasRequiredAxieSelection) {
      showError("Select the required fake Axies before forging");
      return false;
    }
    if (axsCostWei <= 0n || !oracle.isFresh) {
      showError("AXS price oracle is unavailable or stale");
      return false;
    }

    try {
      setIsForging(true);
      showInfo("Forjando geoda...");

      const mementoKey = [
        "beast",
        "aqua",
        "bird",
        "reptile",
        "bug",
        "plant",
        "mech",
        "dusk",
        "dawn",
      ][selectedClass] as keyof typeof contracts.mementos;
      const mementoAddress = contracts.mementos[mementoKey];

      if (
        !mementoAddress ||
        mementoAddress === "0x0000000000000000000000000000000000000000"
      ) {
        showError(
          `Memento token para clase ${String(mementoKey)} no disponible en esta red`,
        );
        return false;
      }

      const forgeAddress = CONTRACT_ADDRESSES.ForgeFactory as `0x${string}`;
      const axsToken = contractManager.getERC20Token(contracts.axsToken);
      const axsAllowance = await axsToken.allowance(address, forgeAddress);
      if (axsAllowance < axsCostWei) {
        showInfo("Approve AXS for ForgeFactory...");
        await axsToken.approve(forgeAddress, axsCostWei);
      }

      const mementoToken = new Contract(
        mementoAddress,
        [
          "function isApprovedForAll(address account, address operator) view returns (bool)",
          "function setApprovalForAll(address operator, bool approved)",
        ],
        signer,
      );
      if (!(await mementoToken.isApprovedForAll(address, forgeAddress))) {
        showInfo("Approve Mementos for ForgeFactory...");
        await (await mementoToken.setApprovalForAll(forgeAddress, true)).wait();
      }

      const axieToken = new Contract(
        MOCK_AXIE_NFT_ADDRESS,
        [
          "function isApprovedForAll(address owner, address operator) view returns (bool)",
          "function setApprovalForAll(address operator, bool approved)",
        ],
        signer,
      );
      if (!(await axieToken.isApprovedForAll(address, forgeAddress))) {
        showInfo("Approve Axies for ForgeFactory...");
        await (await axieToken.setApprovalForAll(forgeAddress, true)).wait();
      }

      const materials: MaterialInput[] = [
        {
          tokenAddress: contracts.axsToken as `0x${string}`,
          amount: axsCostWei,
        },
        {
          tokenAddress: mementoAddress as `0x${string}`,
          amount: BigInt(totalMementoCost),
        },
      ];

      const recipeId = selectedCategory + 1;
      showInfo("Esperando confirmación de transacción...");
      const axieIds = selectedAxieIds.map((id) => BigInt(id));

      const result = await forgeFacade.forgeRecipe(
        recipeId,
        materials,
        selectedClass,
        mementosToUse,
        axieIds,
        protocolFee,
      );

      if (result.success && result.geodeId) {
        setForgedGeodeId(result.geodeId);
        setForgeStep("success");
        setForgeFailed(false);
        showSuccess(
          `¡Geoda ${geodeName} forjada con éxito! Token ID: ${result.geodeId}`,
        );
        afterForge();
        return true;
      } else {
        setForgeFailed(true);
        showError(
          `Forge transaction failed (${currentFailureChance}% configured failure chance).`,
        );
        return false;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al forjar geoda";
      logger.error("Error en forja", err, { selectedCategory, selectedClass });
      setForgeFailed(true);
      showError(errorMessage);
      return false;
    } finally {
      setIsForging(false);
    }
  };

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handleTransmute = async () => {
    if (
      selectedCategory === undefined ||
      selectedClass === undefined ||
      !hasRequiredAxieSelection ||
      !hasAccessToCategory
    ) {
      return;
    }

    if (!(await ensureSaigonChain())) {
      return;
    }

    setIsTransmuting(true);

    const heatObj = { value: 0 };
    gsap.to(heatObj, {
      value: 1,
      duration: 2.5,
      ease: "power2.inOut",
      onUpdate: () => setTransmutationHeat(heatObj.value),
    });

    const forged = await handleForge();
    if (!forged) {
      gsap.to(heatObj, {
        value: 0,
        duration: 1.5,
        ease: "power2.out",
        overwrite: true,
        onUpdate: () => setTransmutationHeat(heatObj.value),
        onComplete: () => setIsTransmuting(false),
      });
      return;
    }

    await sleep(3500);

    setIsTransmuting(false);
    setTransmutationHeat(0);
    setWizardStep(7);
  };

  /* wizard helpers */
  const _selectCategory = (cat: GeodeCategory) => {
    setSelectedCategory(cat);
    setWizardStep(2);
  };

  const openCategoryDetail = (cat: GeodeCategory) => {
    const requirement = CATEGORY_TRUST_REQUIREMENTS[cat];
    const hasAccess =
      !trustScoreEnabled ||
      !trustScoreInfo ||
      trustScoreInfo.level >= requirement.level;
    if (!hasAccess) return;
    setPreviewCategory(cat);
    setCategoryView("detail");
  };

  const closeCategoryDetail = () => {
    setCategoryView("grid");
    setPreviewCategory(undefined);
  };

  const goToStep = (step: number, before?: () => void) => {
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        opacity: 0,
        y: -30,
        scale: 0.97,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          if (before) before();
          setWizardStep(step);
        },
      });
    } else {
      if (before) before();
      setWizardStep(step);
    }
  };

  const confirmCategory = () => {
    if (previewCategory !== undefined) {
      goToStep(2, () => {
        setSelectedCategory(previewCategory);
        setCategoryView("grid");
        setPreviewCategory(undefined);
      });
    }
  };

  const selectClass = (cls: AxieClass) => {
    goToStep(3, () => setSelectedClass(cls));
  };

  const mementoFileMap: Record<AxieClass, string> = {
    [AxieClass.BEAST]: "memento-beast.webp",
    [AxieClass.AQUA]: "memento-aqua.webp",
    [AxieClass.BIRD]: "memento-bird.webp",
    [AxieClass.REPTILE]: "memento-reptile.webp",
    [AxieClass.BUG]: "memento-bug.webp",
    [AxieClass.PLANT]: "memento-plant.webp",
    [AxieClass.MECH]: "memento-mech.webp",
    [AxieClass.DUSK]: "memento-dusk.webp",
    [AxieClass.DAWN]: "memento-dawn.webp",
  };

  if (!isConnected) {
    return (
      <div className="alchemy-copy flex min-h-screen items-center justify-center bg-deep-abyss text-white">
        <Loading />
      </div>
    );
  }

  /* ──────────────  RENDER  ────────────── */
  return (
    <main className="alchemy-copy relative min-h-screen overflow-hidden bg-deep-abyss text-white">
      {/* ambient bg */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(125,249,255,0.15),transparent_30%),radial-gradient(circle_at_18%_34%,rgba(240,106,18,0.16),transparent_30%),radial-gradient(circle_at_82%_44%,rgba(247,198,90,0.1),transparent_24%),linear-gradient(180deg,#020607_0%,#030b0e_48%,#010203_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.78),transparent_20%,transparent_80%,rgba(0,0,0,0.78)),radial-gradient(ellipse_at_center,transparent_0_42%,rgba(0,0,0,0.62)_100%)]" />

      <ChainStatusBanner
        isUpdating={isRefreshingForgeData}
        hasStaleError={hasForgeStaleError}
      />

      {/* wizard content */}
      <div
        key={wizardStep}
        ref={contentRef}
        className="relative z-10 flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 pb-12"
      >
        {trustScoreInfo && (
          <div className="absolute right-4 top-4 w-fit border border-cyan-100/12 bg-black/42 p-2 shadow-[0_18px_50px_rgba(0,0,0,0.34)] backdrop-blur-md md:right-10">
            <TrustScoreBadge
              score={trustScoreInfo.score}
              level={trustScoreInfo.level}
              levelName={trustScoreInfo.levelName}
              isFlagged={trustScoreInfo.flagged}
              isStale={trustScoreInfo.isStale}
              size="sm"
              showLabel={false}
            />
          </div>
        )}
        {/* ───── STEP 1 ───── */}
        {wizardStep === 1 && (
          <div className="relative flex w-full max-w-6xl flex-col items-center">
            <p className="alchemy-eyebrow mb-3 text-xs uppercase tracking-widest text-cyan-50/60">
              Elemental Forge
            </p>
            <h1 className="alchemy-heading-strong text-balance text-center text-3xl leading-tight md:text-5xl mb-4">
              1. Categoría de Geoda
            </h1>
            <p className="mb-14 max-w-xl text-center text-sm text-cyan-50/60">
              {categoryView === "grid"
                ? "Selecciona la categoría de geoda que deseas forjar"
                : "Confirma tu selección"}
            </p>

            <AnimatePresence mode="popLayout">
              {categoryView === "grid" ? (
                <motion.div
                  key="grid"
                  className="flex flex-wrap items-center justify-center gap-8 md:gap-12"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  {AVAILABLE_CATEGORIES.map((cat) => {
                    const requirement = CATEGORY_TRUST_REQUIREMENTS[cat.id];
                    const hasAccess =
                      !trustScoreEnabled ||
                      !trustScoreInfo ||
                      trustScoreInfo.level >= requirement.level;
                    const isLocked = !hasAccess;
                    const isSelected = previewCategory === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => !isLocked && openCategoryDetail(cat.id)}
                        disabled={isLocked}
                        className={`group relative flex flex-col items-center transition-all focus:outline-none ${
                          isLocked
                            ? "cursor-not-allowed opacity-40"
                            : "hover:scale-105"
                        }`}
                        title={
                          isLocked
                            ? `Requiere Trust Score nivel ${requirement.level}`
                            : cat.name
                        }
                      >
                        <motion.div
                          layoutId={`cat-${cat.id}`}
                          layout
                          transition={{
                            type: "spring",
                            stiffness: 180,
                            damping: 22,
                          }}
                          className="relative flex h-[150px] w-[150px] items-center justify-center rounded-full border border-white/5 bg-white/3 shadow-[0_0_40px_rgba(125,249,255,0.06)] transition-all duration-300 group-hover:border-white/10 group-hover:bg-white/6 group-hover:shadow-[0_0_60px_rgba(125,249,255,0.12)]"
                          animate={isSelected ? { opacity: 0 } : { opacity: 1 }}
                        >
                          <GlossImage
                            src={cat.icon}
                            alt={cat.name}
                            width={120}
                            height={120}
                            className="transition-transform duration-300 group-hover:scale-105"
                          />
                          {isLocked && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center rounded-full bg-black/60">
                              <Lock className="h-8 w-8 text-magma-gold" />
                            </div>
                          )}
                        </motion.div>
                      </button>
                    );
                  })}
                </motion.div>
              ) : (
                previewCategory !== undefined && (
                  <motion.div
                    key="detail"
                    className="flex w-full flex-col items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <button
                      type="button"
                      onClick={closeCategoryDetail}
                      className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-cyan-50/50 transition-colors hover:text-cyan-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Volver
                    </button>

                    <div className="flex w-full flex-col items-center gap-10 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-16">
                      <div className="hidden md:block" />
                      <motion.div
                        layoutId={`cat-${previewCategory}`}
                        layout
                        transition={{
                          type: "spring",
                          stiffness: 180,
                          damping: 22,
                        }}
                        className="relative h-[320px] w-[320px]"
                      >
                        <GlossImageFill
                          src={CATEGORY_INFO[previewCategory].icon}
                          alt={CATEGORY_INFO[previewCategory].name}
                          className="h-[320px] w-[320px]"
                        />
                      </motion.div>

                      <div className="flex flex-col items-center gap-4 md:items-start md:justify-self-start">
                        <div>
                          <div className="alchemy-heading-strong text-3xl">
                            {CATEGORY_INFO[previewCategory].name}
                          </div>
                          <div
                            className="mt-1 text-sm font-medium"
                            style={{
                              color: CATEGORY_INFO[previewCategory].color,
                            }}
                          >
                            {CATEGORY_INFO[previewCategory].rarity}
                          </div>
                        </div>

                        <div className="space-y-2 text-sm text-cyan-50/70">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-ethereal-cyan" />
                            <span>
                              Supply máximo:{" "}
                              {CATEGORY_INFO[
                                previewCategory
                              ].maxSupply.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4 text-magma-orange" />
                            <span>
                              Probabilidad de fallo:{" "}
                              {CATEGORY_INFO[previewCategory].failureRate}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Coins className="h-4 w-4 text-magma-gold" />
                            <span>
                              Poder de minado:{" "}
                              {CATEGORY_INFO[previewCategory].miningPower}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-purple-400" />
                            <span>
                              Bonus de colección:{" "}
                              {CATEGORY_INFO[previewCategory].collectionBonus}%
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 flex gap-4">
                          <Button
                            variant="outline"
                            onClick={closeCategoryDetail}
                            className="rounded-none border-cyan-100/20 bg-black/30 px-8"
                          >
                            Volver
                          </Button>
                          <Button
                            variant="primary"
                            onClick={confirmCategory}
                            className="rounded-none border-ethereal-cyan/55 bg-cyan-300/14 px-10 text-cyan-50 shadow-[0_0_28px_rgba(125,249,255,0.16)] hover:bg-cyan-300/22"
                          >
                            Confirmar
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {(() => {
                      const req = CATEGORY_TRUST_REQUIREMENTS[previewCategory];
                      if (
                        req.level > 0 &&
                        trustScoreInfo &&
                        trustScoreInfo.level < req.level
                      ) {
                        return (
                          <div className="mt-8">
                            <TrustScoreRequirementTooltip
                              requiredLevel={req.level}
                              userLevel={userLevel}
                              userScore={userScore}
                              requiredScore={req.minScore}
                              categoryName={CATEGORY_INFO[previewCategory].name}
                              isBlocked
                            />
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ───── STEP 2 ───── */}
        {wizardStep === 2 && (
          <div className="flex w-full max-w-6xl flex-col items-center">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory(undefined);
                goToStep(1);
              }}
              className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-cyan-50/50 transition-colors hover:text-cyan-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver a categorías
            </button>
            <p className="alchemy-eyebrow mb-3 text-xs uppercase tracking-widest text-cyan-50/60">
              Elemental Forge
            </p>
            <h2 className="alchemy-heading-strong text-balance text-center text-3xl leading-tight md:text-5xl mb-2">
              2. Clase de Axie
            </h2>
            <p className="mb-14 max-w-xl text-center text-sm text-cyan-50/60">
              Elige la clase que definirá tu geoda
            </p>

            <div className="flex flex-wrap items-start justify-center gap-6 md:gap-8">
              {ALL_AXIE_CLASSES.map((axieClass) => (
                <button
                  type="button"
                  key={axieClass.id}
                  onClick={() => selectClass(axieClass.id)}
                  className="group relative flex flex-col items-center transition-all focus:outline-none hover:scale-105"
                  title={axieClass.displayName}
                >
                  <div className="relative flex h-[120px] w-[120px] items-center justify-center rounded-full border border-white/5 bg-white/3 shadow-[0_0_40px_rgba(125,249,255,0.06)] transition-all duration-300 group-hover:border-white/10 group-hover:bg-white/6 group-hover:shadow-[0_0_60px_rgba(125,249,255,0.12)]">
                    <GlossImage
                      src={axieClass.icon}
                      alt={axieClass.displayName}
                      width={90}
                      height={90}
                      className="transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ───── STEP 3 ───── */}
        {wizardStep === 3 && selectedClass !== undefined && (
          <div className="flex w-full max-w-4xl flex-col items-center px-2 sm:px-0">
            <div className="mb-6 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setWizardStep(2)}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-cyan-50/50 transition-colors hover:text-cyan-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Volver a clases
              </button>
              {chainId === RONIN_TESTNET_ID && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleClaimFakeAxies}
                  isLoading={isClaimingFakeAxies}
                  disabled={
                    isClaimingFakeAxies || faucetClaims >= MAX_FAUCET_CLAIMS
                  }
                  leftIcon={<Plus className="h-4 w-4" />}
                  className="w-full sm:w-auto text-[10px] sm:text-xs"
                >
                  {faucetClaims >= MAX_FAUCET_CLAIMS
                    ? "Faucet limit reached"
                    : `Faucet (${faucetClaims}/${MAX_FAUCET_CLAIMS})`}
                </Button>
              )}
            </div>
            <h2 className="alchemy-heading-strong text-balance text-center text-3xl leading-tight md:text-5xl mb-2">
              3. Selecciona tus Axies
            </h2>

            <Card
              variant="glass"
              className="w-full max-w-3xl rounded-none border-cyan-100/12 bg-black/42 p-3 sm:p-5 shadow-[0_18px_50px_rgba(0,0,0,0.34)] backdrop-blur-md"
            >
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm leading-6 text-cyan-50/62">
                  Select {requiredAxieCount} fake Axie
                  {requiredAxieCount === 1 ? "" : "s"}.
                  {selectedCategory === GeodeCategory.TANQUE
                    ? " Tanque requires at least one Plant."
                    : ""}
                </span>
                <span className="w-fit border border-cyan-100/12 bg-black/35 px-3 py-1 text-xs font-semibold uppercase text-cyan-50/62">
                  {selectedAxieIds.length}/{requiredAxieCount || 0} selected
                </span>
              </div>

              {(() => {
                const filteredAxies = availableAxies.filter((axie) => {
                  const axieClassId = getAxieClassId(axie);
                  if (axieClassId === undefined) return false;
                  if (axieClassId === selectedClass) return true;
                  if (
                    selectedCategory === GeodeCategory.TANQUE &&
                    axieClassId === AxieClass.PLANT
                  )
                    return true;
                  return false;
                });

                if (isFetchingAxies) {
                  return (
                    <div className="flex items-center gap-3 text-sm text-cyan-50/62">
                      <RefreshCw className="h-4 w-4 animate-spin text-ethereal-cyan" />
                      Loading fake Axies...
                    </div>
                  );
                }
                if (filteredAxies.length === 0) {
                  return (
                    <p className="text-sm leading-6 text-cyan-50/62">
                      No matching fake Axies found. Use the faucet to claim a
                      testnet set.
                    </p>
                  );
                }
                return (
                  <div className="flex flex-wrap items-start justify-center gap-4 sm:gap-6 md:gap-8">
                    {filteredAxies.map((axie) => {
                      const isSelected = selectedAxieIds.includes(axie.tokenId);
                      const isSelectionFull =
                        selectedAxieIds.length >= requiredAxieCount &&
                        !isSelected;

                      return (
                        <button
                          type="button"
                          key={axie.tokenId}
                          onClick={() => handleToggleAxieSelection(axie)}
                          disabled={isSelectionFull}
                          className="group flex flex-col items-center gap-2 sm:gap-3 focus:outline-none disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          <div
                            className={`transition-transform duration-300 ${isSelected ? "scale-105" : "group-hover:scale-105"}`}
                          >
                            <Image
                              src={getAxieImagePath(axie.metadata.class)}
                              alt={axie.metadata.class}
                              width={250}
                              height={250}
                              className={`h-[120px] w-[120px] sm:h-[160px] sm:w-[160px] md:h-[200px] md:w-[200px] object-contain ${
                                isSelected
                                  ? "drop-shadow-[0_0_22px_rgba(240,106,18,0.25)]"
                                  : ""
                              }`}
                            />
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-semibold text-cyan-50">
                              Axie {axie.metadata.class}
                            </div>
                            <div className="text-xs font-semibold text-magma-gold">
                              #{axie.tokenId}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}

              {selectedCategory === GeodeCategory.TANQUE &&
                selectedAxieIds.length === requiredAxieCount &&
                !selectedHasPlant && (
                  <div className="mt-4 border border-magma-orange/35 bg-orange-500/10 p-3 text-sm text-magma-orange">
                    Tanque requires at least one Plant Axie.
                  </div>
                )}
              {!hasEnoughAxies && (
                <div className="mt-4 border border-ethereal-cyan/25 bg-cyan-300/8 p-3 text-sm text-cyan-50/62">
                  You need more fake Axies for this category. Claim another
                  testnet set using the faucet.
                </div>
              )}
            </Card>

            <div className="mt-10 flex w-full flex-col gap-3 px-4 sm:w-auto sm:flex-row sm:gap-4 sm:px-0">
              <Button
                variant="outline"
                onClick={() => setWizardStep(2)}
                className="w-full rounded-none border-cyan-100/20 bg-black/30 px-8 sm:w-auto"
              >
                Atrás
              </Button>
              <Button
                variant="primary"
                onClick={() => setWizardStep(4)}
                disabled={!hasRequiredAxieSelection}
                className="w-full rounded-none border-ethereal-cyan/55 bg-cyan-300/14 px-10 text-cyan-50 shadow-[0_0_28px_rgba(125,249,255,0.16)] hover:bg-cyan-300/22 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
              >
                {hasRequiredAxieSelection
                  ? "Continuar"
                  : "Select required fake Axies"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ───── STEP 4 ───── */}
        {wizardStep === 4 && selectedClass !== undefined && (
          <div className="flex w-full max-w-lg flex-col items-center">
            <button
              type="button"
              onClick={() => setWizardStep(3)}
              className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-cyan-50/50 transition-colors hover:text-cyan-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver
            </button>
            <h2 className="alchemy-heading-strong text-balance text-center text-3xl leading-tight md:text-5xl mb-2">
              4. Mementos Extra
            </h2>
            <p className="mb-8 max-w-md text-center text-sm text-cyan-50/60">
              Reduce la probabilidad de fallo usando mementos extra
            </p>

            <div className="mb-8 flex flex-col items-center gap-4">
              <div className="relative" style={{ width: 140, height: 140 }}>
                <GlossImageFill
                  src={`/assets/mementos/${mementoFileMap[selectedClass]}`}
                  alt="Memento"
                  className="h-[140px] w-[140px]"
                />
              </div>
              <div className="text-center">
                <div className="text-sm text-cyan-50/60">
                  Disponibles:{" "}
                  <span className="font-bold text-ethereal-cyan">
                    {mementoBalances?.[selectedClass]?.formatted ?? "0"}
                  </span>{" "}
                  {classInfo.displayName} Mementos
                </div>
              </div>
            </div>

            {/* Percentage selector */}
            {(() => {
              const maxReduction = baseFailureChance;
              const step = Math.max(1, Math.ceil(maxReduction / 5));
              const options: number[] = [];
              for (let p = 0; p <= maxReduction; p += step) {
                options.push(p);
              }
              if (options[options.length - 1] !== maxReduction) {
                options.push(maxReduction);
              }
              return (
                <div className="flex w-full max-w-md flex-wrap items-center justify-center gap-3">
                  {options.map((pct) => {
                    const mementos = pct * 10;
                    const isActive = mementosToUse === mementos;
                    return (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setMementosToUse(mementos)}
                        className={`inline-flex flex-col items-center justify-center border px-4 py-3 transition-all ${
                          isActive
                            ? "border-ethereal-cyan/60 bg-cyan-300/15 text-cyan-50 shadow-[0_0_20px_rgba(125,249,255,0.12)]"
                            : "border-cyan-100/12 bg-black/42 text-cyan-50/70 hover:border-cyan-100/25 hover:text-cyan-50"
                        }`}
                      >
                        <span className="alchemy-heading-strong text-lg leading-none">
                          {pct}%
                        </span>
                        <span className="mt-1 text-[10px] uppercase tracking-wider text-cyan-50/50">
                          {mementos} mementos
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })()}

            {mementosToUse > 0 && (
              <div className="mt-6 border border-ethereal-cyan/35 bg-cyan-300/10 px-6 py-3">
                <div className="text-sm text-ethereal-cyan">
                  Reducción de fallo: -{reduction}% · {mementosToUse} mementos
                </div>
              </div>
            )}

            <div className="mt-10 flex w-full flex-col gap-3 px-4 sm:w-auto sm:flex-row sm:gap-4 sm:px-0">
              <Button
                variant="outline"
                onClick={() => setWizardStep(3)}
                className="w-full rounded-none border-cyan-100/20 bg-black/30 px-8 sm:w-auto"
              >
                Atrás
              </Button>
              <Button
                variant="primary"
                onClick={() => setWizardStep(5)}
                className="w-full rounded-none border-ethereal-cyan/55 bg-cyan-300/14 px-10 text-cyan-50 shadow-[0_0_28px_rgba(125,249,255,0.16)] hover:bg-cyan-300/22 sm:w-auto"
              >
                Continuar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ───── STEP 5 ───── */}
        {wizardStep === 5 && (
          <div className="relative flex w-full flex-col items-center">
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                maskImage:
                  "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
              }}
            >
              <ForgeShader heat={transmutationHeat} maxFps={30} />
            </div>
            <div className="relative z-10 flex w-full max-w-xl flex-col items-center px-4 sm:px-0">
              <button
                type="button"
                onClick={() => setWizardStep(4)}
                className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-cyan-50/50 transition-colors hover:text-cyan-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Volver
              </button>
              <h2 className="alchemy-heading-strong text-balance text-center text-3xl leading-tight md:text-5xl mb-2">
                5. Resumen de Forja
              </h2>
              <p className="mb-8 text-center text-sm text-cyan-50/60">
                Verifica los costos antes de continuar
              </p>

              <div className="mb-6 text-center">
                <h3 className="alchemy-heading-strong text-2xl">{geodeName}</h3>
                <div className="mt-3 flex justify-center gap-2">
                  <Badge
                    className="rounded-none border text-xs"
                    style={{
                      backgroundColor: `${categoryInfo.color}40`,
                      borderColor: categoryInfo.color,
                      color: categoryInfo.color,
                    }}
                  >
                    {categoryInfo.name}
                  </Badge>
                  <Badge
                    className="rounded-none border text-xs"
                    style={{
                      backgroundColor: `${classInfo.color}40`,
                      borderColor: classInfo.color,
                      color: classInfo.color,
                    }}
                  >
                    {classInfo.displayName}
                  </Badge>
                </div>
              </div>

              {/* Floating assets */}
              <div className="mb-6 flex flex-wrap items-end justify-center gap-6 sm:gap-10">
                {/* AXS */}
                <div className="flex flex-col items-center gap-2">
                  <Image
                    src="/assets/axies/axs-icon.webp"
                    alt="AXS"
                    width={56}
                    height={56}
                    className="h-12 w-12 object-contain drop-shadow-[0_0_12px_rgba(125,249,255,0.35)]"
                  />
                  <span className="alchemy-heading text-lg text-magma-gold">
                    {axsCost}
                  </span>
                  <span className="text-xs uppercase tracking-widest text-cyan-50/60">
                    AXS
                  </span>
                </div>

                {/* Axies */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex -space-x-3">
                    {selectedAxieIds
                      .map((id) => availableAxies.find((a) => a.tokenId === id))
                      .filter((axie): axie is AxieNFT => axie !== undefined)
                      .map((axie, i) => (
                        <Image
                          key={axie.tokenId}
                          src={getAxieImagePath(axie.metadata.class)}
                          alt={axie.metadata.class}
                          width={64}
                          height={64}
                          className="h-14 w-14 object-contain drop-shadow-[0_0_12px_rgba(125,249,255,0.35)]"
                          style={{ zIndex: 10 - i }}
                        />
                      ))}
                  </div>
                  <span className="alchemy-heading text-lg text-magma-gold">
                    {selectedAxieIds.length}/{requiredAxieCount || 0}
                  </span>
                  <span className="text-xs uppercase tracking-widest text-cyan-50/60">
                    Axies
                  </span>
                </div>

                {/* Mementos */}
                <div className="flex flex-col items-center gap-2">
                  <Image
                    src={
                      selectedClass !== undefined
                        ? `/assets/mementos/${mementoFileMap[selectedClass]}`
                        : `/assets/mementos/${mementoFileMap[AxieClass.BEAST]}`
                    }
                    alt="Memento"
                    width={56}
                    height={56}
                    className="h-12 w-12 rounded-full object-contain drop-shadow-[0_0_12px_rgba(125,249,255,0.35)]"
                  />
                  <span className="alchemy-heading text-lg text-magma-gold">
                    {totalMementoCost}
                  </span>
                  <span className="text-xs uppercase tracking-widest text-cyan-50/60">
                    Mementos
                  </span>
                </div>
              </div>

              {/* Failure chance */}
              <div className="mb-6 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-sm uppercase tracking-widest text-magma-gold">
                  <ShieldAlert className="h-4 w-4 text-magma-orange" />
                  Probabilidad de Fallo
                  <span className="alchemy-heading-strong text-xl">
                    {currentFailureChance}%
                  </span>
                </div>
                <div className="h-1.5 w-56 bg-black/55">
                  <div
                    className="h-1.5 bg-linear-to-r from-magma-gold to-magma-orange transition-all"
                    style={{ width: `${currentFailureChance}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="mb-6 flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-cyan-50/50">Rareza:</span>
                  <span
                    className="font-medium"
                    style={{ color: categoryInfo.color }}
                  >
                    {categoryInfo.rarity}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-cyan-50/50">Poder:</span>
                  <span className="font-bold text-ethereal-cyan">
                    {categoryInfo.miningPower}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-cyan-50/50">Supply:</span>
                  <span>{categoryInfo.maxSupply.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-cyan-50/50">Bonus:</span>
                  <span className="text-magma-gold">
                    {categoryInfo.collectionBonus}%
                  </span>
                </div>
              </div>

              {stakedAxiesCount > 0 && (
                <div className="mb-6">
                  <AxieBonusIndicator
                    stakedAxiesCount={stakedAxiesCount}
                    bonusPerAxie={10}
                    variant="compact"
                  />
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                className="w-full max-w-md rounded-none border border-ethereal-cyan/55 bg-none from-transparent to-transparent bg-cyan-300/14 text-cyan-50 shadow-[0_0_28px_rgba(125,249,255,0.16)] hover:border-ethereal-cyan hover:bg-cyan-300/22 hover:from-transparent hover:to-transparent hover:text-white focus:ring-cyan-300/75"
                onClick={handleTransmute}
                disabled={
                  isTransmuting ||
                  selectedCategory === undefined ||
                  selectedClass === undefined ||
                  !hasRequiredAxieSelection ||
                  !hasAccessToCategory
                }
              >
                {!hasAccessToCategory
                  ? "Requiere Mayor Trust Score"
                  : selectedCategory === undefined
                    ? "Selecciona una categoría"
                    : selectedClass === undefined
                      ? "Selecciona una clase de Axie"
                      : !hasRequiredAxieSelection
                        ? "Select required fake Axies"
                        : isTransmuting
                          ? "Transmutando..."
                          : "Continuar"}
              </Button>
            </div>
          </div>
        )}

        {/* ───── STEP 7 ───── */}
        {wizardStep === 7 && (
          <div className="flex w-full max-w-lg flex-col items-center px-4 sm:px-0">
            <button
              type="button"
              onClick={() => setWizardStep(5)}
              className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-cyan-50/50 transition-colors hover:text-cyan-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver
            </button>
            <h2 className="alchemy-heading-strong text-balance text-center text-3xl leading-tight md:text-5xl mb-2">
              {forgeStep === "success" ? "¡Forja Exitosa!" : "Forjar Geoda"}
            </h2>

            {forgeStep === "success" &&
              forgedGeodeId &&
              selectedCategory !== undefined &&
              selectedClass !== undefined && (
                <div className="flex flex-col items-center gap-6">
                  <div className="relative h-[240px] w-[240px] sm:h-[280px] sm:w-[280px] md:h-[300px] md:w-[300px] overflow-hidden rounded-xl border border-cyan-100/10 shadow-[0_0_40px_rgba(125,249,255,0.08)]">
                    <GeodeVideo
                      category={selectedCategory}
                      axieClass={selectedClass}
                      className="h-full w-full"
                      autoPlay={true}
                    />
                  </div>
                  <div className="text-center">
                    <div className="alchemy-heading-strong text-2xl">
                      {geodeName}
                    </div>
                    <div className="mt-2 text-sm text-cyan-50/60">
                      Token ID: {forgedGeodeId.toString()}
                    </div>
                  </div>
                  <div className="flex w-full flex-col gap-3 px-4 sm:w-auto sm:flex-row sm:gap-4 sm:px-0">
                    <Link
                      href="/inventory"
                      className="inline-flex min-h-11 items-center justify-center gap-2 border border-ethereal-cyan/55 bg-cyan-300/14 px-6 py-2 text-sm font-semibold uppercase text-cyan-50 transition-all hover:bg-cyan-300/22"
                    >
                      Ver Inventario
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setWizardStep(1);
                        setSelectedCategory(undefined);
                        setSelectedClass(undefined);
                        setMementosToUse(0);
                        setSelectedAxieIds([]);
                        setForgeStep("select");
                        setForgeFailed(false);
                        setForgedGeodeId(null);
                        setIsTransmuting(false);
                        setTransmutationHeat(0);
                      }}
                      className="w-full rounded-none border-cyan-100/20 bg-black/30 px-6 sm:w-auto"
                    >
                      Forjar otra
                    </Button>
                  </div>
                </div>
              )}

            {_forgeFailed && (
              <div className="flex flex-col items-center gap-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-red-400/50 bg-red-500/10">
                  <ShieldAlert className="h-10 w-10 text-red-400" />
                </div>
                <div className="text-center">
                  <div className="alchemy-heading-strong text-2xl text-red-400">
                    La forja falló
                  </div>
                  <div className="mt-2 text-sm text-cyan-50/60">
                    Probabilidad de fallo: {currentFailureChance}%
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setWizardStep(1);
                    setSelectedCategory(undefined);
                    setSelectedClass(undefined);
                    setMementosToUse(0);
                    setSelectedAxieIds([]);
                    setForgeStep("select");
                    setForgeFailed(false);
                    setForgedGeodeId(null);
                    setIsTransmuting(false);
                    setTransmutationHeat(0);
                  }}
                  className="w-full rounded-none border-cyan-100/20 bg-black/30 px-8 sm:w-auto"
                >
                  Intentar de nuevo
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </main>
  );
}
