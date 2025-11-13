"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Smartphone,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { apiClient, setAuthToken } from "@/lib/api/client";

interface OtpState {
  phone: string;
  otp: string;
  step: "phone" | "otp";
  isLoading: boolean;
  error: string | null;
}

export function OtpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tableId = searchParams.get("table_id");
  const tenantId = searchParams.get("tenant_id");

  const [state, setState] = useState<OtpState>({
    phone: "",
    otp: "",
    step: "phone",
    isLoading: false,
    error: null,
  });

  // Request OTP mutation
  const requestOtpMutation = useMutation({
    mutationFn: async (phone: string) => {
      const response = await apiClient.post("/api/auth/customer/request-otp", {
        phone: phone,
        tenant_id:
          process.env.NEXT_PUBLIC_TENANT_ID ||
          "11111111-1111-1111-1111-111111111111",
      });
      return response;
    },
    onSuccess: (data: any) => {
      setState((prev) => ({
        ...prev,
        step: "otp",
        error: null,
        isLoading: false,
      }));

      // Check if OTP is returned in response (development mode)
      if (data?.data?.otp) {
        setState((prev) => ({
          ...prev,
          otp: data.data.otp,
        }));
      }
    },
    onError: (error: any) => {
      setState((prev) => ({
        ...prev,
        error: error.message || "Failed to send OTP",
        isLoading: false,
      }));
    },
  });

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async ({ phone, otp }: { phone: string; otp: string }) => {
      const response = await apiClient.post("/api/auth/customer/verify-otp", {
        phone: phone,
        otp,
        tenant_id:
          process.env.NEXT_PUBLIC_TENANT_ID ||
          "11111111-1111-1111-1111-111111111111",
      });
      return response;
    },
    onSuccess: (data: any) => {
      if (data?.data?.access_token) {
        setAuthToken(data.data.access_token);
        // Store customer ID for order creation
        if (data?.data?.user?.id) {
          localStorage.setItem("customer_id", data.data.user.id);
        }
        // Navigate to menu
        router.push(`/menu?table_id=${tableId}&tenant_id=${tenantId}`);
      }
    },
    onError: (error: any) => {
      setState((prev) => ({
        ...prev,
        error: error.message || "Invalid OTP",
        isLoading: false,
      }));
    },
  });

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.phone || state.phone.length < 10) {
      setState((prev) => ({
        ...prev,
        error: "Please enter a valid phone number",
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    requestOtpMutation.mutate(state.phone);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.otp || state.otp.length !== 6) {
      setState((prev) => ({
        ...prev,
        error: "Please enter a valid 6-digit OTP",
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    verifyOtpMutation.mutate({ phone: state.phone, otp: state.otp });
  };

  const handleBack = () => {
    setState((prev) => ({
      ...prev,
      step: "phone",
      otp: "",
      error: null,
    }));
  };

  const formatPhoneNumber = (phone: string) => {
    // Add +91 prefix if not present
    if (!phone.startsWith("+")) {
      return `+91${phone}`;
    }
    return phone;
  };

  if (!tableId || !tenantId) {
    return (
      <div className="min-h-screen bg-linear-to-br from-yellow-50 via-yellow-25 to-yellow-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Invalid Access
              </h2>
              <p className="text-gray-600">
                Please scan a valid restaurant QR code to continue.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-50 via-yellow-25 to-yellow-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <Smartphone className="h-8 w-8 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {state.step === "phone" ? "Enter Phone Number" : "Verify OTP"}
            </h1>
            <p className="text-gray-600">
              {state.step === "phone"
                ? "We'll send a verification code to your phone"
                : `We've sent a 6-digit code to ${state.phone}`}
            </p>
          </div>

          {/* Main Card */}
          <Card className="shadow-lg border-yellow-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-center">
                {state.step === "phone" ? "Phone Verification" : "Enter OTP"}
              </CardTitle>
              <CardDescription className="text-center">
                {state.step === "phone"
                  ? "Secure your orders with phone verification"
                  : "Enter the code sent to your phone"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Error Alert */}
              {state.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              )}

              {/* Phone Input Form */}
              {state.step === "phone" && (
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="9876543210"
                      value={state.phone}
                      onChange={(e) =>
                        setState((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      className="text-lg"
                      disabled={state.isLoading}
                    />
                    <p className="text-sm text-gray-500">
                      Enter your 10-digit mobile number
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                    disabled={state.isLoading || !state.phone}
                  >
                    {state.isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        Send OTP
                        <Smartphone className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* OTP Input Form */}
              {state.step === "otp" && (
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="123456"
                      value={state.otp}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          otp: e.target.value.replace(/\D/g, "").slice(0, 6),
                        }))
                      }
                      className="text-lg text-center tracking-widest"
                      maxLength={6}
                      disabled={state.isLoading}
                    />
                    <p className="text-sm text-gray-500 text-center">
                      6-digit code sent to {formatPhoneNumber(state.phone)}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={state.isLoading}
                      className="flex-1"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
                      disabled={state.isLoading || state.otp.length !== 6}
                    >
                      {state.isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify
                          <CheckCircle className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => requestOtpMutation.mutate(state.phone)}
                      disabled={state.isLoading || requestOtpMutation.isPending}
                      className="text-sm text-yellow-600 hover:text-yellow-700"
                    >
                      Didn&apos;t receive code? Resend OTP
                    </Button>
                  </div>
                </form>
              )}

              <Separator />

              {/* Footer */}
              <div className="text-center text-sm text-gray-500">
                <p>Your phone number is used only for order verification</p>
                <p className="mt-1">We never share your personal information</p>
              </div>
            </CardContent>
          </Card>

          {/* Back to Table Link */}
          <div className="text-center mt-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Table
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
