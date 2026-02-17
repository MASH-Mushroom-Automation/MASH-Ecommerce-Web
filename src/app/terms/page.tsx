import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { TermsContent } from "@/components/legal/legal-content";

export default function TermsPage() {
  return (
    <div className="bg-muted min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Terms of Service
            </h1>
            <Badge variant="secondary">Effective: January 2025</Badge>
          </div>
          <p className="text-lg text-muted-foreground">
            Please read these terms carefully before using MASH e-commerce
            platform.
          </p>
        </div>

        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            By accessing and using MASH&apos;s website and services, you agree
            to be bound by these Terms of Service. If you do not agree, please
            do not use our services.
          </AlertDescription>
        </Alert>

        {/* Content */}
        <TermsContent variant="default" showContactCard={true} />
      </div>
    </div>
  );
}
