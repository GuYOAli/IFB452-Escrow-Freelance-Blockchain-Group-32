import { useCallback, useEffect, useState } from "react";
import { useWallet } from "@/lib/web3/WalletContext";
import { readAgreementEvents, TimelineEvent } from "../api/agreement";

export interface EventsResult {
  events: TimelineEvent[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAgreementEvents(address: string | null): EventsResult {
  const { provider } = useWallet();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!provider || !address) return;
    setLoading(true);
    setError(null);
    try {
      const list = await readAgreementEvents(address, provider);
      setEvents(list);
    } catch (e: any) {
      setError(e?.message ?? "Failed to read events");
    } finally {
      setLoading(false);
    }
  }, [address, provider]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { events, loading, error, refresh };
}
