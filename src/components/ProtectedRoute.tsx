import { useAuth } from "@clerk/clerk-react";
import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [isValidatingUser, setIsValidatingUser] = useState(true);
  const [hasValidAccount, setHasValidAccount] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Validate user account in database
  useEffect(() => {
    const validateUserAccount = async () => {
      if (!isSignedIn || !isLoaded) {
        setIsValidatingUser(false);
        return;
      }

      try {
        const token = await getToken();
        if (!token) {
          setValidationError("Unable to get authentication token");
          setIsValidatingUser(false);
          return;
        }

        // Test API call to verify user exists in database
        const response = await fetch('http://localhost:3001/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          setHasValidAccount(true);
          setValidationError(null);
        } else {
          const errorData = await response.json();
          if (response.status === 403 || response.status === 401) {
            setValidationError(errorData.error?.message || "Account not found in system");
            toast.error("Access denied - Account not found in system");
          } else {
            setValidationError("Unable to verify account");
            toast.error("Unable to verify account");
          }
        }
      } catch (error) {
        console.error('Account validation error:', error);
        setValidationError("Network error during account validation");
        toast.error("Network error during account validation");
      } finally {
        setIsValidatingUser(false);
      }
    };

    validateUserAccount();
  }, [isSignedIn, isLoaded, getToken]);

  // Show loading spinner while Clerk is initializing
  if (!isLoaded || isValidatingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            {!isLoaded ? "Loading..." : "Validating account..."}
          </p>
        </div>
      </div>
    );
  }

  // Redirect to auth page if not signed in
  if (!isSignedIn) {
    return <Navigate to="/auth" replace />;
  }

  // Show error if account validation failed
  if (validationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-6">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">{validationError}</p>
          <button
            onClick={() => window.location.href = '/auth'}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // Only render children if user has valid account
  if (!hasValidAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying account...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}