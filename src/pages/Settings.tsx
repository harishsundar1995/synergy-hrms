import { UserProfile } from "@clerk/clerk-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, Shield, User, Palette, Globe, Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export default function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground text-lg">Manage your account settings and preferences.</p>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Quick Settings Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="email-notifications" className="text-sm font-medium">Email notifications</Label>
                    <p className="text-xs text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="push-notifications" className="text-sm font-medium">Push notifications</Label>
                    <p className="text-xs text-muted-foreground">Browser notifications</p>
                  </div>
                  <Switch id="push-notifications" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="weekly-reports" className="text-sm font-medium">Weekly reports</Label>
                    <p className="text-xs text-muted-foreground">Summary emails every week</p>
                  </div>
                  <Switch id="weekly-reports" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                    <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="profile-visibility" className="text-sm font-medium">Profile visibility</Label>
                    <p className="text-xs text-muted-foreground">Show profile to team members</p>
                  </div>
                  <Switch id="profile-visibility" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="activity-status" className="text-sm font-medium">Activity status</Label>
                    <p className="text-xs text-muted-foreground">Show when you're online</p>
                  </div>
                  <Switch id="activity-status" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="data-sharing" className="text-sm font-medium">Analytics data sharing</Label>
                    <p className="text-xs text-muted-foreground">Help improve our platform</p>
                  </div>
                  <Switch id="data-sharing" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                    <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Theme preference</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant={theme === "light" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setTheme("light")}
                      className="flex flex-col items-center gap-2 h-auto py-3"
                    >
                      <Sun className="h-4 w-4" />
                      <span className="text-xs">Light</span>
                    </Button>
                    <Button 
                      variant={theme === "dark" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setTheme("dark")}
                      className="flex flex-col items-center gap-2 h-auto py-3"
                    >
                      <Moon className="h-4 w-4" />
                      <span className="text-xs">Dark</span>
                    </Button>
                    <Button 
                      variant={theme === "system" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setTheme("system")}
                      className="flex flex-col items-center gap-2 h-auto py-3"
                    >
                      <Monitor className="h-4 w-4" />
                      <span className="text-xs">System</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Management Main Panel */}
          <div className="lg:col-span-8">
            <Card className="shadow-sm overflow-hidden">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/20">
                    <User className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  Account Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-hidden">
                <div className="px-6 pb-6 max-w-full overflow-hidden">
                  <div className="w-full max-w-full overflow-hidden">
                    <UserProfile 
                      appearance={{
                        elements: {
                          rootBox: "w-full max-w-full overflow-hidden",
                          cardBox: "shadow-none border-0 w-full max-w-full",
                          navbar: "hidden",
                          navbarMobileMenuButton: "hidden",
                          headerTitle: "hidden",
                          headerSubtitle: "hidden",
                          profilePage: "bg-transparent w-full max-w-full overflow-hidden",
                          page: "bg-transparent shadow-none w-full max-w-full overflow-hidden",
                          pageScrollBox: "bg-transparent w-full max-w-full overflow-hidden",
                          card: "bg-transparent shadow-none border-0 w-full max-w-full overflow-hidden",
                          formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                          formFieldInput: "border-input bg-background text-foreground",
                          profileSectionContent: "w-full max-w-full overflow-hidden",
                          profileSection: "w-full max-w-full overflow-hidden",
                          profileSectionPrimaryButton: "bg-primary hover:bg-primary/90 text-primary-foreground",
                          profileSectionTitleText: "text-foreground",
                          profileSectionSubtitleText: "text-muted-foreground",
                          avatarBox: "overflow-hidden",
                          avatarImageActions: "bg-background/80 backdrop-blur-sm",
                          avatarImageActionsUpload: "text-primary hover:text-primary/80",
                          avatarImageActionsRemove: "text-destructive hover:text-destructive/80",
                        },
                        variables: {
                          colorPrimary: "hsl(259, 94%, 51%)",
                          colorBackground: "hsl(var(--background))",
                          colorText: "hsl(var(--foreground))",
                          colorTextSecondary: "hsl(var(--muted-foreground))",
                          colorInputBackground: "hsl(var(--background))",
                          colorInputText: "hsl(var(--foreground))",
                          colorTextOnPrimaryBackground: "hsl(var(--primary-foreground))",
                          colorDanger: "hsl(var(--destructive))",
                          borderRadius: "0.5rem",
                          spacingUnit: "1rem",
                          fontSize: "0.875rem",
                        }
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
