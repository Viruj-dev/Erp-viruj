"use client";

import { BetterAuthDevtools } from "better-auth-devtools/react";

export function DevtoolsWrapper() {
  // Only render during development or when DEV_AUTH_ENABLED=true
  if (process.env.NODE_ENV !== "development" && process.env.NEXT_PUBLIC_DEV_AUTH_ENABLED !== "true") {
    return null;
  }

  return (
    <BetterAuthDevtools
      enabled={true}
      basePath="/api/auth"
      templates={[
        "owner",
        "admin",
        "doctor",
        "manager",
        "receptionist",
        "billing",
        "lab_tech",
      ]}
      editableFields={[
        {
          key: "role",
          label: "Role",
          type: "select",
          options: [
            "owner",
            "admin",
            "doctor",
            "manager",
            "receptionist",
            "billing",
            "lab_tech",
          ],
        },
      ]}
    />
  );
}
