import { FhevmInstance, FhevmInstanceConfig, KMSInput, TFHEInput } from "@zama-fhe/relayer-sdk/web";

// Extend the Window interface to include relayerSDK
declare global {
  interface Window {
    relayerSDK: {
      initSDK: ({
        tfheParams,
        kmsParams,
        thread,
      }?: {
        tfheParams?: TFHEInput;
        kmsParams?: KMSInput;
        thread?: number;
      }) => Promise<boolean>;
      createInstance: (config: FhevmInstanceConfig) => Promise<FhevmInstance>;
      ZamaEthereumConfig?: FhevmInstanceConfig;
      SepoliaConfig?: FhevmInstanceConfig;
      [key: string]: any;
    };
  }
}
