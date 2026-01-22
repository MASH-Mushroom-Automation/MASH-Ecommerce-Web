import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  useSellerApplicationMutation,
  useDocumentUploadMutation,
  SellerApplicationPayload,
} from "@/hooks/useSellerApplication";
import { sellerApplicationSchema, SellerApplicationForm } from "../schema";

// Map business type from form to API format
const mapBusinessType = (type: string): string => {
  const mapping: Record<string, string> = {
    individual: "Sole Proprietor",
    company: "Corporation",
  };
  return mapping[type] || type;
};

export function useSellerApplicationForm() {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0 = hero, 1 = form

  // TanStack Query mutations
  const documentUploadMutation = useDocumentUploadMutation();
  const sellerApplicationMutation = useSellerApplicationMutation();

  // Form instance
  const form = useForm<SellerApplicationForm>({
    resolver: zodResolver(sellerApplicationSchema),
    defaultValues: {
      businessName: "",
      businessType: "individual",
      taxId: "",
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      region: "",
      mushroomTypes: [],
      productionCapacity: "",
      certifications: "",
      validIdFile: undefined as unknown as File,
      birCertificateFile: undefined as unknown as File,
      businessCertificateFile: undefined as unknown as File,
      agreeToTerms: false,
    },
  });

  // Submit handler
  const onSubmit = async (data: SellerApplicationForm) => {
    try {
      // Step 1: Upload all documents
      toast.loading("Uploading documents...", { id: "seller-application" });

      const documentUrls = await documentUploadMutation.mutateAsync({
        validIdFile: data.validIdFile,
        birCertificateFile: data.birCertificateFile,
        businessCertificateFile: data.businessCertificateFile,
      });

      // Step 2: Prepare payload for API
      const payload: SellerApplicationPayload = {
        city: data.city,
        region: data.region,
        completeAddress: data.address,
        businessName: data.businessName,
        businessType: mapBusinessType(data.businessType),
        mushroomTypes: data.mushroomTypes,
        monthlyProductionCapacity: data.productionCapacity,
        certifications: data.certifications
          ? data.certifications
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean)
          : [],
        governmentId: documentUrls.governmentId,
        birCertificate: documentUrls.birCertificate,
        businessCertificate: documentUrls.businessCertificate,
        additionalInfo: data.mushroomOther || undefined,
      };

      // Step 3: Submit application
      toast.loading("Submitting application...", { id: "seller-application" });

      await sellerApplicationMutation.mutateAsync(payload);

      // Success
      toast.success("Application submitted successfully!", {
        id: "seller-application",
      });
      setShowSuccessModal(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit application";
      toast.error(errorMessage, { id: "seller-application" });
    }
  };

  // Combined loading state
  const isSubmitting =
    documentUploadMutation.isPending || sellerApplicationMutation.isPending;

  // Navigation handlers
  const goToForm = () => setCurrentStep(1);
  const goToHero = () => setCurrentStep(0);
  const closeSuccessModal = () => setShowSuccessModal(false);

  return {
    // Form
    form,
    onSubmit,

    // State
    currentStep,
    showSuccessModal,
    isSubmitting,

    // Navigation
    goToForm,
    goToHero,
    closeSuccessModal,

    // Mutations (exposed for advanced use cases)
    documentUploadMutation,
    sellerApplicationMutation,
  };
}
