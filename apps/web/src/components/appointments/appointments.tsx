"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCheck,
  Clock3,
  FileText,
  MapPin,
  Phone,
  Search,
  Sparkles,
  Stethoscope,
  TimerReset,
  UserRound,
  Video,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

type Tab = "today" | "upcoming" | "history";
type Status =
  | "checked-in"
  | "confirmed"
  | "pending"
  | "completed"
  | "cancelled";
type Mode = "In-person" | "Video" | "Follow-up";

type Appointment = {
  id: number;
  patient: string;
  service: string;
  doctor: string;
  department: string;
  time: string;
  dateLabel: string;
  dateNumber: string;
  duration: string;
  mode: Mode;
  status: Status;
  location: string;
  phone: string;
  notes: string;
  pulse: string;
  wait: string;
};

const appointmentData: Record<Tab, Appointment[]> = {
  today: [
    {
      id: 1,
      patient: "Aarav Khanna",
      service: "Cardiac review",
      doctor: "Dr. Meera Sethi",
      department: "Cardiology",
      time: "09:30",
      dateLabel: "Today",
      dateNumber: "14",
      duration: "25 min",
      mode: "In-person",
      status: "checked-in",
      location: "Tower A, Cabin 04",
      phone: "+91 98112 44567",
      notes: "Repeat ECG and compare with last visit before consultation.",
      pulse: "92 bpm",
      wait: "Patient arrived",
    },
    {
      id: 2,
      patient: "Nisha Arora",
      service: "Post-op follow-up",
      doctor: "Dr. Rohan Gupta",
      department: "Orthopedics",
      time: "11:10",
      dateLabel: "Today",
      dateNumber: "14",
      duration: "20 min",
      mode: "Follow-up",
      status: "confirmed",
      location: "Recovery Wing, Room 12",
      phone: "+91 98990 11425",
      notes: "Review mobility progress and pain score after discharge.",
      pulse: "Stable",
      wait: "12 min",
    },
    {
      id: 3,
      patient: "Kabir Jain",
      service: "Dermatology consult",
      doctor: "Dr. Aditi Rana",
      department: "Dermatology",
      time: "13:45",
      dateLabel: "Today",
      dateNumber: "14",
      duration: "30 min",
      mode: "Video",
      status: "pending",
      location: "Virtual room 03",
      phone: "+91 98201 77881",
      notes: "Upload fresh lesion photos before the video session begins.",
      pulse: "Awaiting intake",
      wait: "Starts in 56 min",
    },
  ],
  upcoming: [
    {
      id: 4,
      patient: "Sana Verma",
      service: "ENT screening",
      doctor: "Dr. Vivek Menon",
      department: "ENT",
      time: "10:20",
      dateLabel: "Mon",
      dateNumber: "16",
      duration: "15 min",
      mode: "In-person",
      status: "confirmed",
      location: "Clinic 2B",
      phone: "+91 98100 30312",
      notes: "Carry audiometry report from previous consultation.",
      pulse: "Pre-screened",
      wait: "2 days",
    },
    {
      id: 5,
      patient: "Ritu Bansal",
      service: "Prenatal consult",
      doctor: "Dr. Kavya Suri",
      department: "Gynecology",
      time: "14:00",
      dateLabel: "Tue",
      dateNumber: "17",
      duration: "40 min",
      mode: "In-person",
      status: "confirmed",
      location: "Women's Care, Floor 3",
      phone: "+91 98117 55092",
      notes: "Bloodwork reviewed, ultrasound slot reserved afterwards.",
      pulse: "Priority case",
      wait: "3 days",
    },
    {
      id: 6,
      patient: "Dev Malhotra",
      service: "Neurology review",
      doctor: "Dr. Parth Anand",
      department: "Neurology",
      time: "17:30",
      dateLabel: "Thu",
      dateNumber: "19",
      duration: "25 min",
      mode: "Video",
      status: "pending",
      location: "Remote consult",
      phone: "+91 98730 66842",
      notes: "Medication log still missing from patient profile.",
      pulse: "Needs prep",
      wait: "5 days",
    },
  ],
  history: [
    {
      id: 7,
      patient: "Ishita Rao",
      service: "Lab review",
      doctor: "Dr. Manav Goyal",
      department: "Internal Medicine",
      time: "15:10",
      dateLabel: "Wed",
      dateNumber: "11",
      duration: "18 min",
      mode: "Follow-up",
      status: "completed",
      location: "OPD 6",
      phone: "+91 98118 22411",
      notes: "Report shared and next refill scheduled.",
      pulse: "Closed",
      wait: "Done",
    },
    {
      id: 8,
      patient: "Raghav Bedi",
      service: "MRI consult",
      doctor: "Dr. Simran Kohli",
      department: "Radiology",
      time: "08:40",
      dateLabel: "Tue",
      dateNumber: "10",
      duration: "35 min",
      mode: "In-person",
      status: "cancelled",
      location: "Imaging Block",
      phone: "+91 98222 91818",
      notes: "Cancelled due to patient rescheduling request.",
      pulse: "Rebook needed",
      wait: "Closed",
    },
  ],
};

const tabs: { id: Tab; label: string; hint: string }[] = [
  { id: "today", label: "Live board", hint: "Current flow" },
  { id: "upcoming", label: "Upcoming", hint: "Next 7 days" },
  { id: "history", label: "History", hint: "Completed and cancelled" },
];

const statusStyles: Record<Status, string> = {
  "checked-in": "bg-cyan-400/12 text-cyan-300 border-cyan-400/30",
  confirmed: "bg-emerald-400/12 text-emerald-300 border-emerald-400/30",
  pending: "bg-amber-400/12 text-amber-300 border-amber-400/30",
  completed: "bg-slate-300/10 text-slate-200 border-slate-300/20",
  cancelled: "bg-rose-400/12 text-rose-300 border-rose-400/30",
};

const modeIcons = {
  "In-person": MapPin,
  Video: Video,
  "Follow-up": TimerReset,
} satisfies Record<Mode, typeof MapPin>;

const boardStats = [
  {
    label: "Live queue",
    value: "18",
    note: "5 patients checked in",
    icon: Activity,
    accent: "from-cyan-400/30 via-sky-400/10 to-transparent",
    iconClass: "text-cyan-300 bg-cyan-400/12",
  },
  {
    label: "Avg wait time",
    value: "12m",
    note: "2 min faster than yesterday",
    icon: Clock3,
    accent: "from-amber-400/30 via-amber-400/10 to-transparent",
    iconClass: "text-amber-300 bg-amber-400/12",
  },
  {
    label: "Video consults",
    value: "06",
    note: "All links generated",
    icon: Video,
    accent: "from-violet-400/30 via-violet-400/10 to-transparent",
    iconClass: "text-violet-300 bg-violet-400/12",
  },
  {
    label: "Follow-ups",
    value: "09",
    note: "3 need report upload",
    icon: FileText,
    accent: "from-emerald-400/30 via-emerald-400/10 to-transparent",
    iconClass: "text-emerald-300 bg-emerald-400/12",
  },
];

export function Appointments() {
  const [activeTab, setActiveTab] = useState<Tab>("today");
  const [query, setQuery] = useState("");

  const appointments = appointmentData[activeTab];

  const filteredAppointments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return appointments;
    }

    return appointments.filter((appointment) => {
      return (
        appointment.patient.toLowerCase().includes(normalizedQuery) ||
        appointment.service.toLowerCase().includes(normalizedQuery) ||
        appointment.department.toLowerCase().includes(normalizedQuery) ||
        appointment.doctor.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [appointments, query]);

  const selectedAppointment =
    filteredAppointments[0] ?? appointments[0] ?? appointmentData.today[0];

  const statusCount = filteredAppointments.reduce<Record<Status, number>>(
    (accumulator, appointment) => {
      accumulator[appointment.status] += 1;
      return accumulator;
    },
    {
      "checked-in": 0,
      confirmed: 0,
      pending: 0,
      completed: 0,
      cancelled: 0,
    }
  );

  return (
    <div className="min-w-0 space-y-6 animate-in">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="surface-panel relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,rgba(120,53,15,0.56),rgba(15,23,42,0.9)_42%,rgba(8,47,73,0.7))] p-6 md:p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_38%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.16),_transparent_34%)]" />
        <div className="absolute -right-16 top-6 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" />
              Appointment command center
            </div>
            <h1 className="mt-4 max-w-2xl text-3xl font-black tracking-tight text-white md:text-5xl">
              Keep the queue moving, the staff aligned, and every patient update
              visible.
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
              This board brings live triage, upcoming appointments, and the
              selected patient context into one place so the front desk and
              doctors are not jumping between screens.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:w-[420px]">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 backdrop-blur">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Checked in
              </p>
              <p className="mt-2 text-3xl font-black text-white">
                {statusCount["checked-in"]}
              </p>
              <p className="text-xs text-slate-400">
                Patients ready for consult
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 backdrop-blur">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Confirmed
              </p>
              <p className="mt-2 text-3xl font-black text-white">
                {statusCount.confirmed}
              </p>
              <p className="text-xs text-slate-400">Stable appointment slots</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 backdrop-blur">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Attention
              </p>
              <p className="mt-2 text-3xl font-black text-white">
                {statusCount.pending + statusCount.cancelled}
              </p>
              <p className="text-xs text-slate-400">
                Pending or reschedule cases
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {boardStats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.article
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.35 }}
              className="surface-panel group relative overflow-hidden rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(41,37,36,0.82),rgba(15,23,42,0.74))] p-5"
            >
              <div
                className={cn(
                  "absolute inset-x-0 top-0 h-24 bg-gradient-to-br",
                  stat.accent
                )}
              />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-4xl font-black text-white">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110",
                    stat.iconClass
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="relative mt-4 text-sm text-slate-300">
                {stat.note}
              </p>
            </motion.article>
          );
        })}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <section className="surface-panel min-w-0 overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,rgba(28,25,23,0.84),rgba(15,23,42,0.72))]">
          <div className="border-b border-white/5 p-5 md:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-left transition-all duration-300",
                      activeTab === tab.id
                        ? "border-cyan-400/30 bg-cyan-400/10 shadow-[0_16px_40px_rgba(14,165,233,0.16)]"
                        : "border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.06]"
                    )}
                  >
                    <div className="text-sm font-bold text-white">
                      {tab.label}
                    </div>
                    <div className="text-xs text-slate-400">{tab.hint}</div>
                  </button>
                ))}
              </div>

              <label className="relative block w-full xl:w-72">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search patient, doctor, service"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/40 py-3 pl-11 pr-4 text-sm text-slate-100 outline-none transition focus:border-cyan-400/40"
                />
              </label>
            </div>
          </div>

          <div className="p-5 md:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Queue timeline</h2>
                <p className="text-sm text-slate-400">
                  {filteredAppointments.length} appointment
                  {filteredAppointments.length === 1 ? "" : "s"} visible in this
                  view
                </p>
              </div>
              <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-300 transition hover:bg-white/[0.08]">
                New booking
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + query}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
                className="space-y-4"
              >
                {filteredAppointments.length === 0 ? (
                  <div className="rounded-[1.75rem] border border-dashed border-white/12 bg-white/[0.03] px-5 py-14 text-center">
                    <p className="text-lg font-semibold text-white">
                      No appointments match this search.
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      Try a patient name, department, or doctor to refine the
                      board.
                    </p>
                  </div>
                ) : (
                  filteredAppointments.map((appointment, index) => {
                    const ModeIcon = modeIcons[appointment.mode];

                    return (
                      <motion.article
                        key={appointment.id}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.24 }}
                        className="group grid min-w-0 gap-4 rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-4 transition-all hover:border-cyan-400/20 hover:bg-white/[0.05] md:grid-cols-[88px_minmax(0,1fr)_auto]"
                      >
                        <div className="rounded-[1.5rem] border border-white/8 bg-slate-950/45 p-4 text-center">
                          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                            {appointment.dateLabel}
                          </p>
                          <p className="mt-2 text-3xl font-black text-white">
                            {appointment.dateNumber}
                          </p>
                          <div className="mt-3 inline-flex rounded-full bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-300">
                            {appointment.time}
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-lg font-bold text-white">
                                  {appointment.patient}
                                </h3>
                                <span
                                  className={cn(
                                    "rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
                                    statusStyles[appointment.status]
                                  )}
                                >
                                  {appointment.status}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-slate-300">
                                {appointment.service} with {appointment.doctor}
                              </p>
                            </div>

                            <div className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-slate-300">
                              {appointment.duration}
                            </div>
                          </div>

                          <div className="mt-4 grid gap-3 text-sm text-slate-400 md:grid-cols-3">
                            <div className="flex items-center gap-2 rounded-2xl bg-white/[0.03] px-3 py-2">
                              <Stethoscope className="h-4 w-4 text-cyan-300" />
                              <span>{appointment.department}</span>
                            </div>
                            <div className="flex items-center gap-2 rounded-2xl bg-white/[0.03] px-3 py-2">
                              <ModeIcon className="h-4 w-4 text-emerald-300" />
                              <span>{appointment.mode}</span>
                            </div>
                            <div className="flex items-center gap-2 rounded-2xl bg-white/[0.03] px-3 py-2">
                              <Clock3 className="h-4 w-4 text-amber-300" />
                              <span>{appointment.wait}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 md:w-40">
                          <button className="rounded-2xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400">
                            Open chart
                          </button>
                          <button className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]">
                            Reschedule
                          </button>
                        </div>
                      </motion.article>
                    );
                  })
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        <div className="space-y-6">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35 }}
            className="surface-panel min-w-0 overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,rgba(12,74,110,0.3),rgba(15,23,42,0.76))]"
          >
            <div className="border-b border-white/5 p-5 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    Selected patient
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-white">
                    {selectedAppointment.patient}
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                  <UserRound className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="space-y-5 p-5 md:p-6">
              <div className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(135deg,rgba(14,165,233,0.12),rgba(15,23,42,0.4))] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-cyan-200">
                      {selectedAppointment.service}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                      {selectedAppointment.time} •{" "}
                      {selectedAppointment.duration}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
                      statusStyles[selectedAppointment.status]
                    )}
                  >
                    {selectedAppointment.status}
                  </span>
                </div>
                <p className="mt-4 text-sm text-slate-300">
                  {selectedAppointment.notes}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.5rem] bg-white/[0.03] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Contact
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-200">
                    <Phone className="h-4 w-4 text-emerald-300" />
                    {selectedAppointment.phone}
                  </div>
                </div>
                <div className="rounded-[1.5rem] bg-white/[0.03] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Location
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-200">
                    <MapPin className="h-4 w-4 text-cyan-300" />
                    {selectedAppointment.location}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Doctor
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {selectedAppointment.doctor}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Department
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {selectedAppointment.department}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Intake status
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {selectedAppointment.pulse}
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                <button className="flex items-center justify-between rounded-[1.4rem] border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-200 transition hover:bg-emerald-400/15">
                  Confirm arrival and notify doctor
                  <CheckCheck className="h-4 w-4" />
                </button>
                <button className="flex items-center justify-between rounded-[1.4rem] border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm font-bold text-amber-200 transition hover:bg-amber-400/15">
                  Shift slot by 15 minutes
                  <CalendarDays className="h-4 w-4" />
                </button>
                <button className="flex items-center justify-between rounded-[1.4rem] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm font-bold text-rose-200 transition hover:bg-rose-400/15">
                  Cancel or move to next available slot
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.35 }}
            className="surface-panel rounded-[2rem] bg-[linear-gradient(180deg,rgba(68,64,60,0.6),rgba(15,23,42,0.72))] p-5 md:p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Daily pulse
                </p>
                <h3 className="mt-2 text-xl font-black text-white">
                  Operational highlights
                </h3>
              </div>
              <div className="rounded-2xl bg-white/[0.03] p-3 text-slate-300">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {[
                "Three cardiology appointments are clustered between 09:30 and 11:30.",
                "One video consult still needs patient pre-upload confirmation.",
                "Follow-up visits are trending shorter than the planned schedule.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-300"
                >
                  {item}
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
