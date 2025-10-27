import { SettingsLSItem, lsItemKeyType } from "@/lib/types";
import { IWallet } from "@meshsdk/core";

export const completeSigning = async (
    wallet: IWallet,
    lsItemKey: lsItemKeyType,
) => {
  const lsItemString = localStorage.getItem(lsItemKey);
  if (!lsItemString) throw new Error("Can't sign");

  const lsItem: SettingsLSItem = JSON.parse(lsItemString);

  const signedTx2 = await wallet.signTx(lsItem.signedTx1, true);

  const txHash = await wallet.submitTx(signedTx2);

  localStorage.removeItem(lsItemKey);

  return txHash;
}
