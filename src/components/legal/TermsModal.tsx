"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type TermsModalProps = {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export default function TermsModal({ open, defaultOpen, onOpenChange }: TermsModalProps) {
    return (
        <Dialog open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-w-80 w-full sm:mx-4 mx-0 bg-background rounded-lg shadow-lg overflow-auto max-h-[90vh] p-6">
                <DialogHeader className="flex items-start justify-between">
                    <div>
                        <DialogTitle className="text-2xl sm:text-3xl font-bold text-foreground -mb-3">Terms of Service</DialogTitle>
                    </div>
                    <div />
                </DialogHeader>

                <p className="text-sm text-muted-foreground mb-4">
                    Please read these terms carefully before using MASH e-commerce platform.
                </p>

                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        By accessing and using MASH&apos;s website and services, you agree to be bound by these Terms of Service.
                    </AlertDescription>
                </Alert>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl text-primary">1. Acceptance of Terms</CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                            <p>
                                By using the M.A.S.H. platform you agree to follow these Terms and Conditions. If you do not agree, please do not use the system.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl text-primary">2. Eligibility</CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                            <p className="mb-3">To use our Services, you must:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Be at least 18 years of age or have parental/guardian consent</li>
                                <li>Have the legal capacity to enter into binding contracts</li>
                                <li>Provide accurate and complete registration information</li>
                                <li>The platform is intended for mushroom growers, sellers, and consumers</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl text-primary">3. User Accounts</CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                            <p className="mb-3">
                                <strong>Account Creation:</strong> You must create an account to access certain features and place orders. You are responsible for:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Maintaining the confidentiality of your account credentials</li>
                                <li>All activities that occur under your account</li>
                                <li>Ensuring your account information is accurate and up-to-date</li>
                            </ul>
                            <p className="mt-3">
                                <strong>Account Termination:</strong> We reserve the right to suspend or terminate your account if you violate these Terms or engage in fraudulent, abusive, or illegal activities.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl text-primary">4. Orders and Payment</CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                            <p className="mb-3">
                                <strong>Order Placement:</strong> When you place an order, you are making an offer to purchase products. We reserve the right to accept or reject any order for any reason, including product availability, pricing errors, or suspected fraud.
                            </p>
                            <p className="mb-3">
                                <strong>Pricing:</strong> All prices are in Philippine Pesos (₱) and include applicable taxes. Prices are subject to change without notice. We strive for accuracy but are not responsible for typographical errors.
                            </p>
                            <p className="mb-3">
                                <strong>Payment:</strong> Payment is due at the time of order placement (except for Cash on Delivery). We accept:
                            </p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>GCash and Maya (e-wallet)</li>
                                <li>Credit/Debit cards (Visa, Mastercard)</li>
                                <li>Cash on Delivery (COD)</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl text-primary">5. Delivery</CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                            <p className="mb-3">
                                <strong>Delivery Times:</strong> Estimated delivery times are provided at checkout and may vary based on location and product availability. We are not liable for delays caused by circumstances beyond our control (e.g., weather, traffic, force majeure).
                            </p>
                            <p className="mb-3">
                                <strong>Delivery Address:</strong> You are responsible for providing an accurate delivery address. If delivery fails due to incorrect address information, additional fees may apply for re-delivery.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl text-primary">6. Product Information</CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Sellers are responsible for providing accurate product descriptions</li>
                                <li>Product quality and freshness depend on proper handling by the seller</li>
                                <li>The platform does not guarantee product availability at all times</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl text-primary">7. Intellectual Property</CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                            <p className="mb-3">
                                All content on MASH, including text, graphics, logos, images, and software, is the property of MASH or its licensors and is protected by intellectual property laws. <br />You may not:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Copy, reproduce, or distribute our content without permission</li>
                                <li>Use our trademarks or branding without authorization</li>
                                <li>Use automated systems (bots, scrapers) to access our Services</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl text-primary">8. Prohibited Conduct</CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                            <p className="mb-3">You agree not to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Violate any laws or regulations</li>
                                <li>Provide false or misleading information</li>
                                <li>Impersonate another person or entity</li>
                                <li>Interfere with or disrupt our Services</li>
                                <li>Attempt to gain unauthorized access to our systems</li>
                                <li>Use our Services for fraudulent purposes</li>
                                <li>Misuse the platform for illegal or harmful activities</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl text-primary">9. Changes to Terms</CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                            <p>
                                We reserve the right to modify these Terms at any time. Changes will be effective upon posting to our website. Your continued use of our Services after changes constitutes acceptance of the modified Terms. We encourage you to review these Terms periodically.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl text-primary">10. Severability</CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                            <p>If any part of these Terms is found invalid, the remaining sections will continue to be in effect.</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary text-primary-foreground rounded-2xl shadow-md">
                        <CardContent className="p-6">
                            <h3 className="font-bold text-xl mb-3">Contact Us</h3>
                            <p className="text-primary-foreground/80 mb-4">Have questions or concerns about these Terms of Service? Reach out to us:</p>
                            <div className="space-y-2 text-sm">
                                <p>📧 Email: <a href="mailto:legal@mash.ph" className="font-medium underline">legal@mash.ph</a></p>
                                <p>📞 Phone: <a href="tel:+639171234567" className="font-medium underline">+63 917 123 4567</a></p>
                                <p>📍 Address: <span className="font-medium">Caloocan City, Metro Manila, Philippines</span></p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}
