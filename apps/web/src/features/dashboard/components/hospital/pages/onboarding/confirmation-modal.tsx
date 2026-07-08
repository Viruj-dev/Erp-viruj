import { motion } from "framer-motion";

export function ConfirmationModal({
  body,
  onCancel,
  onConfirm,
  title,
}: {
  body: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-md">
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md rounded-[28px] border border-white/70 bg-white p-6 text-slate-950 shadow-[0_30px_120px_rgba(15,23,42,0.24)] dark:border-white/[0.10] dark:bg-[#10191c] dark:text-white"
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
      >
        <h3 className="font-headline text-2xl font-semibold">{title}</h3>
        <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
          {body}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            className="h-10 rounded-full px-4 text-sm font-bold text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/[0.08]"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="h-10 rounded-full bg-slate-950 px-4 text-sm font-bold text-white dark:bg-white dark:text-slate-950"
            onClick={onConfirm}
            type="button"
          >
            Continue
          </button>
        </div>
      </motion.div>
    </div>
  );
}

