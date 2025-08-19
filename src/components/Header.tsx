import { Bell, Settings, User, Search, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const Header = () => {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm supports-[backdrop-filter]:bg-card/50">
      <div className="flex h-16 items-center px-6">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <div className="h-4 w-4 rounded bg-primary-foreground"></div>
            </div>
            <h1 className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              WellBeing AI
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="ml-12 hidden md:flex items-center space-x-6">
          <Button variant="ghost" className="text-foreground hover:text-primary">
            Dashboard
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:text-primary">
            Analytics
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:text-primary">
            Team Health
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:text-primary">
            Performance
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:text-primary">
            Talent
          </Button>
        </nav>

        {/* Search and Actions */}
        <div className="ml-auto flex items-center space-x-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search insights, employees..."
              className="w-80 pl-10 bg-muted/50 border-border/50 focus:bg-background"
            />
          </div>

          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
            <Bell className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
            <Settings className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium">Jane Doe</span>
                  <span className="text-xs text-muted-foreground">HR Director</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;