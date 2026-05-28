import { FREELANCERS } from "../data/freelancers";
import { shortAddress } from "@/lib/web3/wallet";

interface Props {
  onHire: (walletAddress: string, suggestedAmountEth: number) => void;
}

export function FreelancerMarketplace({ onHire }: Props) {
  return (
    <div className="card">
      <h2>Freelancer Marketplace <span className="muted small">(off-chain)</span></h2>
      <p className="muted small" style={{ marginTop: 0 }}>
        Profiles browsed off-chain — only the escrow + dispute workflow is on-chain.
      </p>
      <div className="freelancer-grid">
        {FREELANCERS.map((f) => (
          <div key={f.id} className="freelancer">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="name">{f.name}</div>
              <div className="muted small">{f.rateEth} ETH</div>
            </div>
            <div className="muted small">{f.title}</div>
            <div className="skills">
              {f.skills.map((s) => (
                <span key={s} className="pill">{s}</span>
              ))}
            </div>
            <div className="small muted">{f.bio}</div>
            <div className="code small" title={f.walletAddress}>
              {shortAddress(f.walletAddress)}
            </div>
            <button className="btn" onClick={() => onHire(f.walletAddress, f.rateEth)}>
              Hire
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
