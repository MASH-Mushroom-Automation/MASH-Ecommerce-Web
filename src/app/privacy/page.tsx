import { Badge } from "@/components/ui/badge";
import { PrivacyContent } from "@/components/legal/legal-content";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-muted min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Privacy Policy
            </h1>
            <Badge variant="secondary">Last Updated: January 2025</Badge>
          </div>
          <p className="text-lg text-muted-foreground">
            Your privacy is important to us. This policy outlines how MASH
            collects, uses, and protects your personal information.
          </p>
        </div>

        {/* Content */}
        <PrivacyContent variant="default" showContactCard={true} />
      </div>
    </div>
  );
}
