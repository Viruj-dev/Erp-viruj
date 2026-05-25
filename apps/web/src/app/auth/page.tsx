"use client";

import { ErpAuthScreen } from "@/features/auth/components/auth-screen";
import { useEffect } from "react";

export default function AuthPage() {
  useEffect(() => {
    localStorage.removeItem("tenants_list");
  }, []);
  return <ErpAuthScreen />;
}
