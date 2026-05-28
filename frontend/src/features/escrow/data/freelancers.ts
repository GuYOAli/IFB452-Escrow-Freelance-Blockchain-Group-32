// Off-chain freelancer marketplace mock data (matching is off-chain per the proposal).

export interface FreelancerProfile {
  id: string;
  name: string;
  title: string;
  skills: string[];
  rateEth: number;
  walletAddress: string;
  bio: string;
}

// Wallet addresses below are Hardhat default test accounts 1..5.
export const FREELANCERS: FreelancerProfile[] = [
  {
    id: "f1",
    name: "Maya Chen",
    title: "Full-Stack Web3 Engineer",
    skills: ["React", "TypeScript", "Solidity"],
    rateEth: 0.5,
    walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    bio: "Builds dApp frontends and audits small contracts.",
  },
  {
    id: "f2",
    name: "Liam Park",
    title: "Smart Contract Developer",
    skills: ["Solidity", "Foundry", "Hardhat"],
    rateEth: 0.8,
    walletAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    bio: "Writes ERC-20/721 contracts and runs Slither/Echidna.",
  },
  {
    id: "f3",
    name: "Sara Ali",
    title: "UI / UX Designer",
    skills: ["Figma", "Design Systems", "CSS"],
    rateEth: 0.3,
    walletAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    bio: "Designs token flows, dashboards, and onboarding.",
  },
  {
    id: "f4",
    name: "Diego Rojas",
    title: "Backend Engineer",
    skills: ["Node.js", "GraphQL", "Postgres"],
    rateEth: 0.4,
    walletAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    bio: "Indexes events and builds APIs around on-chain data.",
  },
  {
    id: "f5",
    name: "Ines Kovacs",
    title: "Security Researcher",
    skills: ["Solidity Audit", "Fuzzing", "Reports"],
    rateEth: 1.0,
    walletAddress: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    bio: "Finds re-entrancy and access-control bugs in escrow systems.",
  },
];
