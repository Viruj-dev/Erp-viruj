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
import { AnimatePresence, motion } from "framer-motion";

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
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-body)]">
      <Sidebar />
      <div className="flex-1 lg:pl-[var(--sidebar-width)] flex flex-col">
        <TopHeader />
        <main className="flex-1 p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
