import { useQuery } from "@tanstack/react-query";

let sdkInitialized = false;

export default function useZamaRelayerInstance() {
  const { data, isLoading, isError, error, status } = useQuery({
    queryKey: ["zamaRelayerInstance"],
    queryFn: async () => {
      console.debug("🔍 [ZamaRelayer] Starting initialization...");

      if (typeof window === "undefined") {
        return null;
      }

      console.debug("🔍 [ZamaRelayer] window.relayerSDK exists:", !!window.relayerSDK);

      if (!window.relayerSDK) {
        console.error("❌ [ZamaRelayer] Relayer SDK not loaded on window object");
        throw new Error("Relayer SDK not loaded on window object");
      }

      console.debug("🔍 [ZamaRelayer] Extracting SDK functions...");
      console.debug("🔍 [ZamaRelayer] window.relayerSDK keys (before init):", Object.keys(window.relayerSDK || {}));

      const { initSDK, createInstance } = window.relayerSDK;
      console.debug("🔍 [ZamaRelayer] SDK functions extracted:", {
        hasInitSDK: typeof initSDK === "function",
        hasCreateInstance: typeof createInstance === "function",
        sdkInitialized,
      });

      if (typeof initSDK !== "function") {
        console.error("❌ [ZamaRelayer] initSDK is not a function");
        throw new Error("initSDK is not available on window.relayerSDK");
      }

      if (typeof createInstance !== "function") {
        console.error("❌ [ZamaRelayer] createInstance is not a function");
        throw new Error("createInstance is not available on window.relayerSDK");
      }

      // Initialize the SDK first to load WASM modules
      if (!sdkInitialized) {
        console.debug("🔍 [ZamaRelayer] Calling initSDK()...");
        const startTime = Date.now();
        try {
          const initResult = await initSDK();
          const duration = Date.now() - startTime;
          console.debug(`✅ [ZamaRelayer] initSDK() completed in ${duration}ms, result:`, initResult);
        } catch (initError) {
          const duration = Date.now() - startTime;
          console.error(`❌ [ZamaRelayer] initSDK() failed after ${duration}ms:`, initError);
          throw initError;
        }
        sdkInitialized = true;
        console.debug("🚀 [ZamaRelayer] SDK initialized successfully");
      } else {
        console.debug("🔍 [ZamaRelayer] SDK already initialized, skipping initSDK()");
      }

      // Get config after initSDK - try ZamaEthereumConfig first, then fallback to SepoliaConfig
      console.debug("🔍 [ZamaRelayer] window.relayerSDK keys (after init):", Object.keys(window.relayerSDK || {}));

      // Try to get config - SDK v0.1.0-9 uses SepoliaConfig, newer versions may use ZamaEthereumConfig
      const config = window.relayerSDK.ZamaEthereumConfig || window.relayerSDK.SepoliaConfig;

      if (config) {
        config.relayerUrl = "https://relayer.testnet.zama.org";
        config.network = "https://ethereum-sepolia-rpc.publicnode.com";
        config.aclContractAddress = "0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D";
        config.kmsContractAddress = "0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A";
        config.inputVerifierContractAddress = "0xBBC1fFCdc7C316aAAd72E807D9b0272BE8F84DA0";
        config.verifyingContractAddressDecryption = "0x5D8BD78e2ea6bbE41f26dFe9fdaEAa349e077478";
        config.verifyingContractAddressInputVerification = "0x483b9dE06E4E4C7D35CCf5837A1668487406D955";
        config.gatewayChainId = 10901;
      }

      console.log("🔍 [ZamaRelayer] Config:", config);
      // console.debug("🔍 [ZamaRelayer] Config check:", {
      //   hasZamaEthereumConfig: !!window.relayerSDK.ZamaEthereumConfig,
      //   hasSepoliaConfig: !!window.relayerSDK.SepoliaConfig,
      //   configType: typeof config,
      //   configValue: config,
      //   configKeys: config ? Object.keys(config) : null,
      //   allWindowRelayerSDKKeys: Object.keys(window.relayerSDK),
      // });

      // Validate config before proceeding
      if (!config) {
        console.error("❌ [ZamaRelayer] Neither ZamaEthereumConfig nor SepoliaConfig is available after initSDK()");
        console.error("❌ [ZamaRelayer] Available properties on window.relayerSDK:", Object.keys(window.relayerSDK));
        console.error("❌ [ZamaRelayer] Full window.relayerSDK object:", window.relayerSDK);
        throw new Error(
          "Config (ZamaEthereumConfig or SepoliaConfig) is not available on window.relayerSDK after initialization"
        );
      }

      if (typeof config !== "object") {
        console.error("❌ [ZamaRelayer] Config is not an object:", typeof config);
        throw new Error(`Config is not an object, got: ${typeof config}`);
      }

      // Check for required property
      if (!("verifyingContractAddressDecryption" in config)) {
        console.error("❌ [ZamaRelayer] Config missing 'verifyingContractAddressDecryption' property");
        console.error("❌ [ZamaRelayer] Config structure:", JSON.stringify(config, null, 2));
        throw new Error("Config is missing required property: verifyingContractAddressDecryption");
      }

      // Now create the instance with config
      console.debug("🔍 [ZamaRelayer] Calling createInstance()...");
      console.debug("🔍 [ZamaRelayer] Config being passed:", {
        type: typeof config,
        keys: Object.keys(config),
        hasVerifyingContract: "verifyingContractAddressDecryption" in config,
        config: config,
      });
      const startTime = Date.now();
      try {
        const instance = await createInstance(config);
        const duration = Date.now() - startTime;
        console.debug(`✅ [ZamaRelayer] createInstance() completed in ${duration}ms`);
        console.debug("🔍 [ZamaRelayer] Instance created:", {
          hasInstance: !!instance,
          instanceType: typeof instance,
        });
        return instance;
      } catch (createError) {
        const duration = Date.now() - startTime;
        console.error(`❌ [ZamaRelayer] createInstance() failed after ${duration}ms:`, createError);
        throw createError;
      }
    },
    enabled: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: (failureCount: number) => {
      console.debug(
        `🔍 [ZamaRelayer] Retry attempt ${failureCount}, window.relayerSDK exists:`,
        typeof window !== "undefined" && !!window.relayerSDK
      );
      if (typeof window !== "undefined" && !window.relayerSDK && failureCount < 10) {
        console.error("❌ [ZamaRelayer] Relayer SDK not found on window object.");
        return true; // Retry to wait for SDK to load
      }
      return false;
    },
    retryDelay: 1_000,
    staleTime: 60 * 60_000,
  });

  // Log query state changes
  console.debug("🔍 [ZamaRelayer] Query state:", {
    status,
    isLoading,
    isError,
    hasData: !!data,
    error: error
      ? {
          message: error.message,
          name: error.name,
          stack: error.stack,
        }
      : null,
  });

  return data;
}
