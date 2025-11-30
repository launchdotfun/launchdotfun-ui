import {
  ERC20,
  ERC20__factory,
  LaunchDotFunPresale,
  LaunchDotFunPresale__factory,
  LaunchDotFunPresaleFactory,
  LaunchDotFunPresaleFactory__factory,
  LaunchDotFunTokenFactory,
  LaunchDotFunTokenFactory__factory,
  LaunchDotFunTokenWrapper,
  LaunchDotFunTokenWrapper__factory,
  LaunchDotFunWETH,
  LaunchDotFunWETH__factory,
} from "@/web3/contracts";
import { ZAMA_WETH_ADDRESS, ZAMA_PRESALE_FACTORY_ADDRESS, ZAMA_TOKEN_FACTORY_ADDRESS } from "@/web3/core/constants";
import { BaseContract, Contract, isAddress } from "ethers";
import { useMemo } from "react";
import { zeroAddress } from "viem";
import { useEthersProvider } from "./useEthersProvider";
import { useEthersSigner } from "./useEthersSigner";
import useWeb3 from "./useWeb3";

export default function useContract<T extends BaseContract = BaseContract>(
  addressOrAddressMap: string | { [chainId: number]: string } | undefined,
  ABI: any,
  withSigner = false,
  _chainId?: number
): T | null {
  const { chain } = useWeb3();
  const chainId = Number(_chainId ?? chain.id);
  const provider = useEthersProvider({ chainId });
  const signer = useEthersSigner({ chainId });

  return useMemo(() => {
    if (!addressOrAddressMap || !ABI || !provider || !chainId) return null;
    let address: string | undefined;
    if (typeof addressOrAddressMap === "string") address = addressOrAddressMap;
    else address = addressOrAddressMap[chainId];

    if (!address) return null;

    try {
      if (!isAddress(address) || address === zeroAddress) {
        throw Error(`Invalid address: ${address}.`);
      }
      if (withSigner && !signer) return null;
      if (withSigner && signer) {
        return new Contract(address, ABI, signer) as unknown as T;
      } else if (provider) {
        return new Contract(address, ABI, provider) as unknown as T;
      }
      return null;
    } catch (error) {
      console.error("Failed to get contract", error);
      return null;
    }
  }, [addressOrAddressMap, ABI, provider, chainId, withSigner, signer]);
}

export function useErc20ContractRead(tokenAddress?: string) {
  return useContract<ERC20>(tokenAddress, ERC20__factory.abi, false);
}

export function useErc20ContractWrite(tokenAddress?: string) {
  return useContract<ERC20>(tokenAddress, ERC20__factory.abi, true);
}

export function useZamaTokenWrapperContractRead(tokenAddress?: string) {
  return useContract<LaunchDotFunTokenWrapper>(tokenAddress, LaunchDotFunTokenWrapper__factory.abi, false);
}

export function useZamaTokenWrapperContractWrite(tokenAddress?: string) {
  return useContract<LaunchDotFunTokenWrapper>(tokenAddress, LaunchDotFunTokenWrapper__factory.abi, true);
}

export function useTokenFactoryContractWrite() {
  return useContract<LaunchDotFunTokenFactory>(ZAMA_TOKEN_FACTORY_ADDRESS, LaunchDotFunTokenFactory__factory.abi, true);
}

export function usePresaleFactoryContractWrite() {
  return useContract<LaunchDotFunPresaleFactory>(
    ZAMA_PRESALE_FACTORY_ADDRESS,
    LaunchDotFunPresaleFactory__factory.abi,
    true
  );
}

export function useZamaWETHContractWrite() {
  return useContract<LaunchDotFunWETH>(ZAMA_WETH_ADDRESS, LaunchDotFunWETH__factory.abi, true);
}

export function useZamaPresaleContractWrite(presaleAddress?: string) {
  return useContract<LaunchDotFunPresale>(presaleAddress, LaunchDotFunPresale__factory.abi, true);
}
