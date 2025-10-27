"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { useWalletCustom } from "./WalletConnectionContext";
import { AllowedAsset, SettingsLSItem, GlobalSetting, SettingMarket, lsItemKeyType, Market, MarketUWLSItem } from "@/lib/types";
import { fetchGlobalSettings } from "@/e2e/utils";
import { toast, ToastContainer } from "react-toastify";
import { createSettings } from "@/e2e/global_settings/create_settings";
import { updateSettings } from "@/e2e/global_settings/update_settings";
import { completeSigning } from "@/e2e/global_settings/complete_signing";
import { fetchMarketData } from "@/lib/markets";
import { updateWinner } from "@/e2e/global_settings/update_winner";

export default function ForeonAdmin() {
  const { blockchainProvider, txBuilder, walletCollateral, wallet, address, walletUtxos, connected } = useWalletCustom();

  const [globalSettings, setGlobalSettings] = useState<GlobalSetting[]>([
    // {
    //   id: 1,
    //   minimumMarketAmount: 5000,
    //   adminMultisig: "ae12bfab908fef23acbd123f000000fabc00123abcdeffedcba0011",
    //   allowedAssets: [
    //     {
    //       isStable: true,
    //       policyId: "abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx1122aabb3344",
    //       assetNameHex: "555344", // 'USD'
    //       multiplier: 1,
    //     },
    //   ],
    // },
  ]);

  const [hGlobalSettings, setHGlobalSettings] = useState<GlobalSetting[]>([]);

  const [hMarkets, setHMarkets] = useState<Market[]>([]);

  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [isProcessingM, setIsProcessingM] = useState<boolean>(false)

  const [form, setForm] = useState<GlobalSetting>({
    id: 0,
    minimumMarketAmount: 0,
    adminMultisig: "",
    allowedAssets: [],
  });

  const [markets, setMarkets] = useState<Market[]>([
    // { id: 1, name: "Market 1", resolved: false },
    // { id: 2, name: "Market 2", resolved: false },
  ]);

  const setNewSetting = async () => {
    const newSetting = await fetchGlobalSettings(blockchainProvider);
    if (!newSetting) return;
    setGlobalSettings([ ...globalSettings, newSetting ]);
  }

  useEffect(() => {
    setNewSetting();

    // Get half signed transaction from global settings and display it
    const lsItemStringCreate = localStorage.getItem("Foreon_Create_Settings");
    const lsItemStringUpdate = localStorage.getItem("Foreon_Update_Settings");

    if (!lsItemStringCreate && !lsItemStringUpdate) return

    const lsItem: SettingsLSItem = JSON.parse(lsItemStringCreate ? lsItemStringCreate : lsItemStringUpdate ? lsItemStringUpdate : "[]");

    setHGlobalSettings([lsItem.globalSetting]);
  }, [isProcessing])

  useEffect(() => {
    // Get half signed transaction from local storage and display it
    const lsItemStringWinner = localStorage.getItem("Foreon_Update_Market");
    if (!lsItemStringWinner) return

    const lsItems: MarketUWLSItem[] = JSON.parse(lsItemStringWinner);

    const marketsLS = lsItems.map(ls => ls.market)
    setHMarkets(marketsLS);
  }, [isProcessingM])

  useEffect(() => {
      const fetchMarket = async () => {
        try {
          if (!blockchainProvider) throw new Error('blockchainProvider not found');
          const marketResult = await fetchMarketData(blockchainProvider)
          // Filter out invalid markets and markets whose deadlines have not reached
          const marketData = marketResult.filter((m) => (m.title !== "Unknown" && m.endTime !== "0" && Number(m.endTime) <= new Date().getTime()))
          setMarkets(marketData)
        } catch(e) {
          console.error('e:', e);
        }
      }

      fetchMarket();
    }, [connected])

  // Toast
  const toastSuccess = (txHash: string) => {
    toast.success(<div>
      Success!  
      <br />
      <a
        href={`https://preprod.cardanoscan.io/transaction/${txHash}`} 
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#61dafb", textDecoration: "underline" }}
      >
        View on Explorer
      </a>
    </div>);
  };
  const toastFailure = (err: any) => toast.error(`Failed: ${err instanceof Error ? err.message : String(err)}`);

  // handle create new settings
  const handleCreateSettings = async () => {
    setIsProcessing(true);
    if (!txBuilder || !walletCollateral || !blockchainProvider) {
      toastFailure("Error: Check collateral")
      return;
    }

    try {
      await createSettings(
        txBuilder,
        blockchainProvider,
        wallet,
        address,
        walletCollateral,
        walletUtxos,
        form.minimumMarketAmount,
        form.allowedAssets,
        form,
      );
      txBuilder.reset();
    } catch (e) {
      txBuilder.reset();
      setIsProcessing(false);
      toastFailure(e);
      console.error("e tx:", e);
      console.log("Err in handle create settings");
      return;
    }

    txBuilder.reset();
    setIsProcessing(false);
    toastSuccess("Success! Now complete the signing with the other wallet");
  }
  
  // handle update settings
  const handleUpdateSettings = async () => {
    setIsProcessing(true);
    if (!txBuilder || !walletCollateral || !blockchainProvider) {
      toastFailure("Error: Check collateral")
      return;
    }

    try {
      await updateSettings(
        txBuilder,
        blockchainProvider,
        wallet,
        address,
        walletCollateral,
        walletUtxos,
        form.minimumMarketAmount,
        form.allowedAssets,
        form,
      );
      txBuilder.reset();
    } catch (e) {
      txBuilder.reset();
      setIsProcessing(false);
      toastFailure(e);
      console.error("e tx:", e);
      console.log("Err in handle update settings");
      return;
    }

    txBuilder.reset();
    setIsProcessing(false);
    toastSuccess("Success! Now complete the signing with the other wallet");
  }
  
  // handle update winner
  const handleUpdateWinner = async (winnerType: "Yes" | "No", market: Market) => {
    setIsProcessing(true);
    if (!txBuilder || !walletCollateral || !blockchainProvider) {
      toastFailure("Error: Check collateral")
      return;
    }

    try {
      await updateWinner(
        txBuilder,
        blockchainProvider,
        wallet,
        address,
        walletCollateral,
        walletUtxos,
        winnerType,
        market.marketHash,
        market,
      );
      txBuilder.reset();
    } catch (e) {
      txBuilder.reset();
      setIsProcessing(false);
      toastFailure(e);
      console.error("e tx:", e);
      console.log("Err in handle update winner");
      return;
    }

    txBuilder.reset();
    setIsProcessing(false);
    toastSuccess("Success! Now complete the signing with the other wallet");
  }

  // handle complete signing settings
  const handleCompleteSigning = async () => {
    setIsProcessing(true);
    if (!txBuilder || !walletCollateral || !blockchainProvider) {
      toastFailure("Error: Check collateral")
      return;
    }

    let islsItemCreate = false;
    const lsItemStringCreate = localStorage.getItem("Foreon_Create_Settings");
    // const lsItemStringUpdate = localStorage.getItem("Foreon_Update_Settings");
    if (lsItemStringCreate) {
      islsItemCreate = true;
    }

    let txHash = "";
    try {
      txHash = await completeSigning(wallet, islsItemCreate ? "Foreon_Create_Settings" : "Foreon_Update_Settings");
      txBuilder.reset();
    } catch (e) {
      txBuilder.reset();
      setIsProcessing(false);
      toastFailure(e);
      console.error("e tx:", e);
      console.log("Err in handle complete signing create settings");
      return;
    }

    blockchainProvider.onTxConfirmed(txHash, () => {
      txBuilder.reset();
      setIsProcessing(false);
      toastSuccess(txHash);
      console.log("Create global settings tx hash:", txHash);
    });
  }

  // handle complete signing winner
  const handleCompleteSigningWinner = async (market: Market) => {
    setIsProcessing(true);
    if (!txBuilder || !walletCollateral || !blockchainProvider) {
      toastFailure("Error: Check collateral")
      return;
    }

    let txHash = "";
    try {
      txHash = await completeSigning(wallet, "Foreon_Update_Market", market);
      txBuilder.reset();
    } catch (e) {
      txBuilder.reset();
      setIsProcessing(false);
      toastFailure(e);
      console.error("e tx:", e);
      console.log("Err in handle complete signing update market");
      return;
    }

    blockchainProvider.onTxConfirmed(txHash, () => {
      txBuilder.reset();
      setIsProcessing(false);
      toastSuccess(txHash);
      console.log("Update market winner tx hash:", txHash);
    });
  }

  const resetForm = () => {
    setForm({ id: 0, minimumMarketAmount: 0, adminMultisig: "", allowedAssets: [] });
  };

  const addAsset = () => {
    setForm({
      ...form,
      allowedAssets: [
        ...form.allowedAssets,
        { isStable: false, policyId: "", assetNameHex: "", multiplier: 1 },
      ],
    });
  };

  const updateAsset = <K extends keyof AllowedAsset>(
    index: number,
    key: K,
    value: AllowedAsset[K]
  ) => {
    setForm((prev) => {
      const updatedAssets = prev.allowedAssets.map((asset, i) =>
        i === index ? { ...asset, [key]: value } : asset
      );
      return { ...prev, allowedAssets: updatedAssets };
    });
  };

  const deleteAsset = (index: number) => {
    setForm({
      ...form,
      allowedAssets: form.allowedAssets.filter((_, i) => i !== index),
    });
  };

  const handleSave = async () => {
    if (form.id) {
      // Update existing
      setGlobalSettings(
        globalSettings.map((s) => (s.id === form.id ? { ...form } : s))
      );
      await handleUpdateSettings();
    } else {
      // Create new
      const newSetting = { ...form, id: Date.now() };
      setGlobalSettings([...globalSettings, newSetting]);
      await handleCreateSettings();
    }
    resetForm();
  };

  const handleEdit = (setting: GlobalSetting) => {
    setForm(setting);
  };

  const handleDelete = (id: number | string) => {
    if (confirm("Delete this global setting?")) {
      setGlobalSettings(globalSettings.filter((s) => s.id !== id));
      if (form.id === id) resetForm();
      alert("Global setting deleted (mock)");
    }
  };

  // const markWinner = (marketId: string, winner: "YES" | "NO") => {
  //   if (confirm(`Set winner of Market ${marketId} to ${winner}?`)) {
  //     setMarkets(
  //       markets.map((m) =>
  //         m.id === marketId ? { ...m, resolved: true, winner } : m
  //       )
  //     );
  //     alert(`Market ${marketId} resolved as ${winner}`);
  //   }
  // };

  return (
    <motion.div className="min-h-screen bg-gray-100 p-6 flex flex-col gap-8 items-center">
      {/* Toast */}
      <ToastContainer position='top-right' autoClose={5000} />

      <Card className="w-full max-w-5xl shadow-lg">
        <CardHeader>
          <CardTitle>Global Settings Manager</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg bg-white">
              <thead className="bg-gray-200 text-left">
                <tr>
                  <th className="p-2">ID</th>
                  <th className="p-2">Min Market</th>
                  <th className="p-2">Admin Hash</th>
                  <th className="p-2">Allowed Assets</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {globalSettings.map((s) => (
                  <tr key={s.id} className="border-t align-top">
                    <td className="p-2">{s.id}</td>
                    <td className="p-2">{s.minimumMarketAmount}</td>
                    <td className="p-2 truncate max-w-xs">{s.adminMultisig}</td>

                    {/* 🧩 Allowed Assets shown in detail */}
                    <td className="p-2">
                      <div className="flex flex-col gap-2">
                        {s.allowedAssets.length === 0 && (
                          <span className="text-gray-400 italic">No assets</span>
                        )}
                        {s.allowedAssets.map((asset, i) => (
                          <div
                            key={i}
                            className="border rounded-md p-2 bg-gray-50 flex flex-col gap-1 text-xs"
                          >
                            <div className="flex justify-between">
                              <span className="font-semibold">
                                {asset.isStable ? "✅ Stable" : "⚡ Non-Stable"}
                              </span>
                              <span>x{asset.multiplier}</span>
                            </div>
                            <div className="truncate text-gray-700">
                              <strong>Policy:</strong> {asset.policyId}
                            </div>
                            <div className="truncate text-gray-700">
                              <strong>Asset Name (Hex):</strong> {asset.assetNameHex}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="p-2 flex flex-col gap-2">
                      <Button size="sm" onClick={() => handleEdit(s)}>
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(s.id)}
                        disabled
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Half signed Settings */}
          <div className="overflow-x-auto p-4 border rounded-md bg-white space-y-4">
            <h3 className="text-lg font-semibold">
                Half Signed Settings
            </h3>
            <table className="w-full text-sm border rounded-lg bg-white">
              <thead className="bg-gray-200 text-left">
                <tr>
                  <th className="p-2">ID</th>
                  <th className="p-2">Min Market</th>
                  <th className="p-2">Admin Hash</th>
                  <th className="p-2">Allowed Assets</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {hGlobalSettings && hGlobalSettings.map((s) => (
                  <tr key={s.id} className="border-t align-top">
                    <td className="p-2">{s.id}</td>
                    <td className="p-2">{s.minimumMarketAmount}</td>
                    <td className="p-2 truncate max-w-xs">{s.adminMultisig}</td>

                    {/* 🧩 Allowed Assets shown in detail */}
                    <td className="p-2">
                      <div className="flex flex-col gap-2">
                        {s.allowedAssets.length === 0 && (
                          <span className="text-gray-400 italic">No assets</span>
                        )}
                        {s.allowedAssets.map((asset, i) => (
                          <div
                            key={i}
                            className="border rounded-md p-2 bg-gray-50 flex flex-col gap-1 text-xs"
                          >
                            <div className="flex justify-between">
                              <span className="font-semibold">
                                {asset.isStable ? "✅ Stable" : "⚡ Non-Stable"}
                              </span>
                              <span>x{asset.multiplier}</span>
                            </div>
                            <div className="truncate text-gray-700">
                              <strong>Policy:</strong> {asset.policyId}
                            </div>
                            <div className="truncate text-gray-700">
                              <strong>Asset Name (Hex):</strong> {asset.assetNameHex}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="p-2 flex flex-col gap-2">
                      <Button size="sm" onClick={handleCompleteSigning} disabled={isProcessing}>
                        {isProcessing ? "Processing..." : "Complete Sigining"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Create/Edit Global Settings */}
          <div className="p-4 border rounded-md bg-white space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {form.id ? "Edit Global Setting" : "Create New Global Setting"}
              </h3>
              {form.id && (
                <Button variant="outline" size="sm" onClick={resetForm}>
                  + New
                </Button>
              )}
            </div>

            <div>
              <label className="block text-sm">Minimum Market Amount</label>
              <Input
                type="number"
                value={form.minimumMarketAmount === 0 ? "" : form.minimumMarketAmount}
                onChange={(e) =>
                  setForm({ ...form, minimumMarketAmount: Number(e.target.value) })
                }
                required
                disabled={globalSettings.length !== 0}
              />
            </div>

            {/* <div>
              <label className="block text-sm">Admin Multisig Hash</label>
              <Input
                type="text"
                value={form.adminMultisig}
                onChange={(e) => setForm({ ...form, adminMultisig: e.target.value })}
              />
            </div> */}

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Allowed Assets</label>
                <Button variant="outline" size="sm" onClick={addAsset} disabled={globalSettings.length !== 0}>
                  + Add Asset
                </Button>
              </div>

              {form.allowedAssets.map((asset, index) => (
                <div
                  key={index}
                  className="border p-3 rounded-md bg-gray-50 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={asset.isStable}
                      onCheckedChange={(val) =>
                        updateAsset(index, "isStable", val === true)
                      }
                    />
                    <span className="text-sm">Stable Asset</span>
                  </div>

                  <Input
                    placeholder="Policy ID"
                    value={asset.policyId}
                    onChange={(e) =>
                      updateAsset(index, "policyId", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Asset Name (Hex)"
                    value={asset.assetNameHex}
                    onChange={(e) =>
                      updateAsset(index, "assetNameHex", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Multiplier"
                    type="number"
                    value={asset.multiplier === 0 ? "" : asset.multiplier}
                    onChange={(e) =>
                      updateAsset(index, "multiplier", Number(e.target.value))
                    }
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteAsset(index)}
                  >
                    Delete Asset
                  </Button>
                </div>
              ))}
            </div>

            <Button onClick={handleSave} disabled={isProcessing || !form.minimumMarketAmount || !form.allowedAssets[0]?.assetNameHex || !form.allowedAssets[0]?.policyId || !form.allowedAssets[0]?.multiplier || globalSettings.length !== 0}>
              {isProcessing ? "Processing..." :
                form.id ? "Update Global Setting" : "Create Global Setting"
              }
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Half signed markets updates */}
      <Card className="w-full max-w-5xl shadow-lg">
        <CardHeader>
          <CardTitle>Half signed Markets Updates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hMarkets.map((m) => {
            const isYes = Number(m.options[0].percentage.slice(0, 2)) > 50;

            return (
              <div
                key={m.id}
                className="p-3 bg-white rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{m.title} <s />
                    <span className={`${isYes ? "text-blue-800" : "text-red-600"} font-bold`}>(Yes {m.options[0].type === "yes" ? m.options[0].percentage: "invalid market"})</span>
                  </div>
                  <span className="text-sm text-green-700">
                    Winner: {isYes ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleCompleteSigningWinner(m)} disabled={isProcessingM}>
                    {isProcessingM ? "Processing..." : "Complete Signing"}
                  </Button>
                </div>
              </div>
            )}
          )}
        </CardContent>
      </Card>
      
      <Card className="w-full max-w-5xl shadow-lg">
        <CardHeader>
          <CardTitle>Markets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {markets.map((m) => {
            const isYes = Number(m.options[0].percentage.slice(0, 2)) > 50;

            return (
              <div
                key={m.id}
                className="p-3 bg-white rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{m.title} <s />
                    <span className={`${isYes ? "text-blue-800" : "text-red-600"} font-bold`}>(Yes {m.options[0].type === "yes" ? m.options[0].percentage: "invalid market"})</span>
                  </div>
                  {/* {true ? ( */}
                  {m.resolved ? (
                    <span className="text-sm text-green-700">
                      Winner: {isYes ? "Yes" : "No"}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">Unresolved</span>
                  )}
                </div>
                {/* {true && ( */}
                {!m.resolved && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUpdateWinner("Yes", m)}>
                      Yes
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleUpdateWinner("No", m)}
                    >
                      No
                    </Button>
                  </div>
                )}
              </div>
            )}
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
