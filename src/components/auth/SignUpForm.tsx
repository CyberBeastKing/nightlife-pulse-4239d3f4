import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, Lock, Calendar, AlertCircle, ShieldAlert } from "lucide-react";
import { z } from "zod";
import { checkPasswordBreach, getBreachMessage } from "@/utils/passwordSecurity";

// Calculate min date (must be 21 years ago)
const today = new Date();
const minAge21Date = new Date(today.getFullYear() - 21, today.getMonth(), today.getDate());

const signupSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72, "Password too long"),
  dateOfBirth: z.string().refine((dob) => {
    const date = new Date(dob);
    return date <= minAge21Date;
  }, "You must be 21 or older to use Hawkly"),
});

export function SignUpForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingPassword, setCheckingPassword] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check password match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Validate inputs
    const result = signupSchema.safeParse({ email, password, dateOfBirth });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    setLoading(true);

    try {
      // Check for leaked password
      setCheckingPassword(true);
      const breachResult = await checkPasswordBreach(password);
      setCheckingPassword(false);

      if (breachResult.isCompromised) {
        toast.error(getBreachMessage(breachResult.occurrences), {
          icon: <ShieldAlert className="w-5 h-5 text-destructive" />,
          duration: 6000,
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: result.data.email,
        password: result.data.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            date_of_birth: result.data.dateOfBirth,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        toast.success("Account created! Now let's set up your anonymous identity.");
        navigate("/complete-profile");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
      setCheckingPassword(false);
    }
  };

  // Format max date for date input (21 years ago)
  const maxDate = minAge21Date.toISOString().split("T")[0];

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      {/* Age Warning */}
      <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20">
        <AlertCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
        <p className="text-sm text-muted-foreground">
          Hawkly is for users 21 and older. Your identity will remain anonymous.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email" className="text-foreground">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="signup-email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 bg-input border-border"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dob" className="text-foreground">Date of Birth</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="dob"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            max={maxDate}
            className="pl-10 bg-input border-border"
            required
          />
        </div>
        <p className="text-xs text-muted-foreground">Must be 21+ to use Hawkly</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password" className="text-foreground">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="signup-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 bg-input border-border"
            minLength={8}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password" className="text-foreground">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="confirm-password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-10 bg-input border-border"
            minLength={8}
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  );
}
