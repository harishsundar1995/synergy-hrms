import Header from "@/components/Header";
import WellBeingDashboard from "@/components/WellBeingDashboard";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Welcome back to Synergy 👋</h1>
          <p className="text-muted-foreground">Here's what's happening with your team today.</p>
        </div>
        <WellBeingDashboard />
      </div>
    </DashboardLayout>
  );
}