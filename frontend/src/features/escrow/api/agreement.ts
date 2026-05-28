import { Contract, ContractRunner, EventLog, Log } from "ethers";
import { getAgreement, stateLabel, EscrowStateLabel } from "@/lib/web3/contracts";

export interface AgreementSnapshot {
  address: string;
  client: string;
  freelancer: string;
  arbitrator: string;
  amountWei: bigint;
  balanceWei: bigint;
  jobHash: string;
  deliverableHash: string;
  disputeReasonHash: string;
  state: number;
  stateLabel: EscrowStateLabel;
  freelancerPaid: boolean;
}

export async function readAgreement(
  address: string,
  runner: ContractRunner,
): Promise<AgreementSnapshot> {
  const c = getAgreement(address, runner);
  const [
    client,
    freelancer,
    arbitrator,
    amountWei,
    balanceWei,
    jobHash,
    deliverableHash,
    disputeReasonHash,
    state,
    freelancerPaid,
  ] = await Promise.all([
    c.client(),
    c.freelancer(),
    c.arbitrator(),
    c.amount(),
    c.getBalance(),
    c.jobHash(),
    c.deliverableHash(),
    c.disputeReasonHash(),
    c.state(),
    c.freelancerPaid(),
  ]);

  return {
    address,
    client,
    freelancer,
    arbitrator,
    amountWei,
    balanceWei,
    jobHash,
    deliverableHash,
    disputeReasonHash,
    state: Number(state),
    stateLabel: stateLabel(state),
    freelancerPaid,
  };
}

export async function callFundAgreement(
  address: string,
  runner: ContractRunner,
  amountWei: bigint,
) {
  const c = getAgreement(address, runner) as Contract;
  return c.fundAgreement({ value: amountWei });
}

export async function callSubmitWork(
  address: string,
  runner: ContractRunner,
  deliverableHash: string,
) {
  const c = getAgreement(address, runner) as Contract;
  return c.submitWork(deliverableHash);
}

export async function callApproveRelease(
  address: string,
  runner: ContractRunner,
) {
  const c = getAgreement(address, runner) as Contract;
  return c.approveRelease();
}

export async function callRaiseDispute(
  address: string,
  runner: ContractRunner,
  reasonHash: string,
) {
  const c = getAgreement(address, runner) as Contract;
  return c.raiseDispute(reasonHash);
}

export async function callResolveDispute(
  address: string,
  runner: ContractRunner,
  payFreelancer: boolean,
) {
  const c = getAgreement(address, runner) as Contract;
  return c.resolveDispute(payFreelancer);
}

export async function callRefundClient(
  address: string,
  runner: ContractRunner,
) {
  const c = getAgreement(address, runner) as Contract;
  return c.refundClient();
}

export interface TimelineEvent {
  type:
    | "AgreementFunded"
    | "WorkSubmitted"
    | "DisputeRaised"
    | "DisputeResolved"
    | "FundsReleased"
    | "ClientRefunded";
  blockNumber: number;
  txHash: string;
  actor: string;
  detail?: string;
}

const EVENT_NAMES: TimelineEvent["type"][] = [
  "AgreementFunded",
  "WorkSubmitted",
  "DisputeRaised",
  "DisputeResolved",
  "FundsReleased",
  "ClientRefunded",
];

export async function readAgreementEvents(
  address: string,
  runner: ContractRunner,
): Promise<TimelineEvent[]> {
  const c = getAgreement(address, runner);

  const logsByType = await Promise.all(
    EVENT_NAMES.map(async (name) => {
      try {
        const filter = (c.filters as any)[name]();
        const logs: (EventLog | Log)[] = await c.queryFilter(filter, 0, "latest");
        return logs.map((l): TimelineEvent => {
          const ev = l as EventLog;
          const args = ev.args as any;
          let actor = "";
          let detail: string | undefined;
          switch (name) {
            case "AgreementFunded":
              actor = args?.client ?? "";
              detail = `${args?.amount?.toString() ?? "0"} wei`;
              break;
            case "WorkSubmitted":
              actor = args?.freelancer ?? "";
              detail = args?.deliverableHash ?? "";
              break;
            case "DisputeRaised":
              actor = args?.raisedBy ?? "";
              detail = args?.disputeReasonHash ?? "";
              break;
            case "DisputeResolved":
              actor = args?.arbitrator ?? "";
              detail = args?.payFreelancer ? "Paid freelancer" : "Refunded client";
              break;
            case "FundsReleased":
              actor = args?.freelancer ?? "";
              detail = `${args?.amount?.toString() ?? "0"} wei`;
              break;
            case "ClientRefunded":
              actor = args?.client ?? "";
              detail = `${args?.amount?.toString() ?? "0"} wei`;
              break;
          }
          return {
            type: name,
            blockNumber: l.blockNumber,
            txHash: l.transactionHash,
            actor,
            detail,
          };
        });
      } catch {
        return [] as TimelineEvent[];
      }
    }),
  );

  return logsByType.flat().sort((a, b) => a.blockNumber - b.blockNumber);
}
