import { ClerkProvider as BaseClerkProvider } from '@clerk/clerk-react'
import { ReactNode } from 'react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

interface ClerkProviderProps {
  children: ReactNode
}

export function ClerkProvider({ children }: ClerkProviderProps) {
  return (
    <BaseClerkProvider publishableKey={PUBLISHABLE_KEY}>
      {children}
    </BaseClerkProvider>
  )
}
