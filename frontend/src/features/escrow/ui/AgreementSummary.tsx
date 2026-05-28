import { formatEther } from "ethers";
import { AgreementSnapshot } from "../api/agreement";
import { StateBadge } from "@/components/StateBadge";

export function AgreementSummary({ snap }: { snap: AgreementSnapshot }) {
  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h2 style={{ marginBottom: 0 }}>Agreement</h2>
        <StateBadge label={snap.stateLabel} />
      </div>
      <div className="kv" style={{ marginTop: 12 }}>
        <div className="k">Address</div>
        <div className="code">{snap.address}</div>

        <div className="k">Client</div>
        <div className="code">{snap.client}</div>

        <div className="k">Freelancer</div>
        <div className="code">{snap.freelancer}</div>

        <div className="k">Arbitrator</div>
        <div className="code">{snap.arbitrator}</div>

        <div className="k">Escrow amount</div>
        <div>{formatEther(snap.amountWei)} ETH</div>

        <div className="k">Contract balance</div>
        <div>{formatEther(snap.balanceWei)} ETH</div>

        <div className="k">Job spec</div>
        <div className="code">{snap.jobHash || <span className="muted">—</span>}</div>

        <div className="k">Deliverable</div>
        <div className="code">{snap.deliverableHash || <span className="muted">—</span>}</div>

        <div className="k">Dispute reason</div>
        <div className="code">{snap.disputeReasonHash || <span className="muted">—</span>}</div>

        <div className="k">Freelancer paid</div>
        <div>{snap.freelancerPaid ? "Yes" : "No"}</div>
      </div>
    </div>
  );
}
