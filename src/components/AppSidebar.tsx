import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calendar, 
  Clock, 
  FolderOpen, 
  Users, 
  FileText, 
  Gift, 
  File, 
  Settings, 
  LifeBuoy,
  ChevronRight,
  Brain
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Time Off", url: "/time-off", icon: Clock },
  { title: "Projects", url: "/projects", icon: FolderOpen },
  { title: "Team", url: "/teams", icon: Users },
  { title: "Notes", url: "/notes", icon: FileText },
  { title: "Benefits", url: "/benefits", icon: Gift, badge: "NEW" },
  { title: "Documents", url: "/documents", icon: File },
];

const favoriteItems = [
  { title: "Synergy Team", url: "/teams/synergy", shortcut: "⌘1" },
  { title: "Monday Redesign", url: "/projects/monday", shortcut: "⌘2" },
  { title: "Udemy Courses", url: "/learning/udemy", shortcut: "⌘3" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + '/');

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-60"} collapsible="icon">
      <SidebarHeader className="p-4">
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

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={state === "collapsed" ? "sr-only" : ""}>MAIN</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive(item.url)
                          ? "bg-primary/10 text-primary font-medium border-r-2 border-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <item.icon className={`h-4 w-4 ${state === "collapsed" ? "mx-auto" : ""}`} />
                      {state !== "collapsed" && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                          {isActive(item.url) && <ChevronRight className="h-3 w-3" />}
                        </>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {state !== "collapsed" && (
          <SidebarGroup>
            <SidebarGroupLabel>FAVORITES</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {favoriteItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.url}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span className="flex-1">{item.title}</span>
                        <span className="text-xs text-muted-foreground">{item.shortcut}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        {state !== "collapsed" ? (
          <div className="space-y-3">
            <Link
              to="/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
            <Link
              to="/support"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <LifeBuoy className="h-4 w-4" />
              <span>Support</span>
            </Link>
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">SW</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Sophia Williams</p>
                <p className="text-xs text-muted-foreground truncate">sophia@alignui.com</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Link
              to="/settings"
              className="flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Settings className="h-4 w-4" />
            </Link>
            <Link
              to="/support"
              className="flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <LifeBuoy className="h-4 w-4" />
            </Link>
            <Avatar className="h-8 w-8 mx-auto">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">SW</AvatarFallback>
            </Avatar>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}