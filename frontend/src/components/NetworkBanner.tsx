import { useWallet } from "@/lib/web3/WalletContext";
import { networkLabel } from "@/lib/config/networks";
import { TARGET_CHAIN_ID, isFactoryConfigured } from "@/lib/config/contracts";

// Single banner component: surfaces the most relevant blocker so the user
// always knows why on-chain actions might be disabled.
export function NetworkBanner() {
  const { hasWallet, address, isCorrectNetwork, chainId, switchNetwork } = useWallet();

  if (!hasWallet) {
    return (
      <div className="banner">
        MetaMask not detected. Install it from <a href="https://metamask.io" target="_blank" rel="noreferrer">metamask.io</a> and reload.
      </div>
    );
  }
  if (!address) {
    return (
      <div className="banner">
        Connect your wallet to read on-chain data and submit transactions.
      </div>
    );
  }
  if (!isCorrectNetwork) {
    return (
      <div className="banner">
        Wrong network. You are on {networkLabel(chainId)} but the app expects {networkLabel(TARGET_CHAIN_ID)}.
        {" "}
        <button className="btn btn-secondary" style={{ marginLeft: 8 }} onClick={() => void switchNetwork()}>
          Switch network
        </button>
      </div>
    );
  }
  if (!isFactoryConfigured(chainId ?? undefined)) {
    return (
      <div className="banner">
        Factory address is not configured for {networkLabel(chainId)}. Update <span className="code">.env</span> or{" "}
        <span className="code">deployments/&lt;network&gt;.json</span>.
      </div>
    );
  }
  return null;
}
