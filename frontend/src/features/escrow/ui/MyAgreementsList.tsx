import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { formatEther } from "ethers";
import { useWallet } from "@/lib/web3/WalletContext";
import { readAgreement } from "../api/agreement";
import { StateBadge } from "@/components/StateBadge";
import { shortAddress } from "@/lib/web3/wallet";
import { stateLabel } from "@/lib/web3/contracts";

interface Row {
  id: number;
  address: string;
  amount: string;
  stateValue: number;
  client: string;
  freelancer: string;
  arbitrator: string;
}

interface Props {
  agreements: { id: number; address: string }[];
  loading: boolean;
}

export function MyAgreementsList({ agreements, loading }: Props) {
  const { provider, address } = useWallet();
  const [rows, setRows] = useState<Row[]>([]);
  const [hydrating, setHydrating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!provider || agreements.length === 0) {
      setRows([]);
      return;
    }
    setHydrating(true);
    Promise.all(
      agreements.map(async ({ id, address: addr }) => {
        try {
          const snap = await readAgreement(addr, provider);
          return {
            id,
            address: addr,
            amount: formatEther(snap.amountWei),
            stateValue: snap.state,
            client: snap.client,
            freelancer: snap.freelancer,
            arbitrator: snap.arbitrator,
          } as Row;
        } catch {
          return null;
        }
      }),
    ).then((all) => {
      if (cancelled) return;
      setRows(all.filter(Boolean) as Row[]);
      setHydrating(false);
    });
    return () => { cancelled = true; };
  }, [agreements, provider]);

  const me = (address ?? "").toLowerCase();
  const myRows = useMemo(
    () =>
      rows.filter(
        (r) =>
          !!me &&
          (r.client.toLowerCase() === me ||
            r.freelancer.toLowerCase() === me ||
            r.arbitrator.toLowerCase() === me),
      ),
    [rows, me],
  );

  const roleFor = (r: Row): string => {
    if (!me) return "—";
    if (r.client.toLowerCase() === me) return "Client";
    if (r.freelancer.toLowerCase() === me) return "Freelancer";
    if (r.arbitrator.toLowerCase() === me) return "Arbitrator";
    return "Observer";
  };

  return (
    <div className="card">
      <h2>My Agreements</h2>
      {loading || hydrating ? (
        <div className="muted small">Loading…</div>
      ) : myRows.length === 0 ? (
        <div className="muted small">
          No agreements yet for the connected wallet. Create one above, or hire a freelancer to pre-fill the form.
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Address</th>
              <th>Amount</th>
              <th>State</th>
              <th>Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {myRows.map((r) => (
              <tr key={r.address}>
                <td>#{r.id}</td>
                <td><span className="code" title={r.address}>{shortAddress(r.address)}</span></td>
                <td>{r.amount} ETH</td>
                <td><StateBadge label={stateLabel(r.stateValue)} /></td>
                <td><span className="pill">{roleFor(r)}</span></td>
                <td>
                  <Link className="btn btn-secondary" to={`/agreement/${r.address}`}>Open</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
