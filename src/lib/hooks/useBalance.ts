import { LaunchDotFunWETH__factory } from "@/web3/contracts";
import { Z_WETH9 } from "@/web3/core/constants";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ethers } from "ethers";
import { Address, formatUnits } from "viem";
import { usePublicClient } from "wagmi";
import { GetBalanceData } from "wagmi/query";
import { useEthersSigner } from "./useEthersSigner";
import useWeb3 from "./useWeb3";
import useZamaRelayerInstance from "./useZamaRelayerInstance";

export type UseCommonBalancesOptions = UseMutationOptions<GetBalanceData>;

export function useZWETHBalanceMutation(address?: string, options?: UseCommonBalancesOptions) {
  const { chainId } = useWeb3();
  const zWETH = Z_WETH9[chainId];
  const signer = useEthersSigner({ chainId });
  const publicClient = usePublicClient({ chainId });
  const relayerInstance = useZamaRelayerInstance();

  return useMutation({
    mutationKey: ["zwethBalance", address, chainId],
    mutationFn: async () => {
      if (!zWETH || !signer || !publicClient || !relayerInstance)
        throw new Error("Missing dependencies for ZWETH balance query");

      const [ciphertextHandle] = await publicClient!.multicall({
        contracts: [
          {
            address: zWETH.address as Address,
            abi: LaunchDotFunWETH__factory.abi,
            functionName: "confidentialBalanceOf",
            args: [address as Address],
          },
        ],
        allowFailure: false,
      });

      let value = BigInt(0);
      if (ciphertextHandle !== ethers.ZeroHash) {
        const keypair = relayerInstance!.generateKeypair();
        const handleContractPairs = [
          {
            handle: ciphertextHandle,
            contractAddress: zWETH.address,
          },
        ];
        const startTimeStamp = Math.floor(Date.now() / 1000).toString();
        const durationDays = "1";
        const contractAddresses = [zWETH.address];

        const eip712 = relayerInstance!.createEIP712(
          keypair.publicKey,
          contractAddresses,
          startTimeStamp,
          durationDays
        );

        const signature = await signer!.signTypedData(
          eip712.domain,
          {
            UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
          },
          eip712.message
        );

        const result = await relayerInstance!.userDecrypt(
          handleContractPairs,
          keypair.privateKey,
          keypair.publicKey,
          signature.replace("0x", ""),
          contractAddresses,
          signer!.address,
          startTimeStamp,
          durationDays
        );

        value = result[ciphertextHandle] as bigint;
      }

      return {
        decimals: zWETH.decimals,
        symbol: zWETH.symbol || "zWETH",
        value: value,
        formatted: formatUnits(value, zWETH.decimals),
      };
    },
    retry: 0,
    ...options,
  });
}
