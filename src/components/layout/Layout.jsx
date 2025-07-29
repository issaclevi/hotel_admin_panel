import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import Header from "./Header";
import PageTransition from "./PageTransition";
import { cn } from "@/lib/utils";

const Layout = ({ children }) => {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);
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
    <div className="flex min-h-screen">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={cn("flex flex-col flex-1 overflow-hidden", isCollapsed ? "ml-16" : "ml-60")}>
        <Header title={pageTitle} />
        <main className="flex-1 overflow-y-auto p-6 mt-14">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              {children || <Outlet />}
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

function getPageTitle(pathname) {
  switch (pathname) {
    case "/":
      return "Dashboard";
    case "/role":
      return "Role Management";
    case "/users":
      return "User Management";
    case "/booking":
      return "Bookings & Appointments";
    case "/room":
      return "Room Management";
    case "/stores":
      return "Store Management";
    case "/orders":
      return "Order Management";
    case "/deliveries":
      return "Delivery Tracking";
    case "/medicines":
      return "Medicine Library";
    case "/stock":
      return "Stock Management";
    case "/warehouse":
      return "Warehouse Management";
    case "/billing":
      return "Billing & Reports";
    case "/settings":
      return "Settings";
    case "/notifications":
      return "Notifications";
    case "/login":
      return "Login";
    case "/register":
      return "Register";
    default:
      return "Dashboard";
  }
}

export default Layout;