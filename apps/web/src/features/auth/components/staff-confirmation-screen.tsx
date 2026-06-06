"use client";

import { virujBackend } from "@/lib/viruj-backend";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type StaffConfirmationScreenProps = {
  invitationId: string;
};

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  APPOINTMENT_HANDLER: "Appointment Handler",
  CLINIC_ADMIN: "Clinic Admin",
  CLINIC_OWNER: "Clinic Owner",
  CLINIC_STAFF: "Clinic Staff",
  COMMUNITY_MANAGER: "Community Manager",
  DOCTOR: "Doctor",
  MANAGER: "Manager",
  ORG_ADMIN: "Organization Admin",
  OWNER: "Owner",
  RECEPTIONIST: "Receptionist",
  STAFF: "Staff",
  TECHNICIAN: "Technician",
};

export function StaffConfirmationScreen({
  invitationId,
}: StaffConfirmationScreenProps) {
  const [confirmedAccess, setConfirmedAccess] = useState<{
    email: string;
    loginUrl: string;
    role: string;
  } | null>(null);

  const confirmMutation = useMutation({
    mutationFn: virujBackend.staff.confirmInvitation,
    onSuccess: (result) => {
      setConfirmedAccess({
        email: result.email,
        loginUrl: result.loginUrl,
        role: result.role,
      });
    },
  });

  const isConfirming = confirmMutation.isPending;
  const roleLabel = confirmedAccess
    ? roleLabels[confirmedAccess.role] || confirmedAccess.role
    : "staff";

  return (
    <main className="min-h-screen bg-[#eef4f8] px-4 py-10 text-[#172033] sm:px-6">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(0,94,184,0.18),transparent_28%),radial-gradient(circle_at_84%_16%,rgba(0,106,106,0.14),transparent_24%)]" />
      <div className="erp-dialog-backdrop fixed inset-0" />
      <section className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-2xl items-center justify-center">
        <div className="w-full overflow-hidden rounded-[28px] border border-white/60 bg-white/88 shadow-[0_32px_90px_rgba(15,23,42,0.22)] backdrop-blur-xl">
          <div className="bg-[#003b73] px-8 py-8 text-white sm:px-10">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/20">
              {confirmedAccess ? (
                <CheckCircle2 className="h-7 w-7" />
              ) : (
                <ShieldCheck className="h-7 w-7" />
              )}
            </div>
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-[#9fd7ff]">
              Viruj Health ERP
            </p>
            <h1 className="headline mt-3 max-w-xl text-3xl font-semi-bold leading-tight sm:text-4xl">
              {confirmedAccess
                ? "Your staff access is confirmed"
                : "Confirm your staff access before login"}
            </h1>
          </div>

          <div className="px-8 py-8 sm:px-10">
            {confirmedAccess ? (
              <div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-950">
                  <p className="font-bold">Status updated to On Duty</p>
                  <p className="mt-1 text-emerald-900">
                    {confirmedAccess.email} is now active as {roleLabel}.
                  </p>
                </div>

                <Link
                  className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#00478d] px-5 text-sm font-semi-bold text-white shadow-[0_14px_28px_rgba(0,71,141,0.24)] transition hover:bg-[#003b73]"
                  href={confirmedAccess.loginUrl}
                >
                  Continue to Login
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-base leading-7 text-[#344054]">
                  Confirming this invite will mark your staff profile as on duty
                  in the hospital staff directory. After that, use the
                  credentials from your email to sign in.
                </p>

                {confirmMutation.error ? (
                  <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-800">
                    {confirmMutation.error.message ||
                      "Unable to confirm this staff invite."}
                  </div>
                ) : null}

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#00478d] px-5 text-sm font-semi-bold text-white shadow-[0_14px_28px_rgba(0,71,141,0.24)] transition hover:bg-[#003b73] disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={isConfirming}
                    onClick={() =>
                      confirmMutation.mutate({
                        invitationId,
                      })
                    }
                    type="button"
                  >
                    {isConfirming ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-4 w-4" />
                    )}
                    Confirm Access
                  </button>
                  <Link
                    className="inline-flex h-12 items-center justify-center rounded-xl border border-[#c2c6d4] px-5 text-sm font-semi-bold text-[#172033] transition hover:bg-[#f2f6fb]"
                    href="/auth"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
