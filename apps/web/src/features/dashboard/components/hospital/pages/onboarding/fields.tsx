import { cn } from "@/lib/utils";
import { ImagePlus } from "lucide-react";
import type { ReactNode } from "react";

export function PreviewRow({
  icon,
  value,
}: {
  icon: ReactNode;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-[var(--onboarding-panel-soft)] px-3 py-2 text-xs font-bold text-[var(--onboarding-muted-strong)]">
      {icon}
      {value}
    </div>
  );
}

export function TextField({
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  value: string;
}) {
  return (
    <label>
      <FieldLabel>{label}</FieldLabel>
      <input
        className={fieldClassName()}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}

export function SelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <label>
      <FieldLabel>{label}</FieldLabel>
      <select
        className={fieldClassName("appearance-none")}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function UploadField({
  label,
  name,
  onChange,
}: {
  label: string;
  name: string;
  onChange: (file: { file: File; name: string; previewUrl: string }) => Promise<void> | void;
}) {
  const handleFileChange = (file?: File) => {
    if (!file) return;

    onChange({
      file,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
    });
  };

  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex h-11 cursor-pointer items-center justify-between gap-3 rounded-lg border border-[var(--onboarding-border-strong)] bg-[var(--onboarding-panel-muted)] px-3.5 text-sm font-medium text-[var(--onboarding-muted)] shadow-sm transition hover:border-[var(--onboarding-accent)] hover:bg-[var(--onboarding-panel)]">
        <span className="truncate">{name || "Choose image"}</span>
        <ImagePlus size={17} />
      </div>
      <input
        accept="image/*"
        className="sr-only"
        onChange={(event) => handleFileChange(event.target.files?.[0])}
        type="file"
      />
    </label>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mb-1.5 block px-0.5 text-xs font-semibold text-[var(--onboarding-heading)]">
      {children}
    </span>
  );
}

export function fieldClassName(extra?: string) {
  return cn(
    "h-11 w-full rounded-lg border border-[var(--onboarding-border-strong)] bg-[var(--onboarding-panel-muted)] px-3.5 text-sm font-medium text-[var(--onboarding-text)] shadow-sm outline-none transition placeholder:text-[var(--onboarding-placeholder)] focus:border-[var(--onboarding-accent)] focus:bg-[var(--onboarding-panel)] focus:ring-4 focus:ring-[var(--onboarding-accent-ring)] disabled:cursor-not-allowed disabled:opacity-50",
    extra
  );
}

