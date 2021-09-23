import Head from "next/head";

import Header from "../sections/Header";
import MainLayout from "../sections/MainLayout";
import Swapper from "../sections/Swapper";
import TransactionHistory from "../sections/TransactionHistory";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.push("https://portr.xyz");
  }, []);
  return (
    <div>
      <Head>
        <title>Teleportr</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <section className="teleportr-hero-section">
          <Header />
          <MainLayout>
            <Swapper />
          </MainLayout>
        </section>
        <section className="teleportr-transactions-section">
          <TransactionHistory />
        </section>
      </main>
    </div>
  );
}
