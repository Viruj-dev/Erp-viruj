"use client";

export type AuthView = "signin" | "signup" | "forgot" | "verify";

export type ProviderOption = {
  desc: string;
  iconName: "briefcase" | "building" | "microscope" | "radio" | "stethoscope";
  id: "clinic" | "doctor" | "hospital" | "pathology" | "radiology";
  label: string;
};
