import { useState } from "react";
import { useWallet } from "@/lib/web3/WalletContext";
import { useToast } from "@/components/ToastProvider";
import { Modal } from "@/components/Modal";
import { AgreementSnapshot } from "../api/agreement";
import {
  callApproveRelease,
  callFundAgreement,
  callRaiseDispute,
  callRefundClient,
  callResolveDispute,
  callSubmitWork,
} from "../api/agreement";

interface Props {
  agreement: AgreementSnapshot;
  onChanged: () => void;
}

type Modal =
  | { kind: "submit" }
  | { kind: "dispute" }
  | { kind: "resolve"; payFreelancer: boolean }
  | null;

export function AgreementActions({ agreement, onChanged }: Props) {
  const { signer, address } = useWallet();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [text, setText] = useState("");

  const me = (address ?? "").toLowerCase();
  const isClient = me === agreement.client.toLowerCase();
  const isFreelancer = me === agreement.freelancer.toLowerCase();
  const isArbitrator = me === agreement.arbitrator.toLowerCase();

  const s = agreement.stateLabel;

  async function run(label: string, fn: () => Promise<any>) {
    if (!signer) return toast.error("Connect wallet first");
    setBusy(true);
    try {
      const tx = await fn();
      toast.info(`Tx submitted: ${label}`);
      const receipt = await tx.wait();
      toast.success(`${label} confirmed (block #${receipt?.blockNumber})`);
      onChanged();
    } catch (err: any) {
      toast.error(parseRevert(err));
    } finally {
      setBusy(false);
      setModal(null);
      setText("");
    }
  }

  // Available action buttons based on connected role + current state.
  const actions: React.ReactNode[] = [];

  if (isClient && s === "CREATED") {
    actions.push(
      <button key="fund" className="btn" disabled={busy} onClick={() =>
        run("Fund agreement", () => callFundAgreement(agreement.address, signer!, agreement.amountWei))
      }>
        Fund {String(Number(agreement.amountWei) / 1e18)} ETH
      </button>,
    );
  }

  if (isClient && s === "SUBMITTED") {
    actions.push(
      <button key="approve" className="btn" disabled={busy} onClick={() =>
        run("Approve release", () => callApproveRelease(agreement.address, signer!))
      }>
        Approve & Release
      </button>,
    );
  }

  if ((isClient || isFreelancer) && (s === "FUNDED" || s === "SUBMITTED")) {
    actions.push(
      <button key="dispute" className="btn btn-danger" disabled={busy} onClick={() => setModal({ kind: "dispute" })}>
        Raise Dispute
      </button>,
    );
  }

  if (isClient && s === "FUNDED") {
    actions.push(
      <button key="refund" className="btn btn-secondary" disabled={busy} onClick={() =>
        run("Refund client", () => callRefundClient(agreement.address, signer!))
      }>
        Refund (no submission)
      </button>,
    );
  }

  if (isFreelancer && s === "FUNDED") {
    actions.push(
      <button key="submit" className="btn" disabled={busy} onClick={() => setModal({ kind: "submit" })}>
        Submit Work
      </button>,
    );
  }

  if (isArbitrator && s === "DISPUTED") {
    actions.push(
      <button key="payF" className="btn" disabled={busy} onClick={() => setModal({ kind: "resolve", payFreelancer: true })}>
        Resolve: Pay Freelancer
      </button>,
      <button key="refundC" className="btn btn-secondary" disabled={busy} onClick={() => setModal({ kind: "resolve", payFreelancer: false })}>
        Resolve: Refund Client
      </button>,
    );
  }

  return (
    <div className="card">
      <h2>Actions</h2>
      {actions.length === 0 ? (
        <div className="muted small">
          No actions available for the connected wallet in state <span className="pill">{s}</span>.
        </div>
      ) : (
        <div className="row">{actions}</div>
      )}

      <Modal
        open={modal?.kind === "submit"}
        title="Submit Work"
        onClose={() => { setModal(null); setText(""); }}
        footer={
          <button
            className="btn"
            disabled={busy || !text.trim()}
            onClick={() =>
              run("Submit work", () => callSubmitWork(agreement.address, signer!, text.trim()))
            }
          >
            Submit
          </button>
        }
      >
        <label className="field">
          Deliverable reference (hash / IPFS CID / URL)
          <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="ipfs://…" />
        </label>
      </Modal>

      <Modal
        open={modal?.kind === "dispute"}
        title="Raise Dispute"
        onClose={() => { setModal(null); setText(""); }}
        footer={
          <button
            className="btn btn-danger"
            disabled={busy || !text.trim()}
            onClick={() =>
              run("Raise dispute", () => callRaiseDispute(agreement.address, signer!, text.trim()))
            }
          >
            Raise Dispute
          </button>
        }
      >
        <label className="field">
          Reason reference (hash / IPFS CID / URL)
          <textarea className="input" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="ipfs://… or short note" />
        </label>
      </Modal>

      <Modal
        open={modal?.kind === "resolve"}
        title={modal?.kind === "resolve" && modal.payFreelancer ? "Pay Freelancer" : "Refund Client"}
        onClose={() => setModal(null)}
        footer={
          <button
            className="btn"
            disabled={busy}
            onClick={() =>
              run(
                modal?.kind === "resolve" && modal.payFreelancer ? "Pay freelancer" : "Refund client",
                () => callResolveDispute(
                  agreement.address,
                  signer!,
                  !!(modal?.kind === "resolve" && modal.payFreelancer),
                ),
              )
            }
          >
            Confirm
          </button>
        }
      >
        <p className="muted small" style={{ margin: 0 }}>
          The arbitrator decision moves the contract balance.
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

function parseRevert(err: any): string {
  return err?.shortMessage ?? err?.reason ?? err?.info?.error?.message ?? err?.message ?? "Tx failed";
}
