import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Zap, User, Heart, Sparkles, RefreshCw, Check } from "lucide-react";

type Gender = "male" | "female" | "lgbtq";

const genderOptions = [
  { value: "male" as Gender, label: "Male", icon: User, prefix: "Mr" },
  { value: "female" as Gender, label: "Female", icon: Heart, prefix: "Mrs" },
  { value: "lgbtq" as Gender, label: "LGBTQ+", icon: Sparkles, prefix: "Rainbow" },
];

export default function CompleteProfile() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<"gender" | "username">("gender");
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [usernames, setUsernames] = useState<string[]>([]);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingUsernames, setGeneratingUsernames] = useState(false);

  // Get DOB from user metadata
  const dateOfBirth = user?.user_metadata?.date_of_birth;

  const generateUsernames = async (gender: Gender) => {
    setGeneratingUsernames(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-usernames", {
        body: { gender },
      });

      if (error) throw error;
      
      setUsernames(data.usernames || []);
    } catch (error: any) {
      console.error("Error generating usernames:", error);
      toast.error("Failed to generate usernames. Please try again.");
    } finally {
      setGeneratingUsernames(false);
    }
  };

  const handleGenderSelect = async (gender: Gender) => {
    setSelectedGender(gender);
    await generateUsernames(gender);
    setStep("username");
  };

  const handleRefreshUsernames = async () => {
    if (selectedGender) {
      setSelectedUsername(null);
      await generateUsernames(selectedGender);
    }
  };

  const handleComplete = async () => {
    if (!selectedUsername || !selectedGender || !dateOfBirth || !user) {
      toast.error("Please complete all steps");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("profiles").insert({
        id: user.id,
        username: selectedUsername,
        gender: selectedGender,
        date_of_birth: dateOfBirth,
      });

      if (error) throw error;

      toast.success("Welcome to Hawkly, " + selectedUsername + "!");
      await refreshProfile();
      navigate("/");
    } catch (error: any) {
      console.error("Error creating profile:", error);
      if (error.message?.includes("21")) {
        toast.error("You must be 21 or older to use Hawkly");
      } else if (error.message?.includes("unique")) {
        toast.error("Username already taken. Please try a different one.");
        handleRefreshUsernames();
      } else {
        toast.error(error.message || "Failed to create profile");
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">
          <Zap className="w-12 h-12" />
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Already has profile
  if (profile) {
    return <Navigate to="/" replace />;
  }

  // Missing date of birth (shouldn't happen but handle it)
  if (!dateOfBirth) {
    toast.error("Missing date of birth. Please sign up again.");
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Hawkly</h1>
        </div>
        <p className="text-muted-foreground">Create your anonymous identity</p>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        <div className={`w-16 h-1 rounded-full ${step === "gender" ? "bg-primary" : "bg-primary"}`} />
        <div className={`w-16 h-1 rounded-full ${step === "username" ? "bg-primary" : "bg-muted"}`} />
      </div>

      {/* Content Card */}
      <div className="w-full max-w-md glass rounded-2xl p-8">
        {step === "gender" ? (
          <>
            <h2 className="text-xl font-semibold text-foreground mb-2 text-center">
              Select Your Identity
            </h2>
            <p className="text-muted-foreground text-sm text-center mb-6">
              This determines your anonymous username style
            </p>

            <div className="space-y-3">
              {genderOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleGenderSelect(option.value)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-secondary hover:bg-secondary/80 border border-border transition-all hover:border-primary/50 group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <option.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">{option.label}</p>
                    <p className="text-sm text-muted-foreground">
                      Usernames like "{option.prefix}..."
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-foreground">
                Choose Your Username
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshUsernames}
                disabled={generatingUsernames}
                className="text-muted-foreground hover:text-foreground"
              >
                {generatingUsernames ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              Pick one — this cannot be changed later
            </p>

            {generatingUsernames ? (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">Generating usernames...</p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {usernames.map((username) => (
                  <button
                    key={username}
                    onClick={() => setSelectedUsername(username)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      selectedUsername === username
                        ? "bg-primary/10 border-primary text-foreground"
                        : "bg-secondary border-border text-foreground hover:border-primary/50"
                    }`}
                  >
                    <span className="font-mono text-lg">{username}</span>
                    {selectedUsername === username && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setStep("gender");
                  setSelectedGender(null);
                  setUsernames([]);
                  setSelectedUsername(null);
                }}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleComplete}
                disabled={!selectedUsername || loading}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Complete Setup"
                )}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Privacy Note */}
      <p className="mt-8 text-xs text-muted-foreground text-center max-w-sm">
        Your real identity is never shared. Only your anonymous username is visible to others.
      </p>
    </div>
  );
}
