import Header from "@/components/Header";
import Analytics from "./Analytics";
import Teams from "./Teams";
import Settings from "./Settings";

import WellBeingDashboard from "@/components/WellBeingDashboard";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <WellBeingDashboard />
      </main>
    </div>
  );
}