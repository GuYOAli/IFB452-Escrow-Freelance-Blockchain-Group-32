import { useCallback, useEffect, useState } from "react";
import { useWallet } from "@/lib/web3/WalletContext";
import {
  readAgreementAddresses,
  readFactoryOwner,
} from "../api/factory";
import { isFactoryConfigured } from "@/lib/config/contracts";

export interface FactorySummary {
  agreements: { id: number; address: string }[];
  owner: string | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  configured: boolean;
}

export function useFactory(): FactorySummary {
  const { provider, chainId } = useWallet();
  const [agreements, setAgreements] = useState<{ id: number; address: string }[]>([]);
  const [owner, setOwner] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const configured = isFactoryConfigured(chainId ?? undefined);

  const refresh = useCallback(async () => {
    if (!provider || !configured) return;
    setLoading(true);
    setError(null);
    try {
      const [list, ownerAddr] = await Promise.all([
        readAgreementAddresses(provider, chainId ?? undefined),
        readFactoryOwner(provider, chainId ?? undefined),
      ]);
      setAgreements(list);
      setOwner(ownerAddr);
    } catch (e: any) {
      setError(e?.message ?? "Failed to read factory");
    } finally {
      setLoading(false);
    }
  }, [provider, chainId, configured]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { agreements, owner, loading, error, refresh, configured };
}
