import { UserProfile } from "@clerk/clerk-react";
import Header from "@/components/Header";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>
        
        <div className="max-w-4xl">
          <UserProfile 
            appearance={{
              elements: {
                card: "shadow-elegant border-border",
                navbar: "hidden",
                pageScrollBox: "p-0",
              }
            }}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
