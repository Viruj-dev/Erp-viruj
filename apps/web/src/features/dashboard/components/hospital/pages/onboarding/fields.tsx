import { ErpSelect } from "@/components/ui/erp/select";
import { cn } from "@/lib/utils";
import { ImagePlus } from "lucide-react";
import { useState, type ReactNode } from "react";

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
  required = false,
  min,
  max,
  step,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  value: string;
}) {
  return (
    <label>
      <FieldLabel required={required}>{label}</FieldLabel>
      <input
        className={fieldClassName()}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        step={step}
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
  required = false,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
  value: string;
}) {
  return (
    <label>
      <FieldLabel required={required}>{label}</FieldLabel>
      <ErpSelect
        className={fieldClassName("appearance-none")}
        onChange={(event) => onChange(event.target.value)}
        value={value}
        required={required}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </ErpSelect>
    </label>
  );
}

export function UploadField({
  label,
  name,
  onChange,
  required = false,
}: {
  label: string;
  name: string;
  required?: boolean;
  onChange: (file: {
    file: File;
    name: string;
    previewUrl: string;
  }) => Promise<void> | void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const handleFileChange = async (file?: File) => {
    if (!file) return;
    setError("");
    if (
      !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
        file.type
      ) ||
      file.size > 5 * 1024 * 1024
    ) {
      setError("Choose a JPG, PNG, WebP, or GIF image up to 5 MB.");
      return;
    }
    setPending(true);
    const previewUrl = URL.createObjectURL(file);
    try {
      await onChange({ file, name: file.name, previewUrl });
    } catch {
      setError("Upload failed. Please choose the image again to retry.");
    } finally {
      setPending(false);
    }
  };

  return (
    <label className="block">
      <FieldLabel required={required}>{label}</FieldLabel>
      <div className="flex h-11 cursor-pointer items-center justify-between gap-3 rounded-lg border border-[var(--onboarding-border-strong)] bg-[var(--onboarding-panel-muted)] px-3.5 text-sm font-medium text-[var(--onboarding-muted)] shadow-sm transition hover:border-[var(--onboarding-accent)] hover:bg-[var(--onboarding-panel)]">
        <span className="truncate">
          {pending ? "Uploading…" : name || "Choose image · up to 5 MB"}
        </span>
        <ImagePlus size={17} />
      </div>
      <input
        accept="image/jpeg,image/png,image/webp,image/gif"
        aria-required={required}
        disabled={pending}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          void handleFileChange(file);
        }}
        type="file"
      />
      {error && (
        <span role="alert" className="mt-2 block text-xs text-rose-600">
          {error}
        </span>
      )}
    </label>
  );
}

export function FieldLabel({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <span className="mb-1.5 block px-0.5 text-xs font-semibold text-[var(--onboarding-heading)]">
      {typeof children === "string"
        ? children.replace(/ \(optional\)/i, "")
        : children}
      <span
        className={
          required
            ? "ml-1.5 text-[var(--onboarding-accent)]"
            : "ml-1.5 font-normal text-[var(--onboarding-muted)]"
        }
      >
        {required ? "* Required" : "Optional"}
      </span>
    </span>
  );
}

export function fieldClassName(extra?: string) {
  return cn(
    "h-11 w-full rounded-lg border border-[var(--onboarding-border-strong)] bg-[var(--onboarding-panel-muted)] px-3.5 text-sm font-medium text-[var(--onboarding-text)] shadow-sm outline-none transition placeholder:text-[var(--onboarding-placeholder)] focus:border-[var(--onboarding-accent)] focus:bg-[var(--onboarding-panel)] focus:ring-4 focus:ring-[var(--onboarding-accent-ring)] disabled:cursor-not-allowed disabled:opacity-50",
    extra
  );
}
