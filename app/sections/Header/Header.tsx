import styled from "styled-components";
import { useRecoilState } from "recoil";

import { walletState } from "../../store/wallet";

const Header = () => {
  const [wallet, setWallet] = useRecoilState(walletState);

  const handleConnectWallet = async () => {
    try {
      if (!window.ethereum) return;
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWallet(accounts[0]);
      window.ethereum.on("accountsChanged", (accounts) => {
        setWallet(accounts[0]);
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <HeaderWrapper>
      <Title>Teleportr</Title>

      {wallet ? (
        <Wallet>{wallet}</Wallet>
      ) : (
        <Button onClick={handleConnectWallet}>Connect wallet</Button>
      )}
    </HeaderWrapper>
  );
};

const HeaderWrapper = styled.div`
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #25283d;
`;

const Title = styled.h1``;

const Button = styled.button`
  height: 40px;
  background: none;
  border: 2px solid #25283d;
  font-family: "Fjalla One", sans-serif;
  color: #25283d;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
`;

const Wallet = styled.div`
  font-weight: bold;
`;

export default Header;
