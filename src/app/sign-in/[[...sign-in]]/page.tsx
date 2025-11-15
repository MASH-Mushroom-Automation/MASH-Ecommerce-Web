import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary-dark/5 to-white px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary-dark">Welcome Back</h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to access your MASH account
          </p>
        </div>
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-primary-dark hover:bg-primary-dark/90 text-sm normal-case",
              card: "shadow-lg",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton:
                "border-2 border-gray-200 hover:border-primary-medium",
              socialButtonsBlockButtonText: "font-medium",
              formFieldInput: "border-gray-300 focus:border-primary-medium",
              footerActionLink: "text-primary-medium hover:text-primary-dark",
            },
          }}
        />
      </div>
    </div>
  );
}
