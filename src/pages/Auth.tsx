import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { LoginForm } from "@/components/auth/LoginForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { Zap } from "lucide-react";

export default function Auth() {
  const { user, profile, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const navigate = useNavigate();

  // Handle redirect after auth (for invite links)
  useEffect(() => {
    if (user && profile) {
      const redirectUrl = sessionStorage.getItem('redirectAfterAuth');
      if (redirectUrl) {
        sessionStorage.removeItem('redirectAfterAuth');
        // Navigate to the stored URL
        window.location.href = redirectUrl;
      }
    }
  }, [user, profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">
          <Zap className="w-12 h-12" />
        </div>
      </div>
    );
  }

  // If user is logged in but has no profile, redirect to complete signup
  if (user && !profile) {
    return <Navigate to="/complete-profile" replace />;
  }

  // If user is fully set up, check for redirect or go home
  if (user && profile) {
    const redirectUrl = sessionStorage.getItem('redirectAfterAuth');
    if (redirectUrl) {
      sessionStorage.removeItem('redirectAfterAuth');
      window.location.href = redirectUrl;
      return null;
    }
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Hawkly</h1>
        </div>
        <p className="text-muted-foreground">Real-time nightlife discovery</p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md glass rounded-2xl p-8">
        {mode === "forgot" ? (
          <ForgotPasswordForm onBack={() => setMode("login")} />
        ) : (
          <>
            {/* Toggle Tabs */}
            <div className="flex mb-6 bg-secondary rounded-xl p-1">
              <button
                onClick={() => setMode("login")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  mode === "login"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode("signup")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  mode === "signup"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>

            {mode === "login" ? (
              <LoginForm onForgotPassword={() => setMode("forgot")} />
            ) : (
              <SignUpForm />
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-muted-foreground text-center max-w-sm">
        By continuing, you agree to our Terms of Service and Privacy Policy. 
        Must be 21+ to use Hawkly.
      </p>
    </div>
  );
}
