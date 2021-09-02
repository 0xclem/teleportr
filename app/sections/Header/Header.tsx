import styled from "styled-components";

import Connector from "../../containers/Connector";
import { truncateAddress } from "../../utils/wallet";

const Header = () => {
  const { connectWallet, walletAddress } = Connector.useContainer();

  const handleConnectWallet = async () => {
    connectWallet();
  };

  return (
    <HeaderWrapper>
      <Title>TELEPORTR</Title>

      <Button onClick={handleConnectWallet}>
        {walletAddress ? truncateAddress(walletAddress): 'Connect wallet'}
      </Button>
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
  min-width: 196px;
  background: none;
  border: none;
  font-family: "Fjalla One", sans-serif;
  font-size: 13px;
  color: #FFFFFF;
  font-weight: bold;
  border-radius: 20px;
  cursor: pointer;
  background-color: #CF1C8E;
  text-transform: uppercase;
`;

export default Header;
