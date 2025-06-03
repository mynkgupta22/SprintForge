import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectUser } from "@/redux/features/user/userSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Zap,
  ChevronDown,
  LogOut,
  Settings,
  User as UserIcon,
  Folder,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";

function Topbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

  return (
    <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        {/* Logo and Brand */}
        <div className="flex items-center">
          <div className="flex items-center justify-center h-9 w-9 rounded-md bg-primary mr-2">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text ">SprintForge</h1>
        </div>

        <div className="flex flex-1 items-center justify-between">
          {/* Workspace Selector */}
          <div className="flex items-center">
            <Badge
              variant="outline"
              className="px-3 py-1.5 ml-4 border-2 border-primary/20 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="font-medium">
                  {user?.workspaceName || "Default Workspace"}
                </span>
                {/* <ChevronDown className="h-4 w-4 text-muted-foreground" /> */}
              </div>
            </Badge>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.profileImage}
                      alt={user?.firstName || "User"}
                    />
                    <AvatarFallback className="bg-primary">
                      {user?.firstName?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="flex-col items-start p-3">
                  <div className="text-sm font-medium text-foreground mb-1">
                    {user?.firstName || "User"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user?.email || "user@example.com"}
                  </div>
                </DropdownMenuItem>
                <Separator />
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => window.location.href = '/projects'}
                >
                  <Folder className="mr-2 h-4 w-4" />
                  <span>Projects</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <Separator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="pl-10"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Topbar;
