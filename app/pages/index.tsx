import Head from "next/head";

import Header from "../sections/Header";
import MainLayout from "../sections/MainLayout";
import Swapper from "../sections/Swapper";
import TransactionHistory from "../sections/TransactionHistory";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Blink</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header />
        <MainLayout>
          <Swapper />
          <TransactionHistory />
        </MainLayout>
      </main>

      {/* <footer></footer> */}
    </div>
  );
}
