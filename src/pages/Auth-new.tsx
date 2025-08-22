import { SignIn, SignUp, useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Brain, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Auth() {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'sign-in';

  useEffect(() => {
    if (isSignedIn) {
      navigate("/dashboard");
    }
  }, [isSignedIn, navigate]);

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-smooth mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Synergy Well</span>
          </div>
          
          <Badge className="bg-accent text-accent-foreground">
            Well-Being Intelligence Platform
          </Badge>
        </div>

        {/* Auth Components */}
        <div className="flex flex-col items-center">
          {mode === 'sign-up' ? (
            <SignUp 
              redirectUrl="/dashboard"
              signInUrl="/auth?mode=sign-in"
              appearance={{
                elements: {
                  formButtonPrimary: "bg-gradient-primary hover:opacity-90",
                  card: "shadow-elegant border-border",
                }
              }}
            />
          ) : (
            <SignIn 
              redirectUrl="/dashboard"
              signUpUrl="/auth?mode=sign-up"
              appearance={{
                elements: {
                  formButtonPrimary: "bg-gradient-primary hover:opacity-90",
                  card: "shadow-elegant border-border",
                }
              }}
            />
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
