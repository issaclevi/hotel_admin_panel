import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Protected Route
import ProtectedRoute from "../utils/ProtectedRoute";
import PublicRoute from "../utils/PublicRoute";

// Layout
import Layout from "@/components/layout/Layout";

// Pages
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";
import Bookings from "../pages/Bookings";
import UserManagement from "../pages/UserManagement";
import Rooms from "../pages/Rooms";
import SpaceType from "../pages/SpaceType";
import Coupons from "../pages/Coupons";
import Reward from "../pages/Reward";
import RewardHistory from "../pages/RewardHistory";

const AppRoutes = () => (
    <BrowserRouter>
        <AnimatePresence mode="wait">
            <Routes>
                {/* Authentication Routes */}
                <Route element={<PublicRoute />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Route>

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<Layout />}>
                        {/* <Route path="/" element={<Dashboard />} /> */}
                        <Route path="/booking" element={<Bookings />} />
                        <Route path="/" element={<Rooms />} />
                        <Route path="/users" element={<UserManagement />} />
                        <Route path="/spacetype" element={<SpaceType />} />
                        <Route path="/coupons" element={<Coupons />} />
                        <Route path="/reward" element={<Reward />} />
                        <Route path="/reward-history/:userId" element={<RewardHistory />} />
                    </Route>
                </Route>
                <Route path="*" element={<NotFound />} />
            </Routes>
        </AnimatePresence>
    </BrowserRouter>
);

export default AppRoutes;