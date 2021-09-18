import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";
import { ethers, Contract } from "ethers";
import { Wallet as OnboardWallet } from "bnc-onboard/dist/src/interfaces";

import { initOnboard, MAINNET_NETWORK_ID } from "./walletConfig";

import { contract as depositContractData } from "../contracts/BridgeDeposit";

const OVM_JSON_RPC_URL = "https://mainnet.optimism.io";
const OVM_NETWORK_ID = 10;
const walletL2 = "0x59C47ceC65ad592F6C83ABd020BfD8fF0172D77D";
const WALLET_STORAGE_KEY = "cachedWallet";

const useConnector = () => {
  const [provider, setProvider] = useState<ethers.providers.Provider | null>(
    null
  );
  const [onboard, setOnboard] = useState<ReturnType<typeof initOnboard> | null>(
    null
  );
  const [
    providerL2,
    setProviderL2,
  ] = useState<ethers.providers.Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [
    depositContract,
    setDepositContract,
  ] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    const cachedWallet = window.localStorage.getItem(WALLET_STORAGE_KEY);
    if (onboard && cachedWallet && !walletAddress) {
      onboard.walletSelect(cachedWallet);
    }
  }, [onboard, walletAddress]);

  useEffect(() => {
    const onboard = initOnboard({
      network: (networkId: number) => {
        if (networkId === MAINNET_NETWORK_ID) {
          const provider = new ethers.providers.Web3Provider(
            onboard.getState().wallet.provider
          );
          const providerL2 = new ethers.providers.JsonRpcProvider(
            OVM_JSON_RPC_URL,
            OVM_NETWORK_ID
          );
          const signer = provider.getSigner();
          const contract = new Contract(
            depositContractData.address,
            depositContractData.abi,
            provider
          );

          onboard.config({ networkId });

          setProvider(provider);
          setProviderL2(providerL2);
          setSigner(signer);
          setDepositContract(contract);
        }
      },
      wallet: async (wallet: OnboardWallet) => {
        if (wallet.provider) {
          const provider = new ethers.providers.Web3Provider(wallet.provider);
          const providerL2 = new ethers.providers.JsonRpcProvider(
            OVM_JSON_RPC_URL,
            OVM_NETWORK_ID
          );

          setProvider(provider);
          setProviderL2(providerL2);
          setSigner(provider.getSigner());

          if (wallet.name) {
            window.localStorage.setItem(WALLET_STORAGE_KEY, wallet.name);
          }
        } else {
          setSigner(null);
          setWalletAddress(null);
        }
      },
      address: (address) => {
        if (address) {
          setWalletAddress(address);
        }
      },
    });

    setOnboard(onboard);
  }, []);

  const connectWallet = async () => {
    try {
      if (onboard) {
        onboard.walletReset();
        const success = await onboard.walletSelect();
        if (success) {
          await onboard.walletCheck();
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const disconnectWallet = async () => {
    try {
      if (onboard) {
        onboard.walletReset();
        window.localStorage.removeItem(WALLET_STORAGE_KEY);
      }
    } catch (e) {
      console.log(e);
    }
  };

  return {
    provider,
    signer,
    depositContract,
    walletAddress,
    walletL2,
    providerL2,
    connectWallet,
    disconnectWallet,
  };
};

const Connector = createContainer(useConnector);

export default Connector;
