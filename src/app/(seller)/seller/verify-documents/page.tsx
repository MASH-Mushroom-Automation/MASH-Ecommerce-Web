/**
 * Seller Document Verification Page
 * 
 * Upload and manage verification documents for seller account
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DocumentUpload, type UploadedDocument } from "@/components/seller/DocumentUpload";
import { DocumentPreview } from "@/components/seller/DocumentPreview";
import { useDocumentUpload } from "@/hooks/useDocumentUpload";
import {
  DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPE_DESCRIPTIONS,
  type DocumentType,
} from "@/lib/utils/file-validation";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle, Info, ChevronLeft, Loader2 } from "lucide-react";

// Required documents for verification
const REQUIRED_DOCUMENTS: DocumentType[] = [
  DOCUMENT_TYPES.BUSINESS_PERMIT,
  DOCUMENT_TYPES.VALID_ID,
];

// Optional but recommended documents
const OPTIONAL_DOCUMENTS: DocumentType[] = [
  DOCUMENT_TYPES.DTI_REGISTRATION,
  DOCUMENT_TYPES.SEC_REGISTRATION,
  DOCUMENT_TYPES.BIR_CERTIFICATE,
  DOCUMENT_TYPES.MAYORS_PERMIT,
];

export default function DocumentVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resubmitId = searchParams.get('resubmit');
  const [documents, setDocuments] = useState<Record<DocumentType, UploadedDocument[]>>({} as Record<DocumentType, UploadedDocument[]>);
  const [previewDocument, setPreviewDocument] = useState<UploadedDocument | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResubmission, setIsResubmission] = useState(false);
  const [previousSubmission, setPreviousSubmission] = useState<any>(null);

  // Load previous submission data if resubmitting
  useEffect(() => {
    if (resubmitId) {
      loadPreviousSubmission(resubmitId);
    }
  }, [resubmitId]);

  const loadPreviousSubmission = async (submissionId: string) => {
    try {
      const response = await fetch('/api/seller/verification/status');
      const data = await response.json();
      
      if (data.success && data.data) {
        setIsResubmission(true);
        setPreviousSubmission(data.data);
        // Show info about rejected documents
        toast.info('Resubmission Mode', {
          description: 'Please upload corrected documents based on the feedback.',
        });
      }
    } catch (error) {
      console.error('Error loading previous submission:', error);
    }
  };

  const { uploadDocument } = useDocumentUpload({
    onSuccess: (url, documentId) => {
      toast.success("Document uploaded successfully");
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const handleUpload = async (file: File, documentType: DocumentType) => {
    const result = await uploadDocument(file, documentType);
    return result;
  };

  const handleRemove = (documentType: DocumentType, documentId: string) => {
    setDocuments((prev) => ({
      ...prev,
      [documentType]: prev[documentType]?.filter((d) => d.id !== documentId) || [],
    }));
    toast.info("Document removed");
  };

  const isRequiredDocumentUploaded = (documentType: DocumentType): boolean => {
    return (documents[documentType]?.length || 0) > 0;
  };

  const areAllRequiredDocumentsUploaded = (): boolean => {
    return REQUIRED_DOCUMENTS.every(isRequiredDocumentUploaded);
  };

  const handleSubmit = async () => {
    if (!areAllRequiredDocumentsUploaded()) {
      toast.error("Please upload all required documents");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare submission data
      const submissionData = {
        documents: Object.entries(documents).flatMap(([type, docs]) =>
          docs.map((doc) => ({
            documentId: doc.id,
            documentType: type,
            filename: doc.file.name,
          }))
        ),
        isResubmission,
        previousSubmissionId: resubmitId,
      };

      const response = await fetch('/api/seller/documents/submit-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit verification');
      }

      toast.success(
        isResubmission 
          ? "Documents resubmitted successfully!" 
          : "Verification documents submitted successfully!"
      );
      
      // Redirect to success page
      router.push("/seller/verification-pending");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit documents. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isResubmission ? 'Resubmit Verification Documents' : 'Document Verification'}
          </h1>
          <p className="text-muted-foreground">
            {isResubmission 
              ? 'Upload corrected documents based on the feedback from our review team.'
              : 'Upload your business documents to verify your seller account. This helps us ensure a safe and trusted marketplace.'
            }
          </p>
        </div>

        {/* Resubmission Alert */}
        {isResubmission && previousSubmission?.currentFeedback && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <strong className="text-red-900">Previous Review Feedback:</strong>
              <p className="text-red-800 mt-1">{previousSubmission.currentFeedback.message}</p>
              {previousSubmission.currentFeedback.requiredActions.length > 0 && (
                <ul className="list-disc list-inside mt-2 text-red-800 text-sm">
                  {previousSubmission.currentFeedback.requiredActions.map((action: string, idx: number) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Info Alert */}
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Review Process:</strong> Our team will review your documents within {isResubmission ? '1-2' : '2-3'} business days. 
            You'll receive an email notification once your account is verified.
          </AlertDescription>
        </Alert>

        {/* Required Documents */}
        <div className="space-y-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              Required Documents
              <span className="text-sm font-normal text-muted-foreground">
                ({REQUIRED_DOCUMENTS.filter(isRequiredDocumentUploaded).length}/{REQUIRED_DOCUMENTS.length} uploaded)
              </span>
            </h2>

            <div className="grid gap-6">
              {REQUIRED_DOCUMENTS.map((docType) => (
                <Card key={docType}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {DOCUMENT_TYPE_LABELS[docType]}
                          <span className="text-red-500">*</span>
                          {isRequiredDocumentUploaded(docType) && (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          )}
                        </CardTitle>
                        <CardDescription>
                          {DOCUMENT_TYPE_DESCRIPTIONS[docType]}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <DocumentUpload
                      documentType={docType}
                      onUpload={handleUpload}
                      onRemove={(id) => handleRemove(docType, id)}
                      maxFiles={1}
                      existingDocuments={documents[docType] || []}
                      required
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Optional Documents */}
        <div className="space-y-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Additional Documents (Optional)
            </h2>

            <div className="grid gap-6">
              {OPTIONAL_DOCUMENTS.map((docType) => (
                <Card key={docType}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {DOCUMENT_TYPE_LABELS[docType]}
                      {isRequiredDocumentUploaded(docType) && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                    </CardTitle>
                    <CardDescription>
                      {DOCUMENT_TYPE_DESCRIPTIONS[docType]}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DocumentUpload
                      documentType={docType}
                      onUpload={handleUpload}
                      onRemove={(id) => handleRemove(docType, id)}
                      maxFiles={1}
                      existingDocuments={documents[docType] || []}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Section */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {!areAllRequiredDocumentsUploaded() && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please upload all required documents before submitting.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="sm:w-auto"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!areAllRequiredDocumentsUploaded() || isSubmitting}
                  className="flex-1 sm:flex-initial"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit for Verification"
                  )}
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                By submitting, you confirm that all documents are authentic and accurate.
                Providing false information may result in account termination.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Preview Modal */}
      <DocumentPreview
        document={previewDocument}
        isOpen={!!previewDocument}
        onClose={() => setPreviewDocument(null)}
      />
    </div>
  );
}
