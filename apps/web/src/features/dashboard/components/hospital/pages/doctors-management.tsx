"use client";

import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  Edit3,
  Loader2,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Stethoscope,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  virujBackend,
  type VirujDoctor,
  type VirujDoctorInput,
} from "@/lib/viruj-backend";

const emptyForm: VirujDoctorInput = {
  availability: "",
  department: "",
  experience: "",
  fee: "",
  name: "",
  phone: "",
  qualification: "",
  specialty: "",
};

export function DoctorsManagementPage({
  organizationLabel,
}: {
  organizationLabel: string;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<VirujDoctor | null>(null);
  const [deletingDoctor, setDeletingDoctor] = useState<VirujDoctor | null>(
    null
  );

  const doctorsQuery = useQuery({
    queryFn: virujBackend.doctors.list,
    queryKey: virujBackend.doctors.key,
  });

  const invalidateDoctors = () =>
    queryClient.invalidateQueries({ queryKey: virujBackend.doctors.key });

  const createDoctorMutation = useMutation({
    mutationFn: virujBackend.doctors.create,
    onSuccess: async () => {
      setForm(emptyForm);
      setIsDialogOpen(false);
      await invalidateDoctors();
    },
  });

  const publishDoctorMutation = useMutation({
    mutationFn: virujBackend.doctors.publish,
    onSuccess: invalidateDoctors,
  });

  const updateDoctorMutation = useMutation({
    mutationFn: virujBackend.doctors.update,
    onSuccess: async () => {
      setEditingDoctor(null);
      setForm(emptyForm);
      setIsDialogOpen(false);
      await invalidateDoctors();
    },
  });

  const deleteDoctorMutation = useMutation({
    mutationFn: virujBackend.doctors.delete,
    onSuccess: async () => {
      setDeletingDoctor(null);
      await invalidateDoctors();
    },
  });

  const publishAllMutation = useMutation({
    mutationFn: virujBackend.doctors.publishAll,
    onSuccess: invalidateDoctors,
  });

  const doctors = useMemo(() => doctorsQuery.data ?? [], [doctorsQuery.data]);
  const filteredDoctors = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return doctors;
    }

    return doctors.filter((doctor) =>
      [doctor.name, doctor.department, doctor.specialty, doctor.qualification]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [doctors, query]);

  const publishedCount = doctors.filter((doctor) => doctor.published).length;
  const draftCount = Math.max(doctors.length - publishedCount, 0);
  const departmentCount = new Set(
    doctors.map((doctor) => doctor.department).filter(Boolean)
  ).size;
  const isSaving =
    createDoctorMutation.isPending || updateDoctorMutation.isPending;
  const canSubmit = Boolean(form.name.trim() && form.specialty.trim());

  function updateField(field: keyof VirujDoctorInput, value: string) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  function handleCreateDoctor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit || isSaving) {
      return;
    }

    if (editingDoctor) {
      updateDoctorMutation.mutate({ doctor: form, id: editingDoctor.id });
      return;
    }

    createDoctorMutation.mutate(form);
  }

  function openCreateDialog() {
    setEditingDoctor(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  }

  function openEditDialog(doctor: VirujDoctor) {
    setEditingDoctor(doctor);
    setForm({
      availability: doctor.availability,
      department: doctor.department,
      experience: doctor.experience,
      fee: doctor.fee,
      name: doctor.name,
      phone: doctor.phone,
      qualification: doctor.qualification,
      specialty: doctor.specialty,
    });
    setIsDialogOpen(true);
  }

  function closeDialog() {
    setEditingDoctor(null);
    setForm(emptyForm);
    setIsDialogOpen(false);
  }

  return (
    <div className="flex min-h-full flex-col p-6 lg:p-10">
      <section className="flex min-h-full flex-1 flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#111418]">
        <div className="grid gap-5 border-b border-slate-200 p-5 dark:border-white/[0.08] lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <h2 className="mt-1 font-headline text-3xl font-semi-bold text-slate-950 dark:text-slate-100">
              Hospital-added profiles
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
              Add doctors for {organizationLabel}, review their profile
              readiness, then publish the directory so the Viruj app can show
              live doctor availability to patients.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semi-bold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-100 dark:hover:bg-white/[0.08]"
              onClick={openCreateDialog}
              type="button"
            >
              <Plus size={16} />
              Add Doctor
            </button>
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semi-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              disabled={!doctors.length || publishAllMutation.isPending}
              onClick={() => publishAllMutation.mutate()}
              type="button"
            >
              {publishAllMutation.isPending ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <UploadCloud size={16} />
              )}
              Publish to app
            </button>
          </div>
        </div>

        <div className="grid border-b border-slate-200 dark:border-white/[0.08] md:grid-cols-3">
          <HeroMetric label="Total doctors" value={doctors.length} />
          <HeroMetric label="Published in app" value={publishedCount} />
          <HeroMetric label="Departments" value={departmentCount} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="text-sm font-semi-bold text-slate-950 dark:text-slate-100">
              {draftCount} draft profiles waiting for publish
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-500">
              Patients only see records marked as shown in app.
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={17}
            />
            <input
              className="h-11 w-full rounded-xl border-none bg-slate-100 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:ring-2 focus:ring-slate-300 dark:bg-white/[0.06] dark:text-slate-100 dark:focus:ring-white/20"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search doctor, department..."
              value={query}
            />
          </div>
        </div>

        <div className="flex-1 divide-y divide-slate-200 dark:divide-white/[0.08]">
          {doctorsQuery.isLoading ? (
            <DirectoryState label="Loading doctor directory..." />
          ) : doctorsQuery.isError ? (
            <DirectoryState label="Doctor backend is not reachable right now." />
          ) : filteredDoctors.length ? (
            filteredDoctors.map((doctor) => (
              <DoctorRow
                doctor={doctor}
                isPublishing={
                  publishDoctorMutation.isPending &&
                  publishDoctorMutation.variables?.id === doctor.id
                }
                key={doctor.id}
                onDelete={() => setDeletingDoctor(doctor)}
                onEdit={() => openEditDialog(doctor)}
                onPublish={() =>
                  publishDoctorMutation.mutate({ id: doctor.id })
                }
              />
            ))
          ) : (
            <DirectoryState label="No doctors match this search." />
          )}
        </div>
      </section>

      {isDialogOpen ? (
        <div className="erp-dialog-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
          <form
            className="w-full max-w-3xl overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-2xl dark:border-white/[0.1] dark:bg-[#111418]"
            onSubmit={handleCreateDoctor}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-white/[0.08]">
              <div>
                <p className="text-[10px] font-semi-bold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-600">
                  {editingDoctor ? "Edit doctor profile" : "New doctor profile"}
                </p>
                <h3 className="mt-1 font-headline text-2xl font-semi-bold text-slate-950 dark:text-slate-100">
                  {editingDoctor
                    ? "Update doctor details"
                    : "Add doctor to hospital list"}
                </h3>
              </div>
              <button
                aria-label="Close doctor dialog"
                className="inline-flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:hover:bg-white/[0.1]"
                onClick={closeDialog}
                type="button"
              >
                <X size={17} />
              </button>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-2">
              <DoctorInput
                label="Doctor name"
                onChange={(value) => updateField("name", value)}
                placeholder="Dr. Neha Rao"
                value={form.name}
              />
              <DoctorInput
                label="Specialty"
                onChange={(value) => updateField("specialty", value)}
                placeholder="Pediatric Neurologist"
                value={form.specialty}
              />
              <DoctorInput
                label="Department"
                onChange={(value) => updateField("department", value)}
                placeholder="Neurology"
                value={form.department}
              />
              <DoctorInput
                label="Qualification"
                onChange={(value) => updateField("qualification", value)}
                placeholder="MD, DM Neurology"
                value={form.qualification}
              />
              <DoctorInput
                label="Experience"
                onChange={(value) => updateField("experience", value)}
                placeholder="8 years"
                value={form.experience}
              />
              <DoctorInput
                label="Consultation fee"
                onChange={(value) => updateField("fee", value)}
                placeholder="800"
                value={form.fee}
              />
              <DoctorInput
                label="Phone"
                onChange={(value) => updateField("phone", value)}
                placeholder="+91 98110 22004"
                value={form.phone}
              />
              <DoctorInput
                label="Availability"
                onChange={(value) => updateField("availability", value)}
                placeholder="Mon-Fri, 09:00 AM - 03:00 PM"
                value={form.availability}
              />
            </div>

            {createDoctorMutation.isError || updateDoctorMutation.isError ? (
              <p className="px-5 text-sm font-semi-bold text-red-600 dark:text-red-300">
                Could not save this doctor. Check the backend and try again.
              </p>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 p-5 dark:border-white/[0.08]">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-500">
                {editingDoctor
                  ? "Published doctors update in the app feed after saving."
                  : "New doctors are saved as drafts until you publish them to the app."}
              </p>
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semi-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
                disabled={!canSubmit || isSaving}
                type="submit"
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Send size={16} />
                )}
                {editingDoctor ? "Update doctor" : "Save doctor"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {deletingDoctor ? (
        <div className="erp-dialog-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            aria-modal="true"
            className="w-full max-w-md rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-2xl dark:border-white/[0.1] dark:bg-[#111418]"
            role="dialog"
          >
            <div className="flex size-11 items-center justify-center rounded-2xl bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-200">
              <Trash2 size={18} />
            </div>
            <h3 className="mt-4 font-headline text-xl font-semi-bold text-slate-950 dark:text-slate-100">
              Delete {deletingDoctor.name}?
            </h3>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
              This removes the doctor from the ERP list and the published app
              directory.
            </p>
            {deleteDoctorMutation.isError ? (
              <p className="mt-3 text-sm font-semi-bold text-red-600 dark:text-red-300">
                Could not delete this doctor. Try again.
              </p>
            ) : null}
            <div className="mt-5 flex justify-end gap-2">
              <button
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semi-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/[0.08] dark:text-slate-200 dark:hover:bg-white/[0.06]"
                onClick={() => setDeletingDoctor(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semi-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={deleteDoctorMutation.isPending}
                onClick={() =>
                  deleteDoctorMutation.mutate({ id: deletingDoctor.id })
                }
                type="button"
              >
                {deleteDoctorMutation.isPending ? (
                  <Loader2 className="animate-spin" size={15} />
                ) : (
                  <Trash2 size={15} />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DoctorRow({
  doctor,
  isPublishing,
  onDelete,
  onEdit,
  onPublish,
}: {
  doctor: VirujDoctor;
  isPublishing: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onPublish: () => void;
}) {
  return (
    <div className="grid gap-4 p-5 lg:grid-cols-[1.25fr_0.85fr_0.9fr_auto] lg:items-center">
      <div className="flex items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-800 dark:bg-blue-400/15 dark:text-blue-200">
          <Stethoscope size={20} />
        </span>
        <div>
          <p className="font-headline text-lg font-semi-bold text-slate-950 dark:text-slate-100">
            {doctor.name}
          </p>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {doctor.specialty} | {doctor.qualification || "Qualification TBD"}
          </p>
        </div>
      </div>
      <div className="space-y-1 text-sm font-semibold text-slate-600 dark:text-slate-400">
        <p className="flex items-center gap-2">
          <BadgeCheck size={15} />
          {doctor.department || "General OPD"}
        </p>
        <p className="flex items-center gap-2">
          <Clock size={15} />
          {doctor.experience || "Experience TBD"}
        </p>
      </div>
      <div className="space-y-1 text-sm font-semibold text-slate-600 dark:text-slate-400">
        <p className="flex items-center gap-2">
          <CalendarDays size={15} />
          {doctor.availability || "Availability not set"}
        </p>
        <p>Fee: Rs {doctor.fee || "0"}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        {doctor.published ? (
          <span className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-teal-100 px-4 text-xs font-semi-bold text-teal-800 dark:bg-teal-400/14 dark:text-teal-200">
            <CheckCircle2 size={15} />
            Shown in app
          </span>
        ) : (
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 text-xs font-semi-bold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white/[0.08] dark:text-slate-200 dark:hover:bg-white/[0.12]"
            disabled={isPublishing}
            onClick={onPublish}
            type="button"
          >
            {isPublishing ? (
              <Loader2 className="animate-spin" size={15} />
            ) : (
              <ShieldCheck size={15} />
            )}
            Publish
          </button>
        )}
        <button
          aria-label={`Edit ${doctor.name}`}
          className="inline-flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-white/[0.08] dark:text-slate-300 dark:hover:bg-white/[0.12]"
          onClick={onEdit}
          type="button"
        >
          <Edit3 size={15} />
        </button>
        <button
          aria-label={`Delete ${doctor.name}`}
          className="inline-flex size-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100 dark:bg-red-400/10 dark:text-red-200 dark:hover:bg-red-400/15"
          onClick={onDelete}
          type="button"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

function DoctorInput({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-semi-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-600">
        {label}
      </span>
      <input
        className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-primary dark:border-white/[0.08] dark:bg-white/[0.055] dark:text-slate-100"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

function HeroMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-slate-200 p-5 dark:border-white/[0.08] md:border-r md:last:border-r-0">
      <p className="text-[10px] font-semi-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-600">
        {label}
      </p>
      <p className="mt-2 font-headline text-3xl font-semi-bold text-slate-950 dark:text-slate-100">
        {value}
      </p>
    </div>
  );
}

function DirectoryState({ label }: { label: string }) {
  return (
    <div className="flex min-h-32 items-center justify-center p-8 text-sm font-semi-bold text-slate-500 dark:text-slate-500">
      {label}
    </div>
  );
}
