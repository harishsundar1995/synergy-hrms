import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { 
  LayoutDashboard, 
  Calendar, 
  Clock, 
  FolderOpen, 
  Users, 
  FileText, 
  Gift, 
  Settings, 
  LifeBuoy,
  Brain,
  UserCog,
  Target,
  UserCheck,
  GitBranch
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "AI Intelligence", url: "/ai-intelligence", icon: Brain, badge: "AI" },
  { title: "Employees", url: "/employees", icon: Users },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Projects", url: "/projects", icon: FolderOpen },
];

const managementItems = [
  { title: "User Management", url: "/users", icon: UserCog },
  { title: "Time Off", url: "/time-off", icon: Clock },
  { title: "Benefits", url: "/benefits", icon: Gift },
];

const talentItems = [
  { title: "Jobs", url: "/job-descriptions", icon: FileText },
  { title: "Candidates", url: "/candidates", icon: UserCheck },
  { title: "Pipeline", url: "/pipeline", icon: GitBranch },
  { title: "Interviews", url: "/interviews", icon: Calendar },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + '/');

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4 border-b">
        {state !== "collapsed" && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Brain className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Synergy</p>
              <p className="text-xs text-muted-foreground">HR Management</p>
            </div>
          </div>
        )}
        {state === "collapsed" && (
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
            <Brain className="h-4 w-4 text-primary-foreground" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="flex flex-col gap-2">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={state === "collapsed" ? "sr-only" : "text-xs font-medium text-muted-foreground uppercase tracking-wider px-3"}>
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                        isActive(item.url)
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <item.icon className={`h-4 w-4 ${state === "collapsed" ? "mx-auto" : ""}`} />
                      {state !== "collapsed" && (
                        <>
                          <span className="flex-1 font-medium">{item.title}</span>
                          {item.badge && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary border-primary/20">
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management */}
        <SidebarGroup>
          <SidebarGroupLabel className={state === "collapsed" ? "sr-only" : "text-xs font-medium text-muted-foreground uppercase tracking-wider px-3"}>
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                        isActive(item.url)
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <item.icon className={`h-4 w-4 ${state === "collapsed" ? "mx-auto" : ""}`} />
                      {state !== "collapsed" && (
                        <span className="flex-1 font-medium">{item.title}</span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Talent */}
        <SidebarGroup>
          <SidebarGroupLabel className={state === "collapsed" ? "sr-only" : "text-xs font-medium text-muted-foreground uppercase tracking-wider px-3"}>
            Talent
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {talentItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                        isActive(item.url)
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <item.icon className={`h-4 w-4 ${state === "collapsed" ? "mx-auto" : ""}`} />
                      {state !== "collapsed" && (
                        <span className="flex-1 font-medium">{item.title}</span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        {state !== "collapsed" ? (
          <div className="space-y-1">
            <Link
              to="/settings"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActive("/settings")
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Settings className="h-4 w-4" />
              <span className="font-medium">Settings</span>
            </Link>
            <Link
              to="/support"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActive("/support")
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <LifeBuoy className="h-4 w-4" />
              <span className="font-medium">Support</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            <Link
              to="/settings"
              className={`flex items-center justify-center p-2.5 rounded-lg transition-all duration-200 ${
                isActive("/settings")
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Settings className="h-4 w-4" />
            </Link>
            <Link
              to="/support"
              className={`flex items-center justify-center p-2.5 rounded-lg transition-all duration-200 ${
                isActive("/support")
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <LifeBuoy className="h-4 w-4" />
            </Link>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}