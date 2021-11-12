import { useEffect, useState } from "react";
import styled from "styled-components";
import { BigNumber, ethers } from "ethers";
import Image from "next/image";

import { contract as depositContractData } from "../../contracts/BridgeDeposit";
import Connector from "../../containers/Connector";
import CurrencySelect from "../../components/CurrencySelect";
import controlPanelArrow from "../../public/img/control-panel-arrow.svg";
import ethIconCircle from "../../public/img/eth-icon-circle.svg";
import opIconCircle from "../../public/img/op-icon-circle.svg";

const GAS_LIMIT_BUFFER = 1000;
const MIN_DEPOSIT_AMOUNT = 0.001;

type ContractInfo = {
  maxDepositAmount: number;
  maxBalance: number;
  contractBalance: number;
  isEnabled: boolean;
};

type EtherBalance = {
  balanceBN: BigNumber;
  balance: number;
};

const Swapper = () => {
  const {
    depositContract,
    walletAddress,
    provider,
    signer,
    providerL2,
    walletL2,
    connectWallet,
  } = Connector.useContainer();
  const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null);
  const [ethBalance, setEthBalance] = useState<EtherBalance | null>(null);
  const [burnerWalletBalance, setBurnerWalletBalance] = useState<number | null>(
    null
  );
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [gasLimit, setGasLimit] = useState<number | null>(null);

  useEffect(() => {
    const fetchContractData = async () => {
      if (
        !walletAddress ||
        !depositContract ||
        !provider ||
        !providerL2 ||
        !walletL2
      )
        return;
      try {
        const [
          maxDepositAmount,
          maxBalance,
          canReceive,
          ethBalance,
          burnerWalletEthBalance,
          contractBalance,
        ] = await Promise.all([
          depositContract.getMaxDepositAmount(),
          depositContract.getMaxBalance(),
          depositContract.getCanReceiveDeposit(),
          provider.getBalance(walletAddress),
          providerL2.getBalance(walletL2),
          provider.getBalance(depositContractData.address),
        ]);
        setContractInfo({
          maxDepositAmount: maxDepositAmount / 1e18,
          maxBalance: maxBalance / 1e18,
          contractBalance: Number(contractBalance) / 1e18,
          isEnabled: !!canReceive,
        });
        setEthBalance({
          balanceBN: ethBalance,
          balance: Number(ethBalance) / 1e18,
        });
        setBurnerWalletBalance(Number(burnerWalletEthBalance) / 1e18);
      } catch (e) {}
    };
    fetchContractData();
  }, [walletAddress, depositContract, provider, providerL2, walletL2]);

  useEffect(() => {
    const getGasLimit = async () => {
      if (
        !depositAmount ||
        !depositContract ||
        !signer ||
        !contractInfo ||
        !burnerWalletBalance
      )
        return;
      try {
        setError(null);
        if (Number(depositAmount) === 0) throw new Error("Incorrect amount");
        if (Number(depositAmount) > (ethBalance?.balance ?? 0)) {
          throw new Error(
            "Amount of ETH selected to Teleport is more than what is available in your wallet"
          );
        }
        if (burnerWalletBalance === 0)
          throw new Error("Burner wallet has a low balance");
        if (Number(depositAmount) > contractInfo.maxDepositAmount)
          throw new Error("Amount higher than deposit limit");
        if (Number(depositAmount) < MIN_DEPOSIT_AMOUNT)
          throw new Error(
            "Amount lower than minimum deposit amount (0.001 ETH)"
          );

        const gasEstimate = await signer.estimateGas({
          to: depositContract.address,
          value: ethers.utils.parseEther(depositAmount.toString()),
        });

        setGasLimit(Number(gasEstimate) + GAS_LIMIT_BUFFER);
      } catch (e) {
        console.log(e);
        setError(e?.error?.message ?? e.message);
      }
    };
    getGasLimit();
  }, [
    depositAmount,
    signer,
    depositContract,
    contractInfo,
    burnerWalletBalance,
    ethBalance?.balance,
  ]);

  const handleDeposit = async () => {
    if (!signer || !depositContract || !gasLimit || !provider) return;
    try {
      await signer.sendTransaction({
        to: depositContract.address,
        value: ethers.utils.parseEther(depositAmount.toString()),
        gasLimit,
      });
    } catch (e) {
      console.log(e);
      setError(e.message);
    }
  };

  return (
    <MainContainer>
      <GradientBoxWrapper>
        <GradientBox>
          <BoxSplit>
            <p>My balance: {ethBalance?.balance.toFixed(8) ?? 0} ETH</p>
            <div style={{ display: "flex" }}>
              <Image src={ethIconCircle} alt="ETH Icon" />
              <div style={{ marginLeft: 8 }}>
                <h3>Ethereum</h3>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ marginRight: 8 }}>
                    <Image src={controlPanelArrow} alt="Arrow" />
                  </div>
                  <h2>L1</h2>
                </div>
              </div>
            </div>
          </BoxSplit>

          <BoxSplit>
            <p>
              Contract balance:{" "}
              {contractInfo?.contractBalance?.toFixed(2) ?? "--"}/
              {contractInfo?.maxBalance ?? "--"} ETH
            </p>
            <div style={{ display: "flex" }}>
              <Image src={opIconCircle} alt="Optimism Icon" />
              <div style={{ marginLeft: 8, alignItems: "center" }}>
                <h3>Optimism</h3>

                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ marginRight: 8 }}>
                    <Image src={controlPanelArrow} alt="Arrow" />
                  </div>
                  <h2>L2</h2>
                </div>
              </div>
            </div>
          </BoxSplit>
        </GradientBox>
        <MainForm>
          <CurrencySelect />

          <MainFormInputContainer>
            <MainFormInputLabel>Deposit</MainFormInputLabel>
            <MainFormInput
              placeholder="0.05"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
          </MainFormInputContainer>

          <MaxPortableButton
            onClick={() => {
              setDepositAmount(
                contractInfo?.maxDepositAmount.toString() ?? "0.05"
              );
            }}
          >
            Use Max Portable: {contractInfo?.maxDepositAmount ?? "--"}ETH
          </MaxPortableButton>

          <GradientButtonWrapper>
            {walletAddress ? (
              <TeleportButton
                disabled={!!error || !gasLimit}
                onClick={handleDeposit}
              >
                Teleport Currency
              </TeleportButton>
            ) : (
              <GradientButton onClick={connectWallet}>
                Connect Wallet
              </GradientButton>
            )}
          </GradientButtonWrapper>
        </MainForm>
      </GradientBoxWrapper>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </MainContainer>
  );
};

const MainContainer = styled.div`
  margin: 90px auto 0;
`;

const ErrorMessage = styled.div`
  color: #cf1c8e;
  margin-top: 50px;
  font-family: "GT America CM";
  font-size: 17px;
  text-align: center;
`;

const GradientBoxWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 185px;
  width: 90%;
  background: linear-gradient(
    90deg,
    #170557 0%,
    #00d1ff 0%,
    #e12096 100%,
    #00d1ff 100%
  );
  margin: 0 auto;
  border-radius: 20px;
`;

const GradientBox = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  grid-gap: 316px;
  align-items: center;
  justify-content: center;
  width: calc(100% - 8px);
  height: calc(100% - 8px);

  background: #060134;
  background-clip: padding-box;
  border-radius: 16px;
`;

const MainForm = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 316px;
  height: 245px;
  margin: 0px auto;
  left: 0;
  right: 0;
`;

const GradientButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 60px;
  background: linear-gradient(
    90deg,
    #170557 0%,
    #4489ce 0%,
    #944ba9 100%,
    #00d1ff 100%
  );
  border-radius: 16px;
`;

const GradientButton = styled.button`
  width: calc(100% - 8px);
  height: calc(100% - 8px);
  cursor: pointer;
  background-color: #060134;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 17px;
  text-transform: uppercase;
  font-family: "GT America CM";
  letter-spacing: 0.46px;

  &:disabled {
    cursor: not-allowed;
  }
`;

const TeleportButton = styled(GradientButton)`
  background-color: rgba(0, 0, 0, 0.46);

  &:disabled {
    background-color: rgba(0, 0, 0, 0.6);
  }
`;

const MainFormInputContainer = styled.div`
  background-color: #1c1541;
  height: 48px;
  border-radius: 6px;
  padding: 0 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const MainFormInputLabel = styled.p`
  text-transform: uppercase;
  color: #ffffff;
  font-size: 15px;
  font-family: "GT America Bold";
  letter-spacing: 0.41px;
`;

const MainFormInput = styled.input`
  color: #ffffff;
  font-size: 15px;
  height: 100%;
  border: none;
  background-color: transparent;
  text-align: right;
  font-family: "GT America Bold";
  letter-spacing: 0.41px;

  ::placeholder {
    color: #bcbcbc;
    opacity: 1;
  }

  &:focus {
    outline: none;
  }
`;

const MaxPortableButton = styled.button`
  background-color: transparent;
  color: #00d0fe;
  text-transform: uppercase;
  font-size: 17px;
  border: none;
  cursor: pointer;
  font-family: "GT America Condensed Bold";
  letter-spacing: 0.41px;
`;

const BoxSplit = styled.div`
  height: 100%;
  padding-top: 10px;
  padding-left: 18px;
  color: #ffffff;

  p {
    font-family: "GT America CM";
    letter-spacing: 0.43px;
    font-size: 16px;
    color: #9e9cb0;
    text-align: center;
  }

  h3 {
    text-transform: uppercase;
    font-size: 20px;
    margin-top: 0;
    margin-bottom: 4px;
  }

  h2 {
    font-size: 42px;
    margin: 4px 0;
  }
`;

export default Swapper;
