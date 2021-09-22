import Head from "next/head";
import styled from "styled-components";

import Header from "../sections/Header";
import FAQWidget from "../components/FAQWidget";

const faqData = [
  {
    title: "Why is there a deposit limit?",
    description:
      "The deposit limit is in place for security reasons as Teleportr is a centralized custodial bridging solution.",
  },
  {
    title: "What is the current deposit limit?",
    description:
      "0.05 ETH per transaction deposit limit. 14 ETH smart contract balance limit.",
  },
  {
    title: "How long will it take to receive my funds on Optimism?",
    description:
      "Once your Ethereum mainnet transaction confirms you should receive your ETH on Optimism in 5-10 minutes or less.",
  },
  {
    title: "Does Teleportr charge fees?",
    description:
      "The only fee that is deducted from the deposit amount is the Optimism transaction fee.",
  },
  {
    title: "Has the code been audited?",
    description:
      "The code hasn't been formally audited but the contract is simple and has been reviewed by multiple developers.",
  },
  {
    title: "Why is Teleportr so cheap compared to the Optimism Gateway?",
    description:
      "The Optimism Gateway is a proper bridge to an optimistic rollup. Teleportr is a centralized custodial bridge.",
  },
  {
    title: "Will Teleportr be available for other Layer 2s?",
    description: "Maybe in the future but for now we are focused on Optimism.",
  },
];

const FAQ = () => {
  return (
    <div>
      <Head>
        <title>FAQ | Teleportr</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <section className="faq-section">
          <Header />

          <FAQWrapper>
            <h1>FAQ</h1>
            {faqData.map((f) => (
              <FAQWidget key={f.title} {...f} />
            ))}
          </FAQWrapper>
        </section>
      </main>
    </div>
  );
};

const FAQWrapper = styled.div`
  margin: 40px 0 0 100px;

  h1 {
    color: #ffffff;
    font-family: "GT America CM";
    font-size: 42px;
    letter-spacing: 1.13px;
  }
`;

export default FAQ;
