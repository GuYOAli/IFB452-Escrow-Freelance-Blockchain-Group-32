import { useCallback, useEffect, useState } from "react";
import { useWallet } from "@/lib/web3/WalletContext";
import { readAgreement, AgreementSnapshot } from "../api/agreement";

export interface AgreementResult {
  data: AgreementSnapshot | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAgreement(address: string | null): AgreementResult {
  const { provider } = useWallet();
  const [data, setData] = useState<AgreementSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!provider || !address) return;
    setLoading(true);
    setError(null);
    try {
      const snap = await readAgreement(address, provider);
      setData(snap);
    } catch (e: any) {
      setError(e?.message ?? "Failed to read agreement");
    } finally {
      setLoading(false);
    }
  }, [address, provider]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
