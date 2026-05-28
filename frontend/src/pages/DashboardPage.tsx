import { useState } from "react";
import { FreelancerMarketplace } from "@/features/escrow/ui/FreelancerMarketplace";
import { CreateEscrowForm } from "@/features/escrow/ui/CreateEscrowForm";
import { MyAgreementsList } from "@/features/escrow/ui/MyAgreementsList";
import { useFactory } from "@/features/escrow/hooks/useFactory";
import { NetworkBanner } from "@/components/NetworkBanner";

export default function DashboardPage() {
  const [prefillAddress, setPrefillAddress] = useState<string | undefined>();
  const [prefillAmount, setPrefillAmount] = useState<string | undefined>();
  const { agreements, loading, refresh } = useFactory();

  return (
    <div className="container">
      <NetworkBanner />
      <FreelancerMarketplace
        onHire={(addr, eth) => {
          setPrefillAddress(addr);
          setPrefillAmount(String(eth));
          // Scroll to the create form so the prefill is visible.
          setTimeout(() => {
            document.getElementById("create-escrow")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 0);
        }}
      />
      <div id="create-escrow">
        <CreateEscrowForm
          prefilledFreelancer={prefillAddress}
          prefilledAmount={prefillAmount}
          onCreated={refresh}
        />
      </div>
      <MyAgreementsList agreements={agreements} loading={loading} />
    </div>
  );
}
