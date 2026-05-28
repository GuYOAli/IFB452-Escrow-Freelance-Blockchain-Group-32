import { Link, useParams } from "react-router-dom";
import { isAddress } from "ethers";
import { useAgreement } from "@/features/escrow/hooks/useAgreement";
import { useAgreementEvents } from "@/features/escrow/hooks/useEvents";
import { AgreementSummary } from "@/features/escrow/ui/AgreementSummary";
import { AgreementActions } from "@/features/escrow/ui/AgreementActions";
import { EscrowTimelineChart } from "@/components/charts/EscrowTimelineChart";
import { NetworkBanner } from "@/components/NetworkBanner";
import { shortAddress } from "@/lib/web3/wallet";

export default function AgreementPage() {
  const { address } = useParams<{ address: string }>();
  const valid = !!address && isAddress(address);
  const { data, loading, error, refresh } = useAgreement(valid ? address! : null);
  const { events, refresh: refreshEvents } = useAgreementEvents(valid ? address! : null);

  return (
    <div className="container">
      <NetworkBanner />

      <div className="row" style={{ marginBottom: 12 }}>
        <Link to="/" className="btn btn-secondary">← Back</Link>
        {valid && <span className="muted small">Agreement {shortAddress(address!)}</span>}
      </div>

      {!valid && (
        <div className="card">
          <p>Invalid agreement address.</p>
          <Link className="btn" to="/">Go home</Link>
        </div>
      )}

      {valid && loading && !data && (
        <div className="card">Loading agreement…</div>
      )}

      {valid && error && !data && (
        <div className="card">
          <p style={{ color: "var(--danger)" }}>Failed to load: {error}</p>
        </div>
      )}

      {valid && data && (
        <>
          <AgreementSummary snap={data} />
          <AgreementActions
            agreement={data}
            onChanged={() => {
              void refresh();
              void refreshEvents();
            }}
          />
          <div className="card">
            <h2>Event Timeline</h2>
            <EscrowTimelineChart events={events} />
          </div>
        </>
      )}
    </div>
  );
}
