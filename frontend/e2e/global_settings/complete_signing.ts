import { CreateSettingsLSItem } from "@/lib/types";
import { IWallet } from "@meshsdk/core";

export const completeSigningCreate = async (
    wallet: IWallet,
) => {
  const lsItemString = localStorage.getItem("Foreon_Create_Settings");
  if (!lsItemString) throw new Error("Can't sign");

  const lsItem: CreateSettingsLSItem = JSON.parse(lsItemString);

  const signedTx2 = await wallet.signTx(lsItem.signedTx1, true);

  const txHash = await wallet.submitTx(signedTx2);

  localStorage.removeItem("Foreon_Create_Settings");

  return txHash;
}
