import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Mail, CheckCircle, Zap, RefreshCw } from "lucide-react";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Check for verification token in URL (from email link)
    const handleVerification = async () => {
      const token_hash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      if (token_hash && type === "email") {
        setIsVerifying(true);
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: "email",
          });

          if (error) throw error;

          setIsVerified(true);
          toast.success("Email verified successfully!");
          
          // Redirect after short delay
          setTimeout(() => {
            navigate("/complete-profile");
          }, 2000);
        } catch (error: any) {
          console.error("Verification error:", error);
          toast.error(error.message || "Verification failed");
        } finally {
          setIsVerifying(false);
        }
      }
    };

    handleVerification();

    // Get current user email for resend functionality
    const getEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setEmail(user.email);
      }
    };
    getEmail();
  }, [searchParams, navigate]);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error("No email address found");
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      });

      if (error) throw error;

      toast.success("Verification email sent! Check your inbox.");
    } catch (error: any) {
      console.error("Resend error:", error);
      toast.error(error.message || "Failed to resend verification email");
    } finally {
      setIsResending(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="animate-pulse text-primary">
          <Zap className="w-12 h-12" />
        </div>
        <p className="mt-4 text-muted-foreground">Verifying your email...</p>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md glass rounded-2xl p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-foreground">Email Verified!</h2>
          <p className="text-muted-foreground">
            Your email has been verified. Redirecting you to complete your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Hawkly</h1>
        </div>
      </div>

      {/* Verification Card */}
      <div className="w-full max-w-md glass rounded-2xl p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Check Your Email</h2>
          <p className="text-muted-foreground">
            We've sent a verification link to{" "}
            {email ? (
              <span className="font-medium text-foreground">{email}</span>
            ) : (
              "your email address"
            )}
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Click the link in the email to verify your account and continue.
          </p>

          <Button
            variant="outline"
            onClick={handleResendEmail}
            disabled={isResending}
            className="w-full"
          >
            {isResending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Resend Verification Email
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={() => navigate("/auth")}
            className="w-full text-muted-foreground"
          >
            Back to Sign In
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Didn't receive the email? Check your spam folder or try resending.
        </p>
      </div>
    </div>
  );
}
