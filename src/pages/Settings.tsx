import { UserProfile } from "@clerk/clerk-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, Shield, User, Palette, Globe } from "lucide-react";

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Settings */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">Email notifications</Label>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-notifications">Push notifications</Label>
                  <Switch id="push-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="weekly-reports">Weekly reports</Label>
                  <Switch id="weekly-reports" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="profile-visibility">Profile visibility</Label>
                  <Switch id="profile-visibility" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="activity-status">Activity status</Label>
                  <Switch id="activity-status" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="data-sharing">Analytics data sharing</Label>
                  <Switch id="data-sharing" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Light</Button>
                    <Button variant="outline" size="sm">Dark</Button>
                    <Button variant="default" size="sm">System</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Clerk User Profile */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Account Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UserProfile 
                  appearance={{
                    elements: {
                      card: "shadow-none border-0",
                      navbar: "hidden",
                      pageScrollBox: "p-0",
                      profileSectionPrimaryButton: "bg-primary hover:bg-primary/90",
                    }
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
