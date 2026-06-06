"use client";

import { virujBackend, type VirujAppointment, type VirujAppointmentStatus } from "@/lib/viruj-backend";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Send,
  RotateCcw,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

type PatientStatus =
  | "Checked-in"
  | "Scheduled"
  | "Discharged"
  | "Critical"
  | "Follow-up"
  | "Pending Approval"
  | "Approved"
  | "Rejected"
  | "Rescheduled"
  | "Cancelled"
  | "Completed"
  | "No Show";

type DirectoryPatient = {
  age: number;
  doctor: string;
  doctorInitials: string;
  gender: "F" | "M";
  id: string;
  initials: string;
  lastVisit: string;
  name: string;
  status: PatientStatus;
  tone: "blue" | "indigo" | "slate" | "rose" | "teal";
  appointmentId?: string;
  appointmentStatus?: VirujAppointmentStatus;
};

const directoryPatients: DirectoryPatient[] = [
  {
    age: 34,
    doctor: "Dr. Aris Thorne",
    doctorInitials: "AT",
    gender: "F",
    id: "#VH-9021",
    initials: "EM",
    lastVisit: "24 Oct, 2023",
    name: "Elena Mitchell",
    status: "Checked-in",
    tone: "blue",
  },
  {
    age: 52,
    doctor: "Dr. Sarah Chen",
    doctorInitials: "SC",
    gender: "M",
    id: "#VH-8842",
    initials: "JK",
    lastVisit: "Today, 09:15 AM",
    name: "Julian Kloss",
    status: "Scheduled",
    tone: "indigo",
  },
  {
    age: 28,
    doctor: "Dr. Aris Thorne",
    doctorInitials: "AT",
    gender: "F",
    id: "#VH-1109",
    initials: "RW",
    lastVisit: "19 Oct, 2023",
    name: "Rebecca Wells",
    status: "Discharged",
    tone: "slate",
  },
  {
    age: 67,
    doctor: "Dr. Aris Thorne",
    doctorInitials: "AT",
    gender: "M",
    id: "#VH-5044",
    initials: "MB",
    lastVisit: "Today, 10:45 AM",
    name: "Marcus Bennett",
    status: "Critical",
    tone: "rose",
  },
  {
    age: 19,
    doctor: "Dr. Sarah Chen",
    doctorInitials: "SC",
    gender: "F",
    id: "#VH-7721",
    initials: "SP",
    lastVisit: "Yesterday",
    name: "Sofia Perez",
    status: "Follow-up",
    tone: "teal",
  },
  {
    name: "David Vasquez",
    age: 41,
    doctor: "Dr. Sarah Chen",
    doctorInitials: "SC",
    gender: "M",
    id: "#VH-3401",
    initials: "DV",
    lastVisit: "22 Oct, 2023",
    status: "Checked-in",
    tone: "blue",
  },
  {
    name: "Clara Oswald",
    age: 29,
    doctor: "Dr. Aris Thorne",
    doctorInitials: "AT",
    gender: "F",
    id: "#VH-6789",
    initials: "CO",
    lastVisit: "Today, 11:30 AM",
    status: "Scheduled",
    tone: "indigo",
  },
  {
    name: "Thomas Miller",
    age: 48,
    doctor: "Dr. Sarah Chen",
    doctorInitials: "SC",
    gender: "M",
    id: "#VH-4521",
    initials: "TM",
    lastVisit: "15 Oct, 2023",
    status: "Discharged",
    tone: "slate",
  },
  {
    name: "Amelia Pond",
    age: 31,
    doctor: "Dr. Aris Thorne",
    doctorInitials: "AT",
    gender: "F",
    id: "#VH-8890",
    initials: "AP",
    lastVisit: "Yesterday",
    status: "Follow-up",
    tone: "teal",
  },
  {
    name: "Arthur Williams",
    age: 72,
    doctor: "Dr. Sarah Chen",
    doctorInitials: "SC",
    gender: "M",
    id: "#VH-2311",
    initials: "AW",
    lastVisit: "Today, 08:00 AM",
    status: "Critical",
    tone: "rose",
  },
  {
    name: "Lucas Scott",
    age: 25,
    doctor: "Dr. Aris Thorne",
    doctorInitials: "AT",
    gender: "M",
    id: "#VH-1092",
    initials: "LS",
    lastVisit: "20 Oct, 2023",
    status: "Checked-in",
    tone: "blue",
  },
  {
    name: "Brooke Davis",
    age: 33,
    doctor: "Dr. Sarah Chen",
    doctorInitials: "SC",
    gender: "F",
    id: "#VH-8902",
    initials: "BD",
    lastVisit: "Today, 02:45 PM",
    status: "Scheduled",
    tone: "indigo",
  },
  {
    name: "Nathan Scott",
    age: 27,
    doctor: "Dr. Aris Thorne",
    doctorInitials: "AT",
    gender: "M",
    id: "#VH-4432",
    initials: "NS",
    lastVisit: "18 Oct, 2023",
    status: "Discharged",
    tone: "slate",
  },
  {
    name: "Peyton Sawyer",
    age: 30,
    doctor: "Dr. Sarah Chen",
    doctorInitials: "SC",
    gender: "F",
    id: "#VH-5543",
    initials: "PS",
    lastVisit: "Yesterday",
    status: "Follow-up",
    tone: "teal",
  },
  {
    name: "Haley James",
    age: 32,
    doctor: "Dr. Aris Thorne",
    doctorInitials: "AT",
    gender: "F",
    id: "#VH-6654",
    initials: "HJ",
    lastVisit: "Today, 12:00 PM",
    status: "Checked-in",
    tone: "blue",
  },
];

const scheduleFilters = ["Past", "Present", "Upcoming"] as const;
const pageSize = 20;

export function ErpDemoPatients() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [requestForm, setRequestForm] = useState({
    mobileUserId: "x-mobile-user",
    patientAge: "29",
    patientGender: "Female",
    patientName: "Mobile App Patient",
    patientPhone: "+919876543210",
    reason: "Appointment request from mobile app.",
    requestedAt: defaultRequestDateTime(),
  });
  const [lastRequest, setLastRequest] = useState<VirujAppointment | null>(null);
  const appointmentsQuery = useQuery({
    queryFn: virujBackend.appointments.list,
    queryKey: virujBackend.appointments.key,
  });
  const createRequestMutation = useMutation({
    mutationFn: virujBackend.appointments.createMobileRequest,
    onSuccess: async (appointment) => {
      setLastRequest(appointment);
      setPage(1);
      await queryClient.invalidateQueries({
        queryKey: virujBackend.appointments.key,
      });
    },
  });
  const updateStatusMutation = useMutation({
    mutationFn: virujBackend.appointments.updateStatus,
    onSuccess: async (appointment) => {
      setLastRequest(appointment);
      await queryClient.invalidateQueries({
        queryKey: virujBackend.appointments.key,
      });
    },
  });
  const appointmentPatients = useMemo(
    () =>
      appointmentsQuery.data
        ? appointmentsQuery.data
            .filter((appointment) => !isFakeAppointment(appointment))
            .map(mapAppointmentToPatient)
        : [],
    [appointmentsQuery.data]
  );
  const filteredPatients = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return appointmentPatients;
    }

    return appointmentPatients.filter((patient) =>
      [patient.name, patient.id, patient.doctor]
        .join(" ")
        .toLowerCase()
        .includes(value)
    );
  }, [appointmentPatients, search]);
  const pageCount = Math.max(1, Math.ceil(filteredPatients.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visiblePatients = filteredPatients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const updateAppointment = (
    patient: DirectoryPatient,
    status: VirujAppointmentStatus
  ) => {
    if (!patient.appointmentId) {
      return;
    }

    if (status === "rescheduled") {
      const value = window.prompt("New appointment date/time", "");
      if (!value) return;

      const startsAt = new Date(value);
      if (Number.isNaN(startsAt.getTime())) {
        window.alert("Please enter a valid date/time.");
        return;
      }

      const endsAt = new Date(startsAt.getTime() + 30 * 60 * 1000);
      updateStatusMutation.mutate({
        approvalNotes: "Rescheduled by ERP user.",
        endsAt: endsAt.toISOString(),
        id: patient.appointmentId,
        startsAt: startsAt.toISOString(),
        status,
      });
      return;
    }

    updateStatusMutation.mutate({
      approvalNotes:
        status === "approved"
          ? "Approved by ERP user."
          : "Rejected by ERP user.",
      id: patient.appointmentId,
      status,
    });
  };

  const sendMobileRequest = () => {
    createRequestMutation.mutate({
      mobileUserId: requestForm.mobileUserId,
      patientAge: Number(requestForm.patientAge) || null,
      patientGender: requestForm.patientGender,
      patientName: requestForm.patientName,
      patientPhone: requestForm.patientPhone,
      reason: requestForm.reason,
      requestedAt: requestForm.requestedAt
        ? new Date(requestForm.requestedAt).toISOString()
        : undefined,
    });
  };

  return (
    <div className="space-y-7 p-6 lg:p-4">
      <section className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#14171b]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-600">
              Mobile App Request
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Send a real appointment request and track approval feedback in the list.
            </p>
          </div>
          {lastRequest ? (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-400/14 dark:text-blue-200">
              Last request: {appointmentStatusLabel(lastRequest.status)}
            </span>
          ) : null}
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_0.5fr_0.7fr_1fr_1.4fr_auto]">
          <input
            className="h-11 rounded-xl border-none bg-slate-100 px-4 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-primary/20 dark:bg-white/[0.06] dark:text-slate-100"
            onChange={(event) =>
              setRequestForm((value) => ({ ...value, patientName: event.target.value }))
            }
            placeholder="Patient name"
            value={requestForm.patientName}
          />
          <input
            className="h-11 rounded-xl border-none bg-slate-100 px-4 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-primary/20 dark:bg-white/[0.06] dark:text-slate-100"
            onChange={(event) =>
              setRequestForm((value) => ({ ...value, mobileUserId: event.target.value }))
            }
            placeholder="Mobile user id"
            value={requestForm.mobileUserId}
          />
          <input
            className="h-11 rounded-xl border-none bg-slate-100 px-4 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-primary/20 dark:bg-white/[0.06] dark:text-slate-100"
            onChange={(event) =>
              setRequestForm((value) => ({ ...value, patientAge: event.target.value }))
            }
            placeholder="Age"
            type="number"
            value={requestForm.patientAge}
          />
          <input
            className="h-11 rounded-xl border-none bg-slate-100 px-4 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-primary/20 dark:bg-white/[0.06] dark:text-slate-100"
            onChange={(event) =>
              setRequestForm((value) => ({ ...value, patientPhone: event.target.value }))
            }
            placeholder="Phone"
            value={requestForm.patientPhone}
          />
          <input
            className="h-11 rounded-xl border-none bg-slate-100 px-4 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-primary/20 dark:bg-white/[0.06] dark:text-slate-100"
            onChange={(event) =>
              setRequestForm((value) => ({ ...value, requestedAt: event.target.value }))
            }
            type="datetime-local"
            value={requestForm.requestedAt}
          />
          <input
            className="h-11 rounded-xl border-none bg-slate-100 px-4 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-primary/20 dark:bg-white/[0.06] dark:text-slate-100"
            onChange={(event) =>
              setRequestForm((value) => ({ ...value, reason: event.target.value }))
            }
            placeholder="Reason"
            value={requestForm.reason}
          />
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={
              createRequestMutation.isPending ||
              !requestForm.patientName.trim() ||
              !requestForm.mobileUserId.trim()
            }
            onClick={sendMobileRequest}
            type="button"
          >
            <Send size={16} />
            Send
          </button>
        </div>

        {createRequestMutation.isError ? (
          <p className="mt-3 text-sm font-semibold text-rose-600">
            {createRequestMutation.error.message}
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#14171b]">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-600">
            Filter Schedule
          </p>
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-white/[0.06]">
            {scheduleFilters.map((filter) => (
              <button
                className={
                  filter === "Present"
                    ? "h-10 rounded-lg bg-white text-xs font-semibold text-primary shadow-sm dark:bg-white/[0.12] dark:text-blue-200"
                    : "h-10 rounded-lg text-xs font-semibold text-slate-500 transition hover:bg-white/70 hover:text-slate-900 dark:text-slate-500 dark:hover:bg-white/[0.08] dark:hover:text-slate-200"
                }
                key={filter}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#14171b]">
          <div className="relative min-w-0 flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600"
              size={18}
            />
            <input
              className="h-11 w-full rounded-xl border-none bg-slate-100 pl-12 pr-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-500 focus:ring-2 focus:ring-primary/20 dark:bg-white/[0.06] dark:text-slate-100 dark:placeholder:text-slate-500"
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
              placeholder="Quick search by Name, Patient ID, or Phone..."
              type="text"
              value={search}
            />
          </div>
          <button
            aria-label="Open patient filters"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:hover:bg-white/[0.1]"
            type="button"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/85 shadow-sm dark:border-white/[0.08] dark:bg-[#14171b]">
        <div className="grid grid-cols-[minmax(220px,1.5fr)_0.75fr_0.95fr_1.15fr_0.75fr_132px] gap-5 border-b border-slate-200/80 bg-slate-50/80 px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-slate-500">
          <span>Patient Name</span>
          <span>Patient ID</span>
          <span>Last Visit</span>
          <span>Primary Doctor</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        <div className="divide-y divide-slate-200/70 dark:divide-white/[0.07]">
          {visiblePatients.map((patient) => (
            <div
              className="grid grid-cols-[minmax(220px,1.5fr)_0.75fr_0.95fr_1.15fr_0.75fr_132px] items-center gap-5 px-6 py-4 text-sm transition hover:bg-slate-50 dark:hover:bg-white/[0.04]"
              key={patient.id}
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar initials={patient.initials} tone={patient.tone} />
                <div className="min-w-0">
                  <p className="truncate font-headline text-[15px] font-semibold text-slate-950 dark:text-slate-100">
                    {patient.name}
                  </p>
                  <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-500">
                    {patient.gender}, {patient.age} yrs
                  </p>
                </div>
              </div>

              <span className="font-semibold text-slate-800 dark:text-slate-300">
                {patient.id}
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-400">
                {patient.lastVisit}
              </span>
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[9px] font-semibold text-white ring-2 ring-white dark:bg-slate-700 dark:ring-[#14171b]">
                  {patient.doctorInitials}
                </span>
                <span className="truncate font-semibold text-slate-800 dark:text-slate-300">
                  {patient.doctor}
                </span>
              </div>
              <StatusBadge status={patient.status} />
              <AppointmentActions
                disabled={updateStatusMutation.isPending}
                onApprove={() => updateAppointment(patient, "approved")}
                onReject={() => updateAppointment(patient, "rejected")}
                onReschedule={() => updateAppointment(patient, "rescheduled")}
                patient={patient}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200/80 px-6 py-4 dark:border-white/[0.08]">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-500">
            Showing {visiblePatients.length ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
            {Math.min(currentPage * pageSize, filteredPatients.length)} of{" "}
            {filteredPatients.length} appointments
          </p>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
            <button
              aria-label="Previous page"
              className="flex size-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/[0.08] dark:hover:text-slate-100"
              disabled={currentPage <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              type="button"
            >
              <ChevronLeft size={17} />
            </button>
            <button
              className="flex size-9 items-center justify-center rounded-lg bg-primary text-white dark:bg-blue-500"
              type="button"
            >
              {currentPage}
            </button>
            <span className="px-2">of {pageCount}</span>
            <button
              aria-label="Next page"
              className="flex size-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/[0.08] dark:hover:text-slate-100"
              disabled={currentPage >= pageCount}
              onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              type="button"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Avatar({
  initials,
  tone,
}: {
  initials: string;
  tone: DirectoryPatient["tone"];
}) {
  const toneClass = {
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-400/18 dark:text-blue-200",
    indigo:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-400/18 dark:text-indigo-200",
    rose: "bg-rose-100 text-rose-800 dark:bg-rose-400/18 dark:text-rose-200",
    slate:
      "bg-slate-200 text-slate-700 dark:bg-slate-600/30 dark:text-slate-200",
    teal: "bg-teal-100 text-teal-800 dark:bg-teal-400/18 dark:text-teal-200",
  }[tone];

  return (
    <span
      className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${toneClass}`}
    >
      {initials}
    </span>
  );
}

function StatusBadge({ status }: { status: PatientStatus }) {
  const statusClass = {
    Approved:
      "bg-teal-100 text-teal-800 dark:bg-teal-400/14 dark:text-teal-200",
    "Checked-in":
      "bg-teal-100 text-teal-800 dark:bg-teal-400/14 dark:text-teal-200",
    Cancelled:
      "bg-rose-100 text-rose-800 dark:bg-rose-400/14 dark:text-rose-200",
    Completed:
      "bg-slate-200 text-slate-700 dark:bg-slate-500/18 dark:text-slate-300",
    Critical:
      "bg-rose-100 text-rose-800 dark:bg-rose-400/14 dark:text-rose-200",
    Discharged:
      "bg-slate-200 text-slate-700 dark:bg-slate-500/18 dark:text-slate-300",
    "Follow-up":
      "bg-cyan-100 text-cyan-800 dark:bg-cyan-400/14 dark:text-cyan-200",
    "No Show":
      "bg-amber-100 text-amber-800 dark:bg-amber-400/14 dark:text-amber-200",
    "Pending Approval":
      "bg-blue-100 text-blue-800 dark:bg-blue-400/14 dark:text-blue-200",
    Rejected:
      "bg-rose-100 text-rose-800 dark:bg-rose-400/14 dark:text-rose-200",
    Rescheduled:
      "bg-cyan-100 text-cyan-800 dark:bg-cyan-400/14 dark:text-cyan-200",
    Scheduled:
      "bg-blue-100 text-blue-800 dark:bg-blue-400/14 dark:text-blue-200",
  }[status];

  return (
    <span
      className={`w-fit rounded-full px-3 py-1 text-[11px] font-medium ${statusClass}`}
    >
      {status}
    </span>
  );
}

function AppointmentActions({
  disabled,
  onApprove,
  onReject,
  onReschedule,
  patient,
}: {
  disabled: boolean;
  onApprove: () => void;
  onReject: () => void;
  onReschedule: () => void;
  patient: DirectoryPatient;
}) {
  if (!patient.appointmentId) {
    return (
      <button
        aria-label={`More actions for ${patient.name}`}
        className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/[0.08] dark:hover:text-slate-100"
        type="button"
      >
        <MoreHorizontal size={18} />
      </button>
    );
  }

  const canReview =
    patient.appointmentStatus === "pending_approval" ||
    patient.appointmentStatus === "approved" ||
    patient.appointmentStatus === "rescheduled";

  return (
    <div className="ml-auto flex items-center justify-end gap-1">
      <button
        aria-label={`Approve ${patient.name}`}
        className="flex size-9 items-center justify-center rounded-lg text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-emerald-300 dark:hover:bg-emerald-400/[0.1]"
        disabled={disabled || !canReview}
        onClick={onApprove}
        type="button"
      >
        <Check size={16} />
      </button>
      <button
        aria-label={`Reject ${patient.name}`}
        className="flex size-9 items-center justify-center rounded-lg text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-rose-300 dark:hover:bg-rose-400/[0.1]"
        disabled={disabled || !canReview}
        onClick={onReject}
        type="button"
      >
        <X size={16} />
      </button>
      <button
        aria-label={`Reschedule ${patient.name}`}
        className="flex size-9 items-center justify-center rounded-lg text-cyan-600 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-cyan-300 dark:hover:bg-cyan-400/[0.1]"
        disabled={disabled || !canReview}
        onClick={onReschedule}
        type="button"
      >
        <RotateCcw size={15} />
      </button>
    </div>
  );
}

function mapAppointmentToPatient(appointment: VirujAppointment): DirectoryPatient {
  const status = appointmentStatusLabel(appointment.status);
  const date = new Date(appointment.appointmentDate);

  return {
    age: appointment.patientAge ?? 0,
    appointmentId: appointment.id,
    appointmentStatus: appointment.status,
    doctor: appointment.doctorName,
    doctorInitials: getInitials(appointment.doctorName),
    gender: appointment.patientGender === "Male" ? "M" : "F",
    id: appointment.patientUserId ?? appointment.id,
    initials: getInitials(appointment.patientName),
    lastVisit: `${formatAppointmentDate(date)}, ${appointment.appointmentTime}`,
    name: appointment.patientName,
    status,
    tone: status === "Rejected" || status === "Cancelled" ? "rose" : status === "Rescheduled" ? "teal" : "blue",
  };
}

function isFakeAppointment(appointment: VirujAppointment) {
  return [appointment.id, appointment.patientUserId]
    .filter(Boolean)
    .some((value) => value?.toLowerCase().startsWith("fake-"));
}

function appointmentStatusLabel(status: VirujAppointmentStatus): PatientStatus {
  switch (status) {
    case "approved":
      return "Approved";
    case "cancelled":
      return "Cancelled";
    case "completed":
      return "Completed";
    case "no_show":
      return "No Show";
    case "pending_approval":
      return "Pending Approval";
    case "rejected":
      return "Rejected";
    case "rescheduled":
      return "Rescheduled";
  }
}

function formatAppointmentDate(value: Date) {
  if (Number.isNaN(value.getTime())) {
    return "Requested";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return "VH";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function defaultRequestDateTime() {
  const value = new Date(Date.now() + 24 * 60 * 60 * 1000);
  value.setMinutes(0, 0, 0);

  const offsetMs = value.getTimezoneOffset() * 60_000;
  return new Date(value.getTime() - offsetMs).toISOString().slice(0, 16);
}
