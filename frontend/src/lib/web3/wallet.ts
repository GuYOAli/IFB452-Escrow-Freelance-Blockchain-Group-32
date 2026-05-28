import { hasInjectedWallet, getBrowserProvider } from "./provider";

export interface ConnectResult {
  address: string;
  chainId: number;
}

export async function connectWallet(): Promise<ConnectResult> {
  if (!hasInjectedWallet()) {
    throw new Error("MetaMask is not installed. Install it from metamask.io.");
  }
  const provider = getBrowserProvider();
  const accounts: string[] = await provider.send("eth_requestAccounts", []);
  const network = await provider.getNetwork();
  return { address: accounts[0], chainId: Number(network.chainId) };
}

export async function getCurrentChainId(): Promise<number | null> {
  if (!hasInjectedWallet()) return null;
  const provider = getBrowserProvider();
  const network = await provider.getNetwork();
  return Number(network.chainId);
}

// Ask the wallet to switch to a specific chain. Will throw if user rejects
// or if the chain has not been added to MetaMask.
export async function switchToChain(targetChainId: number): Promise<void> {
  if (!hasInjectedWallet()) throw new Error("No wallet installed.");
  const hex = "0x" + targetChainId.toString(16);
  await window.ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: hex }],
  });
}

export function shortAddress(addr?: string | null, head = 6, tail = 4): string {
  if (!addr) return "";
  if (addr.length < head + tail + 2) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}
