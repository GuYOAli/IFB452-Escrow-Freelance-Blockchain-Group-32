import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  BrowserProvider,
  JsonRpcSigner,
} from "ethers";
import {
  connectWallet as doConnect,
  getCurrentChainId,
  switchToChain,
} from "./wallet";
import { getBrowserProvider, hasInjectedWallet } from "./provider";
import { TARGET_CHAIN_ID } from "../config/contracts";

interface WalletState {
  address: string | null;
  chainId: number | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  isConnecting: boolean;
  isCorrectNetwork: boolean;
  hasWallet: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
}

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const refreshSigner = useCallback(async (addr: string | null) => {
    if (!hasInjectedWallet() || !addr) {
      setProvider(null);
      setSigner(null);
      return;
    }
    const p = getBrowserProvider();
    const s = await p.getSigner();
    setProvider(p);
    setSigner(s);
  }, []);

  const connect = useCallback(async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    try {
      const { address: a, chainId: c } = await doConnect();
      setAddress(a);
      setChainId(c);
      await refreshSigner(a);
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, refreshSigner]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setSigner(null);
    setProvider(null);
  }, []);

  const switchNetwork = useCallback(async () => {
    await switchToChain(TARGET_CHAIN_ID);
    const c = await getCurrentChainId();
    setChainId(c);
  }, []);

  // Restore session if MetaMask remembers the user.
  useEffect(() => {
    if (!hasInjectedWallet()) return;
    (async () => {
      try {
        const accounts: string[] = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          const c = await getCurrentChainId();
          setChainId(c);
          await refreshSigner(accounts[0]);
        } else {
          const c = await getCurrentChainId();
          setChainId(c);
        }
      } catch {
        // ignore
      }
    })();
  }, [refreshSigner]);

  // React to wallet events.
  useEffect(() => {
    if (!hasInjectedWallet()) return;

    const onAccountsChanged = (accounts: string[]) => {
      const next = accounts[0] ?? null;
      setAddress(next);
      void refreshSigner(next);
    };
    const onChainChanged = (cidHex: string) => {
      setChainId(parseInt(cidHex, 16));
      // Re-derive provider/signer for new chain.
      void refreshSigner(address);
    };

    window.ethereum.on?.("accountsChanged", onAccountsChanged);
    window.ethereum.on?.("chainChanged", onChainChanged);

    return () => {
      window.ethereum.removeListener?.("accountsChanged", onAccountsChanged);
      window.ethereum.removeListener?.("chainChanged", onChainChanged);
    };
  }, [address, refreshSigner]);

  const value = useMemo<WalletState>(
    () => ({
      address,
      chainId,
      provider,
      signer,
      isConnecting,
      isCorrectNetwork: chainId === TARGET_CHAIN_ID,
      hasWallet: hasInjectedWallet(),
      connect,
      disconnect,
      switchNetwork,
    }),
    [address, chainId, provider, signer, isConnecting, connect, disconnect, switchNetwork],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside <WalletProvider>");
  return ctx;
}
