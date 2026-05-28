import { NavLink } from "react-router-dom";
import { useWallet } from "@/lib/web3/WalletContext";
import { networkLabel } from "@/lib/config/networks";
import { shortAddress } from "@/lib/web3/wallet";
import { TARGET_CHAIN_ID } from "@/lib/config/contracts";

export function Topbar() {
  const { address, chainId, isConnecting, isCorrectNetwork, hasWallet, connect, disconnect, switchNetwork } = useWallet();

  return (
    <header className="topbar">
      <div className="row">
        <div className="brand">IFB452 Freelance Escrow</div>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/admin">Admin</NavLink>
        </nav>
      </div>
      <div className="row">
        <span className="pill" title="Connected network">
          {networkLabel(chainId)}
        </span>
        {!hasWallet && <span className="pill pill-danger">No wallet detected</span>}
        {hasWallet && address && !isCorrectNetwork && (
          <button className="btn btn-secondary" onClick={() => void switchNetwork()}>
            Switch to {networkLabel(TARGET_CHAIN_ID)}
          </button>
        )}
        {!address ? (
          <button className="btn" disabled={!hasWallet || isConnecting} onClick={() => void connect()}>
            {isConnecting ? "Connecting…" : "Connect MetaMask"}
          </button>
        ) : (
          <>
            <span className="pill">{shortAddress(address)}</span>
            <button className="btn btn-secondary" onClick={disconnect}>Disconnect</button>
          </>
        )}
      </div>
    </header>
  );
}
