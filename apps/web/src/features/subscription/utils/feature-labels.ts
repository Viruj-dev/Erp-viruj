export const featureLabels: Record<string, string> = {
  advanced_analytics: "Advanced Analytics",
  ai_diagnostics: "AI Diagnostics Assistant",
  api_access: "API Access",
  automated_billing: "Automated Billing",
  custom_integrations: "Custom Integrations",
  custom_workflows: "Custom Workflows",
  dedicated_account_manager: "Dedicated Account Manager",
  multi_branch: "Multi-branch Management",
  multi_facility: "Multi-facility Management",
  predictive_analytics: "Predictive Analytics",
  priority_support: "Priority Support",
  telemedicine: "Telemedicine",
};

export function labelFeatureCode(code: string) {
  return featureLabels[code] ?? code.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

