import { atom } from "recoil";

export const walletState = atom<string | null>({
  key: "wallet",
  default: null,
});
