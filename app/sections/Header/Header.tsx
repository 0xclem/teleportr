import styled from "styled-components";
import Link from 'next/link';

import Connector from "../../containers/Connector";
import { truncateAddress } from "../../utils/wallet";

const Header = () => {
  const { connectWallet, walletAddress } = Connector.useContainer();

  const handleConnectWallet = async () => {
    connectWallet();
  };

  return (
    <HeaderWrapper>
      {/* eslint-disable-next-line */}
      <img src='/img/teleportr-logo.svg' alt='Teleportr Logo' />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href='/faq' passHref>
          <StyledLink>FAQ</StyledLink>
        </Link>
        <Button onClick={handleConnectWallet}>
          {walletAddress ? truncateAddress(walletAddress): 'Connect wallet'}
        </Button>
      </div>
    </HeaderWrapper>
  );
};

const HeaderWrapper = styled.div`
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Button = styled.button`
  height: 40px;
  min-width: 196px;
  background: none;
  border: none;
  font-family: "GT America Bold";
  font-size: 13px;
  letter-spacing: 0.35px;
  color: #FFFFFF;
  font-weight: bold;
  border-radius: 20px;
  cursor: pointer;
  background-color: #CF1C8E;
  text-transform: uppercase;
`;

const StyledLink = styled.a`
  font-family: "GT America CM";
  font-size: 22px;
  color: #FFFFFF;
  margin-right: 28px;
  letter-spacing: 0.59px;
`;

export default Header;
