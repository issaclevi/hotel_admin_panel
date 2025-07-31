import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon, KeyIcon, LogInIcon, UserIcon } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useLoginStore } from "../hooks/useAuth";

const Login = () => {
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { mutate: login, isLoading } = useLoginStore();

  const handleLogin = (e) => {
    e.preventDefault();

    login(
      { email, password },
      {
        // onSuccess: (data) => {
        //   toast.success("Login successful!");
        //   navigate("/");
        onSuccess: (data) => {
        if (data.userData?.role === 'hotel') {
          toast.success("Login successful!");
          navigate("/");
        } else {
          toast.error("Access restricted to hotel users only");
          // Immediately log out if not a hotel user
          logout();
        }
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || "Login failed. Please check credentials.");
        }
      }
    );
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to access your wayzx dashboard
          </p>
        </div>

        <div className="rounded-lg border border-border/60 bg-card p-6 shadow-subtle">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <KeyIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0"
                  onClick={toggleShowPassword}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="text-sm text-right">
                <Button variant="link" className="h-auto p-0" size="sm">
                  Forgot password?
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-green-600" disabled={isLoading}>
              {isLoading ? (
                "Signing in..."
              ) : (
                <>
                  <LogInIcon className="mr-2 h-4 w-4" /> Sign In
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 text-center text-sm border-t">
            Don't have an account?{" "}
            <Button
              variant="link"
              className="h-auto p-0"
              onClick={() => navigate("/register")}
            >
              Sign up
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;