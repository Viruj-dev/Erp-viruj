"use client";

import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Stethoscope,
  UploadCloud,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Doctor = {
  availability: string;
  department: string;
  experience: string;
  fee: string;
  id: string;
  name: string;
  phone: string;
  published: boolean;
  qualification: string;
  specialty: string;
};

const storageKey = "viruj-hospital-doctors";

const defaultDoctors: Doctor[] = [
  {
    availability: "Mon-Fri, 10:00 AM - 04:00 PM",
    department: "Cardiology",
    experience: "12 years",
    fee: "900",
    id: "DOC-1001",
    name: "Dr. Asha Mehta",
    phone: "+91 98110 22001",
    published: true,
    qualification: "MD, DM Cardiology",
    specialty: "Interventional Cardiologist",
  },
  {
    availability: "Tue-Sat, 09:00 AM - 02:00 PM",
    department: "Orthopedics",
    experience: "9 years",
    fee: "700",
    id: "DOC-1002",
    name: "Dr. Arjun Sen",
    phone: "+91 98110 22002",
    published: true,
    qualification: "MS Orthopedics",
    specialty: "Joint Replacement Surgeon",
  },
  {
    availability: "Mon-Sat, 11:00 AM - 06:00 PM",
    department: "General Medicine",
    experience: "7 years",
    fee: "500",
    id: "DOC-1003",
    name: "Dr. Farah Siddiqui",
    phone: "+91 98110 22003",
    published: false,
    qualification: "MD Medicine",
    specialty: "Internal Medicine",
  },
];

const emptyForm = {
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
  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    if (typeof window === "undefined") {
      return defaultDoctors;
    }

    const stored = window.localStorage.getItem(storageKey);

    if (!stored) {
      return defaultDoctors;
    }

    try {
      return JSON.parse(stored) as Doctor[];
    } catch {
      return defaultDoctors;
    }
  });
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState("");

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(doctors));
  }, [doctors]);

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

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  function addDoctor() {
    if (!form.name.trim() || !form.specialty.trim()) {
      return;
    }

    const nextDoctor: Doctor = {
      ...form,
      id: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      name: form.name.trim(),
      published: true,
    };

    setDoctors((currentDoctors) => [nextDoctor, ...currentDoctors]);
    setForm(emptyForm);
  }

  function togglePublish(id: string) {
    setDoctors((currentDoctors) =>
      currentDoctors.map((doctor) =>
        doctor.id === id ? { ...doctor, published: !doctor.published } : doctor
      )
    );
  }

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#14171b]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-5 dark:border-white/[0.08]">
          <div>
            <p className="text-[10px] font-semi-bold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-600">
              Doctors directory
            </p>
            <h2 className="mt-1 font-headline text-2xl font-semi-bold text-slate-950 dark:text-slate-100">
              Hospital-added profiles
            </h2>
          </div>
          <div className="relative w-full sm:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={17}
            />
            <input
              className="h-11 w-full rounded-xl border-none bg-slate-100 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none dark:bg-white/[0.06] dark:text-slate-100"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search doctor, department..."
              value={query}
            />
          </div>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-white/[0.08]">
          {filteredDoctors.map((doctor) => (
            <DoctorRow
              doctor={doctor}
              key={doctor.id}
              onTogglePublish={() => togglePublish(doctor.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function DoctorRow({
  doctor,
  onTogglePublish,
}: {
  doctor: Doctor;
  onTogglePublish: () => void;
}) {
  return (
    <div className="grid gap-4 p-5 lg:grid-cols-[1.2fr_0.8fr_0.8fr_auto] lg:items-center">
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
      <button
        className={
          doctor.published
            ? "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-teal-100 px-4 text-xs font-semi-bold text-teal-800 dark:bg-teal-400/14 dark:text-teal-200"
            : "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 text-xs font-semi-bold text-slate-600 dark:bg-white/[0.08] dark:text-slate-300"
        }
        onClick={onTogglePublish}
        type="button"
      >
        <CheckCircle2 size={15} />
        {doctor.published ? "Shown in app" : "Hidden from app"}
      </button>
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
        className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-primary dark:border-white/[0.08] dark:bg-white/[0.055] dark:text-slate-100"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

function HeroMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
      <p className="text-[10px] font-semi-bold uppercase tracking-[0.18em] text-white/55">
        {label}
      </p>
      <p className="mt-2 font-headline text-3xl font-semi-bold">{value}</p>
    </div>
  );
}
