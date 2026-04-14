"use client";

import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.18),transparent_42%),radial-gradient(circle_at_bottom,rgba(34,197,94,0.12),transparent_35%)]" />
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-white/70 p-10 text-center shadow-2xl backdrop-blur-xl"
        initial={{ opacity: 0, y: 12 }}
      >
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg">
          <Building2 size={24} />
        </div>
        <h1 className="font-headline text-3xl font-black text-on-surface">
          Restoring secure session
        </h1>
        <p className="mt-3 text-sm text-on-surface-variant">
          Reconnecting your organization workspace and permission context.
        </p>
        <div className="mt-8 h-2 overflow-hidden rounded-full bg-surface-container-highest">
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            className="h-full w-1/2 bg-gradient-to-r from-primary to-secondary"
            transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity }}
          />
        </div>
      </motion.div>
    </div>
  );
}
