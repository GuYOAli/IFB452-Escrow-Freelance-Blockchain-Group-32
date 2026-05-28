import { Contract, ContractRunner, parseEther } from "ethers";
import { getFactory } from "@/lib/web3/contracts";

export async function readAgreementCount(runner: ContractRunner, chainId?: number): Promise<number> {
  const factory = getFactory(runner, chainId);
  const count: bigint = await factory.agreementCount();
  return Number(count);
}

export async function readAgreementAddresses(
  runner: ContractRunner,
  chainId?: number,
): Promise<{ id: number; address: string }[]> {
  const factory = getFactory(runner, chainId);
  const count: bigint = await factory.agreementCount();
  const total = Number(count);
  const list: { id: number; address: string }[] = [];
  for (let i = 0; i < total; i++) {
    const addr: string = await factory.agreements(i);
    list.push({ id: i, address: addr });
  }
  return list;
}

export async function readFactoryOwner(runner: ContractRunner, chainId?: number): Promise<string> {
  const factory = getFactory(runner, chainId);
  return factory.owner();
}

export async function readIsArbitratorApproved(
  runner: ContractRunner,
  arbitrator: string,
  chainId?: number,
): Promise<boolean> {
  const factory = getFactory(runner, chainId);
  return factory.isArbitratorApproved(arbitrator);
}

export async function callApproveArbitrator(
  runner: ContractRunner,
  arbitrator: string,
  chainId?: number,
) {
  const factory = getFactory(runner, chainId) as Contract;
  return factory.approveArbitrator(arbitrator);
}

export async function callRevokeArbitrator(
  runner: ContractRunner,
  arbitrator: string,
  chainId?: number,
) {
  const factory = getFactory(runner, chainId) as Contract;
  return factory.revokeArbitrator(arbitrator);
}

export async function callCreateAgreement(
  runner: ContractRunner,
  args: {
    freelancer: string;
    arbitrator: string;
    amountEth: string;
    jobHash: string;
  },
  chainId?: number,
) {
  const factory = getFactory(runner, chainId) as Contract;
  const amountWei = parseEther(args.amountEth);
  return factory.createAgreement(
    args.freelancer,
    args.arbitrator,
    amountWei,
    args.jobHash,
  );
}
