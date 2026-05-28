import { useEffect, useState } from "react";
import { isAddress } from "ethers";
import { useWallet } from "@/lib/web3/WalletContext";
import { useToast } from "@/components/ToastProvider";
import { callCreateAgreement, readIsArbitratorApproved } from "../api/factory";
import { isFactoryConfigured } from "@/lib/config/contracts";

interface Props {
  prefilledFreelancer?: string;
  prefilledAmount?: string;
  onCreated?: () => void;
}

export function CreateEscrowForm({ prefilledFreelancer, prefilledAmount, onCreated }: Props) {
  const { signer, chainId, isCorrectNetwork } = useWallet();
  const toast = useToast();

  const [freelancer, setFreelancer] = useState("");
  const [arbitrator, setArbitrator] = useState("");
  const [amount, setAmount] = useState("");
  const [jobHash, setJobHash] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [arbApproved, setArbApproved] = useState<boolean | null>(null);

  useEffect(() => {
    if (prefilledFreelancer) setFreelancer(prefilledFreelancer);
  }, [prefilledFreelancer]);
  useEffect(() => {
    if (prefilledAmount) setAmount(prefilledAmount);
  }, [prefilledAmount]);

  // Probe arbitrator-approval as soon as the user finishes typing.
  useEffect(() => {
    setArbApproved(null);
    if (!signer || !isAddress(arbitrator)) return;
    let cancelled = false;
    readIsArbitratorApproved(signer, arbitrator, chainId ?? undefined)
      .then((ok) => { if (!cancelled) setArbApproved(ok); })
      .catch(() => { if (!cancelled) setArbApproved(null); });
    return () => { cancelled = true; };
  }, [signer, arbitrator, chainId]);

  const factoryReady = isFactoryConfigured(chainId ?? undefined);

  const validAddrs = isAddress(freelancer) && isAddress(arbitrator);
  const validAmount = !!amount && Number(amount) > 0;
  const validJob = jobHash.trim().length > 0;
  const canSubmit =
    !!signer &&
    isCorrectNetwork &&
    factoryReady &&
    validAddrs &&
    validAmount &&
    validJob &&
    arbApproved !== false &&
    !submitting;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signer) return toast.error("Connect your wallet first.");
    if (!validAddrs) return toast.error("Invalid Ethereum address(es).");
    if (!validAmount) return toast.error("Amount must be > 0.");
    if (!validJob) return toast.error("Job spec reference required.");
    setSubmitting(true);
    try {
      const tx = await callCreateAgreement(
        signer,
        { freelancer, arbitrator, amountEth: amount, jobHash },
        chainId ?? undefined,
      );
      toast.info("Tx submitted: creating agreement…");
      const receipt = await tx.wait();
      toast.success(`Agreement created (block #${receipt?.blockNumber})`);
      setJobHash("");
      onCreated?.();
    } catch (err: any) {
      toast.error(parseRevert(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      <h2>Create Escrow</h2>
      {!factoryReady && (
        <div className="banner">
          Factory address is not configured. Set <span className="code">VITE_FACTORY_ADDRESS</span> in
          <span className="code">.env</span> or update <span className="code">deployments/&lt;network&gt;.json</span>.
        </div>
      )}
      <div className="col">
        <label className="field">
          Freelancer wallet address
          <input
            className="input"
            placeholder="0x…"
            value={freelancer}
            onChange={(e) => setFreelancer(e.target.value)}
          />
        </label>
        <label className="field">
          Arbitrator address
          <input
            className="input"
            placeholder="0x…"
            value={arbitrator}
            onChange={(e) => setArbitrator(e.target.value)}
          />
          {isAddress(arbitrator) && arbApproved === false && (
            <span className="small" style={{ color: "var(--danger)" }}>
              This arbitrator is not approved by the platform admin.
            </span>
          )}
          {isAddress(arbitrator) && arbApproved === true && (
            <span className="small" style={{ color: "var(--success)" }}>
              Arbitrator approved.
            </span>
          )}
        </label>
        <label className="field">
          Amount (ETH)
          <input
            className="input"
            type="number"
            min="0"
            step="0.0001"
            placeholder="0.5"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <label className="field">
          Job spec reference (hash / IPFS CID / URL)
          <input
            className="input"
            placeholder="ipfs://… or https://…"
            value={jobHash}
            onChange={(e) => setJobHash(e.target.value)}
          />
        </label>
      </div>
      <div className="row" style={{ justifyContent: "flex-end", marginTop: 12 }}>
        <button className="btn" type="submit" disabled={!canSubmit}>
          {submitting ? "Submitting…" : "Create Agreement"}
        </button>
      </div>
    </form>
  );
}

function parseRevert(err: any): string {
  return err?.shortMessage ?? err?.reason ?? err?.info?.error?.message ?? err?.message ?? "Tx failed";
}
