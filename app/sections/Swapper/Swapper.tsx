import { useEffect, useState } from "react";
import styled from "styled-components";
import { BigNumber, ethers } from "ethers";

import Connector from "../../containers/Connector";

const GAS_LIMIT_BUFFER = 1000;

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
  const { depositContract, wallet, provider, signer, providerL2, walletL2 } =
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
      if (!wallet || !depositContract || !provider || !providerL2 || !walletL2)
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
          provider.getBalance(wallet),
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
  }, [wallet, depositContract, provider, providerL2, walletL2]);

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
      setError(e.message);
    }
  };

  return (
    <Wrapper>
      <h1>Transfer ETH</h1>
      <Data>
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
  );
};

const Wrapper = styled.div`
  padding: 20px 0;
`;
const Data = styled.div``;
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

export default Swapper;
