import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";
import { ethers, providers, Contract } from "ethers";
import { useRecoilValue } from "recoil";

import { walletState } from "../store/wallet";
import { contract as depositContractData } from "../contracts/BridgeDeposit";

const OVM_JSON_RPC_URL = "https://kovan.optimism.io";
const OVM_NETWORK_ID = 69;
const walletL2 = "0x59C47ceC65ad592F6C83ABd020BfD8fF0172D77D";

const useConnector = () => {
  const [network, setNetwork] = useState<number | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Provider | null>(
    null
  );
  const [providerL2, setProviderL2] =
    useState<ethers.providers.Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [depositContract, setDepositContract] =
    useState<ethers.Contract | null>(null);
  const connectedWallet = useRecoilValue(walletState);

  useEffect(() => {
    if (!connectedWallet) return;
    const web3Provider = new providers.Web3Provider(
      window.ethereum as providers.ExternalProvider
    );
    const web3ProviderL2 = new ethers.providers.JsonRpcProvider(
      OVM_JSON_RPC_URL,
      OVM_NETWORK_ID
    );
    const contract = new Contract(
      depositContractData.address,
      depositContractData.abi,
      web3Provider
    );
    setProvider(web3Provider);
    setProviderL2(web3ProviderL2);
    setSigner(web3Provider.getSigner());
    setDepositContract(contract);
  }, [connectedWallet]);

  return {
    network,
    provider,
    signer,
    depositContract,
    wallet: connectedWallet,
    walletL2,
    providerL2,
  };
};

const Connector = createContainer(useConnector);

export default Connector;
