export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl?: string;
  blockExplorer?: string;
  currencySymbol: string;
}

export const NETWORKS: Record<number, NetworkConfig> = {
  31337: {
    chainId: 31337,
    name: "Hardhat Local",
    rpcUrl: "http://127.0.0.1:8545",
    currencySymbol: "ETH",
  },
  1337: {
    chainId: 1337,
    name: "Ganache Local",
    rpcUrl: "http://127.0.0.1:7545",
    currencySymbol: "ETH",
  },
  11155111: {
    chainId: 11155111,
    name: "Sepolia",
    blockExplorer: "https://sepolia.etherscan.io",
    currencySymbol: "ETH",
  },
};

export function getNetwork(chainId: number): NetworkConfig | undefined {
  return NETWORKS[chainId];
}

export function networkLabel(chainId: number | null): string {
  if (chainId == null) return "Not connected";
  const n = NETWORKS[chainId];
  return n ? `${n.name} (${chainId})` : `Unknown chain (${chainId})`;
}
