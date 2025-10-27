import { Market, MarketUWLSItem, SettingsLSItem, lsItemKeyType } from "@/lib/types";
import { IWallet } from "@meshsdk/core";

export const completeSigning = async (
    wallet: IWallet,
    lsItemKey: lsItemKeyType,
    market?: Market,
) => {
  const lsItemString = localStorage.getItem(lsItemKey);
  if (!lsItemString) throw new Error("Can't sign");

  let txHash = ""
  if (lsItemKey === "Foreon_Update_Market") {
    if (!market) throw new Error('market undefined!')

    const lsItems: MarketUWLSItem[] = JSON.parse(lsItemString);
    const lsItem = lsItems.find(ls => ls.market.id === market.id)
    if (!lsItem) throw new Error('market undefined!')

    const signedTx2 = await wallet.signTx(lsItem.signedTx1, true);
    txHash = await wallet.submitTx(signedTx2);

    localStorage.setItem("Foreon_Update_Market", JSON.stringify(lsItems.filter(ls => ls !== lsItem)))
  } else {
    const lsItem: SettingsLSItem = JSON.parse(lsItemString);
    const signedTx2 = await wallet.signTx(lsItem.signedTx1, true);
    txHash = await wallet.submitTx(signedTx2);
    localStorage.removeItem(lsItemKey);
  }

  return txHash;
}
