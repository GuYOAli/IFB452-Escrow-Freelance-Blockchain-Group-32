import { BrowserProvider, JsonRpcSigner } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function hasInjectedWallet(): boolean {
  return typeof window !== "undefined" && !!window.ethereum;
}

export function getBrowserProvider(): BrowserProvider {
  if (!hasInjectedWallet()) {
    throw new Error("MetaMask (or another injected wallet) is not available.");
  }
  return new BrowserProvider(window.ethereum, "any");
}

export async function getSigner(): Promise<JsonRpcSigner> {
  const provider = getBrowserProvider();
  return provider.getSigner();
}
