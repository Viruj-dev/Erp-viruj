"use client";

import { useApp } from "@/store/app-context";
import { AuthPage } from "@/components/auth/auth-page";
import { Sidebar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { Dashboard } from "@/components/dashboard/dashboard";
import { Appointments } from "@/components/appointments/appointments";
import { Profile } from "@/components/profile/profile";
import { ManageServices } from "@/components/manage/manage-services";
import { Community } from "@/components/community/community";
import { Subscription } from "@/components/subscription/subscription";
import { AnimatePresence, motion } from "framer-motion";

const pageShellClasses: Record<string, string> = {
  dashboard: "page-shell page-shell-dashboard",
  appointments: "page-shell page-shell-appointments",
  profile: "page-shell page-shell-profile",
  manage: "page-shell page-shell-manage",
  community: "page-shell page-shell-community",
  subscription: "page-shell page-shell-subscription",
};

export default function Home() {
  const { state } = useApp();

  if (!state.isLoggedIn) {
    return <AuthPage />;
  }

  const renderContent = () => {
    switch (state.currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "appointments":
        return <Appointments />;
      case "profile":
        return <Profile />;
      case "manage":
        return <ManageServices />;
      case "community":
        return <Community />;
      case "subscription":
        return <Subscription />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div
      className={`flex min-h-screen overflow-x-clip bg-[var(--bg-body)] ${
        pageShellClasses[state.currentPage] ?? pageShellClasses.dashboard
      }`}
    >
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col lg:pl-[var(--sidebar-width)]">
        <TopHeader />
        <main className="page-shell-main flex-1 overflow-x-clip p-4 md:p-6 xl:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mx-auto min-w-0 w-full max-w-[1500px]"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
