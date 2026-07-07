"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { NotificationProvider } from "@/features/notifications";
import { ThemeProvider } from "./theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider>
      <NotificationProvider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
