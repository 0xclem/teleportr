import onboard from "bnc-onboard";
import { Subscriptions } from "bnc-onboard/dist/src/interfaces";

const INFURA_RPC_URL = `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`;
export const MAINNET_NETWORK_ID = 1;

export const initOnboard = (subscriptions: Subscriptions) => {
  return onboard({
    dappId: process.env.NEXT_PUBLIC_BN_ONBOARD_API_KEY,
    hideBranding: true,
    networkId: MAINNET_NETWORK_ID,
    subscriptions,
    darkMode: true,
    walletSelect: {
      wallets: [
        { walletName: "metamask", preferred: true },
        {
          walletName: "ledger",
          rpcUrl: INFURA_RPC_URL,
          preferred: true,
        },
        {
          walletName: "trezor",
          appUrl: "https://www.synthetix.io",
          email: "info@synthetix.io",
          rpcUrl: INFURA_RPC_URL,
          preferred: true,
        },
        {
          walletName: "walletConnect",
          rpc: { [MAINNET_NETWORK_ID]: INFURA_RPC_URL },
          preferred: true,
        },
        { walletName: "trust", rpcUrl: INFURA_RPC_URL },
        { walletName: "walletLink", rpcUrl: INFURA_RPC_URL, preferred: true },
      ],
    },
    walletCheck: [
      { checkName: "derivationPath" },
      { checkName: "accounts" },
      { checkName: "connect" },
    ],
  });
};
