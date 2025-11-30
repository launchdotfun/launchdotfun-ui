import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { Chain, sepolia } from "@reown/appkit/networks";

// Get projectId from https://cloud.reown.com
export const projectId = "4d8f52da0aa95a4e6bcc34ae17f4eae5";

if (!projectId) {
  throw new Error("Project ID is not defined");
}

export const networks: Chain[] = [sepolia];
// eslint-disable-next-line prefer-const
let defaultChain: Chain = sepolia;

export { defaultChain };

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks,
  // storage: createStorage({
  //   storage: cookieStorage,
  // }),
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
