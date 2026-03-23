"use client";

import type { AuthView, ProviderOption } from "./auth-types";

export const providers: ProviderOption[] = [
  {
    id: "hospital",
    label: "Hospital",
    desc: "Multi-specialty facility operations",
    iconName: "briefcase",
  },
  {
    id: "doctor",
    label: "Doctor",
    desc: "Independent practitioner workflow",
    iconName: "stethoscope",
  },
  {
    id: "clinic",
    label: "Clinic",
    desc: "Local care center and front desk team",
    iconName: "building",
  },
  {
    id: "pathology",
    label: "Pathology",
    desc: "Diagnostics and report operations",
    iconName: "microscope",
  },
  {
    id: "radiology",
    label: "Radiology",
    desc: "Imaging and slot scheduling",
    iconName: "radio",
  },
];

export const viewCopy: Record<
  AuthView,
  { badge: string; description: string; title: string }
> = {
  signin: {
    title: "Log in",
    description: "Enter your provider credentials to open the ERP workspace.",
    badge: "Access",
  },
  signup: {
    title: "Create account",
    description: "Set up a provider workspace with the role that fits your desk.",
    badge: "Onboarding",
  },
  forgot: {
    title: "Reset password",
    description: "Enter your email and we will prepare a recovery flow.",
    badge: "Recovery",
  },
  verify: {
    title: "Verify code",
    description: "Enter the 4-digit code to complete the recovery flow.",
    badge: "Verification",
  },
};
