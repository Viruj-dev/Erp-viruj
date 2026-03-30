"use client";

import { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ErpDemoAppointments } from "@/components/erp-demo/appointments";
import { ErpDemoAnalytics } from "@/components/erp-demo/analytics";
import { ErpDemoCommunity } from "@/components/erp-demo/community";
import { ErpDemoDashboard } from "@/components/erp-demo/dashboard";
import { ErpDemoLogin } from "@/components/erp-demo/login";
import { ErpDemoPatients } from "@/components/erp-demo/patients";
import { ErpDemoSettings } from "@/components/erp-demo/settings";
import { ErpDemoSidebar } from "@/components/erp-demo/sidebar";
import { ErpDemoStaff } from "@/components/erp-demo/staff";
import { ErpDemoTopBar } from "@/components/erp-demo/top-bar";
import type { ErpDemoPage } from "@/components/erp-demo/types";
import { useApp } from "@/store/app-context";

const fallbackPage: ErpDemoPage = "dashboard";

export default function Home() {
  const { state, logout, setCurrentPage, setLoggedIn, setUserName } = useApp();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const currentPage = isErpDemoPage(state.currentPage) ? state.currentPage : fallbackPage;

  if (!isHydrated || !state.isLoggedIn) {
    return (
      <ErpDemoLogin
        onLogin={() => {
          setLoggedIn(true);
          if (!state.userName) {
            setUserName("Dr. Sarah Chen");
          }
        }}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-surface text-on-surface selection:bg-primary/15 selection:text-primary">
      <ErpDemoSidebar
        currentPage={currentPage}
        isCollapsed={isSidebarCollapsed}
        onLogout={logout}
        onPageChange={(page) => setCurrentPage(page)}
        onToggle={() => setIsSidebarCollapsed((value) => !value)}
      />
      <main
        className={`flex min-h-screen min-w-0 flex-1 flex-col overflow-hidden transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <ErpDemoTopBar currentPage={currentPage} userName={state.userName} />
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto w-full max-w-[1600px]"
              exit={{ opacity: 0, y: -12 }}
              initial={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
            >
              <PageContent currentPage={currentPage} userName={state.userName} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function PageContent({
  currentPage,
  userName,
}: {
  currentPage: ErpDemoPage;
  userName: string;
}) {
  switch (currentPage) {
    case "appointments":
      return <ErpDemoAppointments />;
    case "patients":
      return <ErpDemoPatients />;
    case "staff":
      return <ErpDemoStaff />;
    case "community":
      return <ErpDemoCommunity />;
    case "analytics":
      return <ErpDemoAnalytics />;
    case "settings":
      return <ErpDemoSettings userName={userName} />;
    case "dashboard":
    default:
      return <ErpDemoDashboard userName={userName} />;
  }
}

function isErpDemoPage(page: string): page is ErpDemoPage {
  return [
    "dashboard",
    "appointments",
    "patients",
    "staff",
    "community",
    "analytics",
    "settings",
  ].includes(page);
}
