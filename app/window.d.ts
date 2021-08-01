import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: {
      on: (event: string, cb: (arg?: any) => void) => void;
      ethereum: ethers.providers.Provider | undefined;
      isMetaMask: boolean;
      request: (args: { method: string }) => any;
    };
  }
}
