import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Building,
  LayoutDashboard, Calendar,
  Users, BadgePercent,Gift
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import logo from "@/assets/logo.png";

const NavItem = ({ to, icon: Icon, label, isCollapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <NavLink to={to} className="w-full">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              isCollapsed && "justify-center px-2"
            )}
          >
            <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
            {!isCollapsed && <span className="truncate">{label}</span>}
          </Button>
        </NavLink>
      </TooltipTrigger>
      {isCollapsed && (
        <TooltipContent side="right" className="bg-background shadow-md border border-border/60">
          {label}
        </TooltipContent>
      )}
    </Tooltip>
  );
};

const NavGroup = ({ title, children, isCollapsed }) => {
  return (
    <div className="space-y-1">
      {!isCollapsed && (
        <div className="px-3 py-2">
          <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
};

const Sidebar = ({ className }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen overflow-y-auto border-r border-border/60 bg-white backdrop-blur-sm transition-all duration-300 ease-apple",
        isCollapsed ? "w-16" : "w-60",
        className
      )}
    >
      <div className="flex h-16 items-center justify-between px-3 border-b border-border/60">
        <div className={cn("flex items-center gap-2", isCollapsed && "justify-center w-full")}>
          <div className="flex h-7 w-7 items-center justify-center rounded-md">
            <img src={logo} alt="Logo" className="h-8 w-10" />
          </div>
          {!isCollapsed && <span className="font-semibold">Hotel</span>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "text-muted-foreground hover:text-foreground transition-all",
            isCollapsed
              ? "absolute -right-5 top-4 z-50 flex bg-background border rounded-full shadow-md"
              : ""
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div
        className={cn(
          "flex flex-col gap-4 overflow-y-auto py-4",
          isCollapsed && "items-center",
          "h-[calc(100vh-4rem)]" // Adjust if you have a header/navbar
        )}
      >
        {/* <NavGroup title="Overview" isCollapsed={isCollapsed}>
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" isCollapsed={isCollapsed} />
        </NavGroup> */}

        <NavGroup >
          {/* <NavItem to="/users" icon={Users} label="Users & Customers" isCollapsed={isCollapsed} /> */}
          <NavItem to="/" icon={Building} label="Rooms" isCollapsed={isCollapsed} />
          <NavItem to="/booking" icon={Calendar} label="Bookings" isCollapsed={isCollapsed} />
          {/* <NavItem to="/spacetype" icon={Building} label="Space Type" isCollapsed={isCollapsed} />
          <NavItem to="/coupons" icon={BadgePercent} label="Coupons" isCollapsed={isCollapsed} />
          <NavItem to="/reward" icon={Gift} label="Reward System" isCollapsed={isCollapsed} /> */}
        </NavGroup>

        {/* {!isCollapsed && <Separator className="my-2" />} */}

        {/* <NavGroup title="System" isCollapsed={isCollapsed}>
          <NavItem to="/settings" icon={Settings} label="Settings" isCollapsed={isCollapsed} />
          <NavItem to="/notifications" icon={Bell} label="Notifications" isCollapsed={isCollapsed} />
        </NavGroup> */}
      </div>
    </aside>
  );
};

export default Sidebar;