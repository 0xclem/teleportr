import { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { format } from "date-fns";

import Connector from "../../containers/Connector";

const START_BLOCK = 13047837;
const CONFIRMATIONS = 21;
// const ETHERSCAN_URL = "https://etherscan.io";
const EXPLORER_URL = "https://optimistic.etherscan.io";

type Transaction = {
  hash: string;
  blockNumber: number;
  wallet: string;
  amount: number;
  timestamp: number;
};

const TransactionHistory = () => {
  const {
    depositContract,
    walletAddress,
    provider,
    providerL2,
  } = Connector.useContainer();
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [currentBlock, setCurrentBlock] = useState<number | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!provider || !depositContract || !walletAddress || !providerL2) return;
    try {
      const filters = depositContract.filters.EtherReceived(walletAddress);
      const [logs, lastBlock] = await Promise.all([
        provider.getLogs({
          address: depositContract.address,
          ...filters,
          fromBlock: START_BLOCK,
        }),
        provider.getBlockNumber(),
      ]);
      const events = await Promise.all(
        logs.map(async (l) => {
          const { args } = depositContract.interface.parseLog(l);
          const block = await provider.getBlock(l.blockNumber);
          const timestamp = Number(block.timestamp * 1000);
          return {
            hash: l.transactionHash,
            blockNumber: l.blockNumber,
            wallet: args.emitter,
            amount: args.amount / 1e18,
            timestamp,
          };
        })
      );
      setTransactions(events);
      setCurrentBlock(Number(lastBlock));
    } catch (e) {
      console.log(e);
    }
  }, [provider, depositContract, walletAddress, providerL2]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <Wrapper>
      <TitleText>Transaction History</TitleText>
      {!walletAddress && (
        <ConnectText>
          Connect your wallet to view your transaction history.
        </ConnectText>
      )}
      <TableRow>
        <TableHeaderText>Address</TableHeaderText>
        <TableHeaderText>Confirmations</TableHeaderText>
        <TableHeaderText>Date</TableHeaderText>
        <TableHeaderText>Time</TableHeaderText>
        <TableHeaderText>Trx Link</TableHeaderText>
      </TableRow>
      <Transactions>
        {currentBlock && transactions && transactions.length > 0
          ? transactions.map((tx) => {
              return (
                <>
                  <TableBodyRow>
                    <div>{walletAddress}</div>
                    <div>
                      {`${
                        currentBlock - tx.blockNumber > CONFIRMATIONS
                          ? CONFIRMATIONS
                          : currentBlock - tx.blockNumber
                      }/${CONFIRMATIONS}`}
                    </div>
                    <div>{format(new Date(tx.timestamp), "dd/MM/Y")}</div>
                    <div>{format(new Date(tx.timestamp), "h:mm aaa")}</div>
                    <div>
                      <Link
                        href={`${EXPLORER_URL}/address/${walletAddress}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Check status on OE explorer
                      </Link>
                    </div>
                  </TableBodyRow>
                  {/*<Transaction key={tx.hash}>
                  <div>
                    Hash:{" "}
                    <Link
                      href={`${ETHERSCAN_URL}/tx/${tx.hash}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {tx.hash}
                    </Link>
                  </div>
                  <div>Block: {tx.blockNumber} </div>
                  <div>
                    Date: {format(new Date(tx.timestamp), "dd/MM/Y, h:mm aaa")}{" "}
                  </div>
                  <div>{`Confirmations: ${
                    currentBlock - tx.blockNumber > CONFIRMATIONS
                      ? CONFIRMATIONS
                      : currentBlock - tx.blockNumber
                  }/${CONFIRMATIONS}`}</div>
                  <div>Amount: {tx.amount} ether</div>
                  <div>
                    <Link
                      href={`${EXPLORER_URL}/address/${walletAddress}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Check status on OE explorer
                    </Link>
                  </div>
									</Transaction>*/}
                </>
              );
            })
          : walletAddress && (
              <ConnectText>No transactions for this wallet yet.</ConnectText>
            )}
      </Transactions>
    </Wrapper>
  );
};

// Address, Confirmations, Date, Time, Transaction Link.

const Wrapper = styled.div`
  /* border-top: 2px solid black; */
`;

const TitleText = styled.h1`
  position: relative;
  top: -30px;
  font-family: "GT America CM";
  letter-spacing: 1.16px;
  margin-bottom: 5px;
  text-align: center;
  text-transform: uppercase;
  color: #ffffff;
  font-size: 43px;
  margin-top: 0px;
`;

const ConnectText = styled.p`
  font-family: "Inter", sans-serif;
  color: #ffffff;
  font-size: 21px;
  letter-spacing: 0.57px;
  text-align: center;
`;

const TableRow = styled.div`
  display: grid;
  margin: 30px auto 0;
  width: 1327px;
  max-width: 90%;
  grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr;
  height: 40px;
  border-bottom: 2px solid #bd18d4;
`;

const TableBodyRow = styled.div`
  display: grid;
  margin: 0 auto;
  width: 1327px;
  max-width: 90%;
  grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr;
  height: 40px;
  padding: 20px 0;
  border-bottom: 1px solid #bd18d4;
`;

const TableHeaderText = styled.div`
  display: flex;
  align-items: center;
  font-family: "GT America CM";
  text-transform: uppercase;
  letter-spacing: 0.59px;
  color: #00d0fe;
  margin-bottom: 12px;
`;

const Transactions = styled.div`
  margin: 20px 0;
`;

const Transaction = styled.div`
  border: 2px solid black;
  padding: 20px;
  margin: 10px 0;
`;

const Link = styled.a`
  font-weight: bold;
  text-decoration: underline;
  cursor: pointer;
`;

export default TransactionHistory;
