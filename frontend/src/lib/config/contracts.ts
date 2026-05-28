import localhostDeployment from "../../../../deployments/localhost.json";
import sepoliaDeployment from "../../../../deployments/sepolia.json";

interface Deployment {
  factoryAddress?: string;
  chainId?: number;
}

const ZERO = "0x0000000000000000000000000000000000000000";

const deployments: Record<number, Deployment> = {
  31337: localhostDeployment as Deployment,
  1337: localhostDeployment as Deployment,
  11155111: sepoliaDeployment as Deployment,
};

const envFactory = (import.meta.env.VITE_FACTORY_ADDRESS ?? "").trim();
const envChainId = Number(import.meta.env.VITE_CHAIN_ID ?? 31337);

export const TARGET_CHAIN_ID: number = Number.isFinite(envChainId) ? envChainId : 31337;

export function factoryAddress(chainId?: number): string {
  if (envFactory && envFactory !== ZERO) return envFactory;
  const cid = chainId ?? TARGET_CHAIN_ID;
  const fromFile = deployments[cid]?.factoryAddress;
  return fromFile && fromFile !== ZERO ? fromFile : ZERO;
}

export function isFactoryConfigured(chainId?: number): boolean {
  return factoryAddress(chainId) !== ZERO;
}
