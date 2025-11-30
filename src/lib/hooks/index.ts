// Shared/Infrastructure hooks - used across multiple domains
// Domain-specific hooks are in tokens/hooks.ts and presales/hooks.ts

export { default as useWeb3 } from "./useWeb3";
export {
  default as useContract,
  useErc20ContractRead,
  useErc20ContractWrite,
  useZamaTokenWrapperContractRead,
  useZamaTokenWrapperContractWrite,
  useTokenFactoryContractWrite,
  usePresaleFactoryContractWrite,
  useZamaWETHContractWrite,
  useZamaPresaleContractWrite,
} from "./useContract";
export { useZWETHBalanceMutation } from "./useBalance";
export {
  default as useApproveCallback,
  ApprovalState,
  useTokenAllowance,
  useConfidentialTokenApproval,
  useConfidentialApproveCallback,
} from "./useApproveCallback";
export { useEthersProvider } from "./useEthersProvider";
export { useEthersSigner } from "./useEthersSigner";
export { useUploadFile } from "./useUploadFile";
export { default as useTimerCountdown } from "./useTimerCountdown";
export { default as useZamaRelayerInstance } from "./useZamaRelayerInstance";
