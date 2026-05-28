import { EscrowStateLabel } from "@/lib/web3/contracts";

const STATE_TONE: Record<EscrowStateLabel, string> = {
  CREATED: "pill-info",
  FUNDED: "pill-info",
  SUBMITTED: "pill-warn",
  RELEASED: "pill-success",
  DISPUTED: "pill-danger",
  RESOLVED: "pill-success",
  REFUNDED: "pill-warn",
};

export function StateBadge({ label }: { label: EscrowStateLabel }) {
  return <span className={`pill ${STATE_TONE[label]}`}>{label}</span>;
}
