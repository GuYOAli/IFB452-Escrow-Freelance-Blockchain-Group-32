import { Contract, ContractRunner } from "ethers";
import factoryAbi from "./abi/EscrowFactory.json";
import agreementAbi from "./abi/EscrowAgreement.json";
import { factoryAddress } from "../config/contracts";

export function getFactory(runner: ContractRunner, chainId?: number): Contract {
  const address = factoryAddress(chainId);
  return new Contract(address, factoryAbi as any, runner);
}

export function getAgreement(address: string, runner: ContractRunner): Contract {
  return new Contract(address, agreementAbi as any, runner);
}

export const STATE_LABELS = [
  "CREATED",
  "FUNDED",
  "SUBMITTED",
  "RELEASED",
  "DISPUTED",
  "RESOLVED",
  "REFUNDED",
] as const;

export type EscrowStateLabel = (typeof STATE_LABELS)[number];

export function stateLabel(value: number | bigint): EscrowStateLabel {
  const idx = Number(value);
  return (STATE_LABELS[idx] ?? "CREATED") as EscrowStateLabel;
}
