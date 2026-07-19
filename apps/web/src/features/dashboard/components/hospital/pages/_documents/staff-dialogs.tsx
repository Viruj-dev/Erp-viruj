"use client";

import { Edit3, Mail, Trash2, UserPlus, X } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  roleLabels,
  StaffAvatar,
  type StaffPerson,
  type StaffRole,
} from "./staff-shared";

type MutationError = { message?: string } | null | undefined;

type AddStaffEntryDialogProps = {
  email: string;
  inviteError: MutationError;
  isInvitePending: boolean;
  name: string;
  onClose: () => void;
  onEmailChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onRoleChange: (value: StaffRole) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  role: StaffRole;
  roleOptions: readonly StaffRole[];
};

export function AddStaffEntryDialog({
  email,
  inviteError,
  isInvitePending,
  name,
  onClose,
  onEmailChange,
  onNameChange,
  onRoleChange,
  onSubmit,
  role,
  roleOptions,
}: AddStaffEntryDialogProps) {

  return (
    <StaffDialogPortal>
      <div className="erp-dialog-backdrop fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          aria-modal="true"
          className="w-full max-w-lg rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-2xl"
          role="dialog"
        >
          <DialogHeader
            icon={<UserPlus size={20} />}
            onClose={onClose}
            title="Add Staff Entry"
            description="Invite a person and assign their organization role."
            closeLabel="Close staff entry dialog"
          />

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <StaffInput
              autoFocus
              label="Staff Name"
              onChange={onNameChange}
              placeholder="staff name"
              type="text"
              value={name}
            />
            <StaffInput
              label="Staff Email"
              onChange={onEmailChange}
              placeholder="staff@organization.com"
              type="email"
              value={email}
            />
            <RoleSelect
              label="Assign Role"
              onChange={onRoleChange}
              roleOptions={roleOptions}
              value={role}
            />


            {inviteError ? (
              <p className="rounded-lg bg-error-container/30 px-3 py-2 text-sm font-semibold text-error">
                {inviteError.message || "Unable to invite staff."}
              </p>
            ) : null}

            <div className="grid gap-3 pt-2 sm:grid-cols-2">
              <button
                className="rounded-lg border border-outline-variant/25 px-4 py-3 text-sm font-semi-bold text-on-surface transition hover:bg-surface-container-low"
                onClick={onClose}
                type="button"
              >
                Cancel
              </button>
              <button
                className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semi-bold text-white shadow-md transition hover:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isInvitePending || !email.trim()}
                type="submit"
              >
                <Mail size={16} />
                {isInvitePending ? "Adding..." : "Add Person"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </StaffDialogPortal>
  );
}

type EditStaffRoleDialogProps = {
  editRole: StaffRole;
  error: MutationError;
  isPending: boolean;
  onClose: () => void;
  onRoleChange: (value: StaffRole) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  roleOptions: readonly StaffRole[];
  staff: StaffPerson;
};

export function EditStaffRoleDialog({
  editRole,
  error,
  isPending,
  onClose,
  onRoleChange,
  onSubmit,
  roleOptions,
  staff,
}: EditStaffRoleDialogProps) {
  return (
    <StaffDialogPortal>
      <div className="erp-dialog-backdrop fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          aria-modal="true"
          className="w-full max-w-lg rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          role="dialog"
        >
          <DialogHeader
            closeLabel="Close edit staff dialog"
            description="Change access privileges and role assignment for this user."
            icon={<Edit3 size={20} />}
            onClose={onClose}
            title="Edit Staff Role"
          />

          <div className="mt-6 rounded-xl bg-surface-container-low p-4">
            <StaffIdentity staff={staff} />
          </div>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <RoleSelect
              label="Select New Role"
              onChange={onRoleChange}
              roleOptions={roleOptions}
              value={editRole}
            />

            {error ? (
              <p className="rounded-lg bg-error-container/30 px-3 py-2 text-sm font-semibold text-error">
                {error.message || "Unable to update staff role."}
              </p>
            ) : null}

            <div className="grid gap-3 pt-2 sm:grid-cols-2">
              <button
                className="rounded-lg border border-outline-variant/25 px-4 py-3 text-sm font-semi-bold text-on-surface transition hover:bg-surface-container-low"
                onClick={onClose}
                type="button"
              >
                Cancel
              </button>
              <button
                className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semi-bold text-white shadow-md transition hover:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isPending}
                type="submit"
              >
                {isPending ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </StaffDialogPortal>
  );
}

type DeleteStaffDialogProps = {
  error: MutationError;
  isPending: boolean;
  onClose: () => void;
  onDelete: () => void;
  staff: StaffPerson;
};

export function DeleteStaffDialog({
  error,
  isPending,
  onClose,
  onDelete,
  staff,
}: DeleteStaffDialogProps) {
  return (
    <StaffDialogPortal>
      <div className="erp-dialog-backdrop fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          aria-modal="true"
          className="w-full max-w-lg rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          role="dialog"
        >
          <DialogHeader
            closeLabel="Close delete staff dialog"
            description="This action is irreversible. All clinical access will be revoked."
            icon={<Trash2 size={20} />}
            iconClassName="bg-error/10 text-error"
            onClose={onClose}
            title="Remove Staff Member"
            titleClassName="text-error"
          />

          <div className="mt-6 rounded-xl border border-error/15 bg-error-container/5 p-4">
            <p className="text-sm font-semibold text-on-surface">
              Are you sure you want to permanently remove this staff member?
            </p>
            <div className="mt-3 rounded-lg bg-white/50 p-3">
              <StaffIdentity staff={staff} />
            </div>
          </div>

          {error ? (
            <p className="mt-4 rounded-lg bg-error-container/30 px-3 py-2 text-sm font-semibold text-error">
              {error.message || "Unable to remove staff."}
            </p>
          ) : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              className="rounded-lg border border-outline-variant/25 px-4 py-3 text-sm font-semi-bold text-on-surface transition hover:bg-surface-container-low"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="flex items-center justify-center gap-2 rounded-lg bg-error px-4 py-3 text-sm font-semi-bold text-white shadow-md transition hover:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending}
              onClick={onDelete}
              type="button"
            >
              {isPending ? "Removing..." : "Delete Staff"}
            </button>
          </div>
        </div>
      </div>
    </StaffDialogPortal>
  );
}

function StaffDialogPortal({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(children, document.body);
}

function DialogHeader({
  closeLabel,
  description,
  icon,
  iconClassName = "bg-primary text-white",
  onClose,
  title,
  titleClassName = "text-on-surface",
}: {
  closeLabel: string;
  description: string;
  icon: ReactNode;
  iconClassName?: string;
  onClose: () => void;
  title: string;
  titleClassName?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClassName}`}
        >
          {icon}
        </div>
        <div>
          <h3
            className={`font-headline text-xl font-semi-bold ${titleClassName}`}
          >
            {title}
          </h3>
          <p className="mt-1 text-sm font-medium text-on-surface-variant">
            {description}
          </p>
        </div>
      </div>
      <button
        aria-label={closeLabel}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container-low text-on-surface-variant transition hover:bg-surface-container-high"
        onClick={onClose}
        type="button"
      >
        <X size={17} />
      </button>
    </div>
  );
}

function StaffInput({
  autoFocus = false,
  label,
  onChange,
  placeholder,
  type,
  value,
}: {
  autoFocus?: boolean;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  type: "email" | "text";
  value: string;
}) {
  return (
    <label className="block text-[10px] font-semi-bold uppercase tracking-[0.18em] text-on-surface-variant">
      {label}
      <input
        autoFocus={autoFocus}
        className="mt-2 w-full rounded-lg border border-outline-variant/25 bg-surface px-3 py-3 text-sm font-semibold normal-case tracking-normal text-on-surface outline-none transition focus:border-primary"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}

function RoleSelect({
  label,
  onChange,
  roleOptions,
  value,
}: {
  label: string;
  onChange: (value: StaffRole) => void;
  roleOptions: readonly StaffRole[];
  value: StaffRole;
}) {
  return (
    <label className="block text-[10px] font-semi-bold uppercase tracking-[0.18em] text-on-surface-variant">
      {label}
      <select
        className="mt-2 w-full rounded-lg border border-outline-variant/25 bg-surface px-3 py-3 text-sm font-semibold normal-case tracking-normal text-on-surface outline-none transition focus:border-primary"
        onChange={(event) => onChange(event.target.value as StaffRole)}
        value={value}
      >
        {roleOptions.map((roleOption) => (
          <option key={roleOption} value={roleOption}>
            {roleLabels[roleOption]}
          </option>
        ))}
      </select>
    </label>
  );
}

function StaffIdentity({ staff }: { staff: StaffPerson }) {
  return (
    <div className="flex items-center gap-3">
      <StaffAvatar email={staff.email} name={staff.name || ""} small />
      <div className="min-w-0">
        <p className="truncate text-sm font-semi-bold text-on-surface">
          {staff.name || "Unnamed staff"}
        </p>
        <p className="truncate text-xs text-on-surface-variant">
          {staff.email}
        </p>
      </div>
    </div>
  );
}
