import { useEffect, useState } from "react";
import { isAddress } from "ethers";
import { useWallet } from "@/lib/web3/WalletContext";
import { useFactory } from "@/features/escrow/hooks/useFactory";
import { useToast } from "@/components/ToastProvider";
import {
  callApproveArbitrator,
  callRevokeArbitrator,
  readIsArbitratorApproved,
} from "@/features/escrow/api/factory";
import { factoryAddress } from "@/lib/config/contracts";
import { NetworkBanner } from "@/components/NetworkBanner";

export default function AdminPage() {
  const { signer, address, chainId } = useWallet();
  const { owner, agreements, configured, refresh } = useFactory();
  const toast = useToast();

  const [arbitrator, setArbitrator] = useState("");
  const [busy, setBusy] = useState(false);
  const [lookup, setLookup] = useState("");
  const [lookupResult, setLookupResult] = useState<null | boolean>(null);

  const isOwner = !!address && !!owner && address.toLowerCase() === owner.toLowerCase();

  useEffect(() => {
    setLookupResult(null);
  }, [lookup]);

  async function approve() {
    if (!signer) return toast.error("Connect wallet first");
    if (!isAddress(arbitrator)) return toast.error("Invalid address");
    setBusy(true);
    try {
      const tx = await callApproveArbitrator(signer, arbitrator, chainId ?? undefined);
      toast.info("Tx submitted: approving arbitrator…");
      await tx.wait();
      toast.success("Arbitrator approved");
      setArbitrator("");
      refresh();
    } catch (e: any) {
      toast.error(e?.shortMessage ?? e?.reason ?? e?.message ?? "Tx failed");
    } finally {
      setBusy(false);
    }
  }

  async function revoke() {
    if (!signer) return toast.error("Connect wallet first");
    if (!isAddress(arbitrator)) return toast.error("Invalid address");
    setBusy(true);
    try {
      const tx = await callRevokeArbitrator(signer, arbitrator, chainId ?? undefined);
      toast.info("Tx submitted: revoking arbitrator…");
      await tx.wait();
      toast.success("Arbitrator revoked");
      setArbitrator("");
      refresh();
    } catch (e: any) {
      toast.error(e?.shortMessage ?? e?.reason ?? e?.message ?? "Tx failed");
    } finally {
      setBusy(false);
    }
  }

  async function checkApproval() {
    if (!signer || !isAddress(lookup)) return;
    try {
      const ok = await readIsArbitratorApproved(signer, lookup, chainId ?? undefined);
      setLookupResult(ok);
    } catch {
      setLookupResult(null);
      toast.error("Lookup failed");
    }
  }

  return (
    <div className="container">
      <NetworkBanner />
      <div className="card">
        <h2>Factory</h2>
        <div className="kv">
          <div className="k">Address</div>
          <div className="code">{factoryAddress(chainId ?? undefined)}</div>
          <div className="k">Owner</div>
          <div className="code">{owner ?? "—"}</div>
          <div className="k">agreementCount</div>
          <div>{agreements.length}</div>
          <div className="k">Connected wallet is owner</div>
          <div>{isOwner ? "Yes" : "No"}</div>
        </div>
      </div>

      {configured && (
        <div className="card">
          <h2>Approve arbitrator</h2>
          {!isOwner && (
            <div className="banner">
              Only the factory owner can approve or revoke arbitrators.
              Connected wallet does not own this factory.
            </div>
          )}
          <label className="field">
            Arbitrator address
            <input
              className="input"
              value={arbitrator}
              onChange={(e) => setArbitrator(e.target.value)}
              placeholder="0x…"
            />
          </label>
          <div className="row" style={{ justifyContent: "flex-end", marginTop: 12 }}>
            <button className="btn btn-secondary" disabled={!isOwner || busy || !isAddress(arbitrator)} onClick={revoke}>
              Revoke
            </button>
            <button className="btn" disabled={!isOwner || busy || !isAddress(arbitrator)} onClick={approve}>
              Approve
            </button>
          </div>
        </div>
      )}

      {configured && (
        <div className="card">
          <h2>Check approval status</h2>
          <p className="muted small" style={{ marginTop: 0 }}>
            The factory does not enumerate approved arbitrators on-chain — query a specific address instead.
          </p>
          <div className="row">
            <input
              className="input"
              value={lookup}
              onChange={(e) => setLookup(e.target.value)}
              placeholder="0x…"
              style={{ flex: 1 }}
            />
            <button className="btn" disabled={!isAddress(lookup)} onClick={checkApproval}>
              Check
            </button>
          </div>
          {lookupResult !== null && (
            <p className="small" style={{ marginTop: 10 }}>
              Status:{" "}
              {lookupResult ? (
                <span className="pill pill-success">Approved</span>
              ) : (
                <span className="pill pill-danger">Not approved</span>
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
