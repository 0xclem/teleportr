import { useEffect, useState } from "react";
import styled from "styled-components";
import { BigNumber, ethers } from "ethers";

import Connector from "../../containers/Connector";

const GAS_LIMIT_BUFFER = 1000;
const ETHERSCAN_URL = "https://etherscan.io";

type ContractInfo = {
  maxDepositAmount: number;
  maxBalance: number;
  isEnabled: boolean;
};

type EtherBalance = {
  balanceBN: BigNumber;
  balance: number;
};

const Swapper = () => {
  const { depositContract, walletAddress, provider, signer, providerL2, walletL2 } =
    Connector.useContainer();
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
      if (!walletAddress || !depositContract || !provider || !providerL2 || !walletL2)
        return;
      try {
        const [
          maxDepositAmount,
          maxBalance,
          canReceive,
          ethBalance,
          burnerWalletEthBalance,
        ] = await Promise.all([
          depositContract.getMaxDepositAmount(),
          depositContract.getMaxBalance(),
          depositContract.getCanReceiveDeposit(),
          provider.getBalance(walletAddress),
          providerL2.getBalance(walletL2),
        ]);
        setContractInfo({
          maxDepositAmount: maxDepositAmount / 1e18,
          maxBalance: maxBalance / 1e18,
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
        if (burnerWalletBalance === 0)
          throw new Error("Burner wallet has a low balance");
        if (Number(depositAmount) > contractInfo.maxDepositAmount)
          throw new Error("Amount higher than deposit limit");

        const gasEstimate = await signer.estimateGas({
          to: depositContract.address,
          value: ethers.utils.parseEther(depositAmount.toString()),
        });

        setGasLimit(Number(gasEstimate) + GAS_LIMIT_BUFFER);
      } catch (e) {
        console.log(e);
        // @ts-ignore
        setError(e.message);
      }
    };
    getGasLimit();
  }, [
    depositAmount,
    signer,
    depositContract,
    contractInfo,
    burnerWalletBalance,
  ]);

  const handleDeposit = async () => {
    if (!signer || !depositContract || !gasLimit || !provider) return;
    try {
      const gasPrice = await provider.getGasPrice();
      const tx = await signer.sendTransaction({
        to: depositContract.address,
        value: ethers.utils.parseEther(depositAmount.toString()),
        gasLimit,
        gasPrice,
      });
    } catch (e) {
      console.log(e);
      // @ts-ignore
      setError(e.message);
    }
  };

  return (
    <>
      <Wrapper>
        <h1>Transfer ETH</h1>
        <Data>
          <DataElement>
            {"Deposit contract: "}
            {depositContract && depositContract.address ? (
              <DataLink
                href={`${ETHERSCAN_URL}/address/${depositContract.address}`}
                target="_blank"
              >
                {depositContract.address}
              </DataLink>
            ) : (
              "--"
            )}
          </DataElement>
          <DataElement>
            {`Max deposit amount: ${contractInfo?.maxDepositAmount ?? "--"} eth`}
          </DataElement>
          <DataElement>
            {`Max contract balance: ${contractInfo?.maxBalance ?? "--"} eth`}
          </DataElement>
          <DataElement>
            {`Deposits enabled: ${contractInfo?.isEnabled ?? "--"}`}
          </DataElement>
        </Data>
        <RowCentered>
          <Column>
            <Balance>
              Balance:
              <BalanceButton
                onClick={() =>
                  setDepositAmount(ethBalance?.balance?.toString() ?? "0")
                }
              >{` ${ethBalance?.balance ?? 0}`}</BalanceButton>
            </Balance>
            <Input
              type="text"
              placeholder="0"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
            <DepositButton
              onClick={handleDeposit}
              disabled={!!error || !gasLimit}
            >
              {error || "Deposit"}
            </DepositButton>
          </Column>
        </RowCentered>

      </Wrapper>
      <MainContainer>
        <GradientBoxWrapper>
          <GradientBox>
            <BoxSplit>
              <h3>Ethereum</h3>
              <div>L1</div>
            </BoxSplit>

            <BoxSplit>
              <h3>Optimism</h3>
              <div>L2</div>
            </BoxSplit>

          </GradientBox>
          <MainForm>
            <GradientButtonWrapper>
              <GradientButton>Select currency</GradientButton>
            </GradientButtonWrapper>

            <MainFormInputContainer>
              <MainFormInputLabel>Deposit</MainFormInputLabel>
              <MainFormInput placeholder='0.05' type='number' />
            </MainFormInputContainer>

            <MaxPortableButton>Use Max Portable: 0.05ETH</MaxPortableButton>
            
            <GradientButtonWrapper>
              <GradientButton>Connect Wallet</GradientButton>
            </GradientButtonWrapper>
          </MainForm>
        </GradientBoxWrapper>
      </MainContainer>
    </>
  );
};

const Wrapper = styled.div`
  padding: 20px 0;
`;
const Data = styled.div``;
const DataLink = styled.a`
  text-decoration: underline;
  cursor: pointer;
`;
const DataElement = styled.div``;
const RowCentered = styled.div`
  display: flex;
  justify-content: center;
  padding: 10px 0;
`;
const Input = styled.input`
  border: 2px solid #25283d;
  border-radius: 4px;
  height: 38px;
  text-align: right;
  padding: 0 8px;
  background: none;
`;
const Column = styled.div`
  display: flex;
  flex-direction: column;
  width: 300px;
`;

const Balance = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2px;
  font-size: 14px;
`;

const BalanceButton = styled.button`
  margin-left: 4px;
  text-align: right;
  font-weight: bold;
  outline: none;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
`;

const DepositButton = styled.button`
  margin-top: 8px;
  border: 2px solid #25283d;
  border-radius: 4px;
  height: 38px;
  padding: 0 20px;
  outline: none;
  background: lightgray;
  cursor: pointer;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  width: 100%;
  font-family: "Fjalla One", sans-serif;
  &:disabled {
    color: #25283d;
    opacity: 0.4;
  }
`;

const MainContainer = styled.div`
  margin: auto;
`;

const GradientBoxWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 185px;
  width: 90%;
  background: linear-gradient(90deg, #170557 0%, #00D1FF 0%, #E12096 100%, #00D1FF 100%);
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
  background: linear-gradient(90deg, #170557 0%, #4489CE 0%, #944BA9 100%, #00D1FF 100%);
  border-radius: 16px;
`;

const GradientButton = styled.button`
  width: calc(100% - 8px);
  height: calc(100% - 8px);
  cursor: pointer;
  background-color: #060134;
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  font-size: 17px;
  text-transform: uppercase;
`;

const MainFormInputContainer = styled.div`
  background-color:#1C1541;
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
  color: #FFFFFF;
  opacity: 0.74;
  font-size: 15px;
`;

const MainFormInput = styled.input`
  color: #FFFFFF;
  opacity: 0.74;
  font-size: 15px;
  height: 100%;
  border: none;
  background-color: transparent;

  &:focus {
    outline: none;
  }
`;

const MaxPortableButton = styled.button`
  background-color: transparent;
  color: #00D0FE;
  text-transform: uppercase;
  font-size: 17px;
  border: none;
  cursor: pointer;
`;

const BoxSplit = styled.div`
  height: 100%;  
  padding-top: 10px;
  padding-left: 18px;
  color: #FFFFFF;

  h3 {
    text-transform: uppercase;
  }
`;

export default Swapper;
