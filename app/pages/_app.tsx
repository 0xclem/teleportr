import { FC } from "react";
import { AppProps } from "next/app";
import { RecoilRoot } from "recoil";

import WithAppContainers from "../containers";

import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <WithAppContainers>
        <Component {...pageProps} />
      </WithAppContainers>
    </RecoilRoot>
  );
}
export default MyApp;
