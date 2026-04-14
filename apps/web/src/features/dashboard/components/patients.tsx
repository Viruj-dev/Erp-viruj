"use client";

import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  CreditCard,
  Download,
  Mail,
  Phone,
  Share2,
  UserPlus,
  Wind,
} from "lucide-react";
import { patients } from "@/features/dashboard/components/data";

export function ErpDemoPatients() {
  const [selectedPatientId, setSelectedPatientId] = useState(
    patients[0]?.id ?? ""
  );
  const selectedPatient =
    patients.find((patient) => patient.id === selectedPatientId) ?? patients[0];

  if (!selectedPatient) {
    return null;
  }

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-on-surface-variant">
            Patient longitudinal record
          </p>
          <h2 className="mt-3 font-headline text-3xl font-black text-on-surface">
            2,482 patient entries in this demo workspace
          </h2>
        </div>
        <div className="flex gap-3">
          <button
            className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-primary hover:bg-primary/6"
            type="button"
          >
            <Download size={16} />
            Export Report
          </button>
          <button
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-md"
            type="button"
          >
            <UserPlus size={16} />
            Add Patient
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <aside className="rounded-[2rem] border border-outline-variant/25 bg-surface-container-lowest shadow-sm">
          <div className="border-b border-outline-variant/20 px-5 py-4">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-on-surface-variant">
              Recent records
            </p>
          </div>
          <div className="max-h-[780px] divide-y divide-outline-variant/12 overflow-y-auto">
            {patients.map((patient) => (
              <button
                key={patient.id}
                className={`flex w-full items-start gap-4 px-5 py-4 text-left transition-colors ${
                  patient.id === selectedPatient.id
                    ? "bg-surface-container-low"
                    : "hover:bg-surface-container-low"
                }`}
                onClick={() => setSelectedPatientId(patient.id)}
                type="button"
              >
                {patient.avatar ? (
                  <img
                    alt={patient.name}
                    className="h-12 w-12 rounded-2xl object-cover"
                    src={patient.avatar}
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 font-headline text-lg font-black text-primary">
                    {getInitials(patient.name)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-on-surface">
                    {patient.name}
                  </p>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    {patient.id}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                    patient.status === "Critical"
                      ? "bg-error-container text-error"
                      : "bg-secondary-container/45 text-secondary"
                  }`}
                >
                  {patient.status}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <div className="space-y-6">
          <section className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
            <div className="rounded-[2rem] border border-outline-variant/25 bg-surface-container-lowest p-6 shadow-sm">
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="flex h-24 w-24 items-center justify-center rounded-[1.6rem] bg-primary font-headline text-3xl font-black text-white shadow-lg">
                  {getInitials(selectedPatient.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="font-headline text-3xl font-black text-on-surface">
                        {selectedPatient.name}
                      </h3>
                      <p className="mt-2 text-sm text-on-surface-variant">
                        {selectedPatient.gender} | {selectedPatient.age} years |{" "}
                        {selectedPatient.bloodGroup}
                      </p>
                    </div>
                    <button
                      className="flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-2 text-sm font-bold text-on-surface"
                      type="button"
                    >
                      <Share2 size={16} />
                      Share Profile
                    </button>
                  </div>
                  <div className="mt-6 grid gap-3 md:grid-cols-2">
                    <ContactRow
                      icon={<Phone size={16} />}
                      text={selectedPatient.phone}
                    />
                    <ContactRow
                      icon={<Mail size={16} />}
                      text={selectedPatient.email}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-error/15 bg-error-container/45 p-6">
              <div className="flex items-center gap-2 text-error">
                <AlertTriangle size={18} />
                <p className="text-[11px] font-black uppercase tracking-[0.24em]">
                  Critical alerts
                </p>
              </div>
              <div className="mt-5 space-y-3">
                <AlertCard
                  body="Severe anaphylactic risk"
                  title="Penicillin allergy"
                />
                <AlertCard
                  body="Last A1C: 7.8% (elevated)"
                  title="Type 2 diabetes"
                />
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-outline-variant/25 bg-surface-container-lowest p-6 shadow-sm">
            <div className="grid gap-8 xl:grid-cols-2">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-headline text-2xl font-black text-on-surface">
                    Chronic conditions
                  </h4>
                  <button
                    className="text-xs font-black uppercase tracking-[0.2em] text-primary"
                    type="button"
                  >
                    Full history
                  </button>
                </div>
                <div className="mt-6 space-y-4">
                  {selectedPatient.conditions.map((condition) => (
                    <div
                      key={condition.id}
                      className="flex gap-4 rounded-[1.25rem] bg-surface-container-low p-4"
                    >
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                          condition.type === "cardio"
                            ? "bg-primary/10 text-primary"
                            : "bg-secondary/10 text-secondary"
                        }`}
                      >
                        {condition.type === "cardio" ? (
                          <Activity size={18} />
                        ) : (
                          <Wind size={18} />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface">
                          {condition.name}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                          {condition.notes}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-headline text-2xl font-black text-on-surface">
                    Care timeline
                  </h4>
                  <button
                    className="text-xs font-black uppercase tracking-[0.2em] text-primary"
                    type="button"
                  >
                    Schedule new
                  </button>
                </div>
                <div className="relative mt-6 space-y-8 border-l border-outline-variant/30 pl-6">
                  {selectedPatient.timeline.map((event) => (
                    <div key={event.id} className="relative">
                      <span
                        className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full border-4 border-white ${
                          event.type === "upcoming"
                            ? "bg-primary"
                            : "bg-outline"
                        }`}
                      />
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">
                        {event.type === "upcoming" ? "Upcoming - " : ""}
                        {event.date}
                      </p>
                      <p className="mt-2 font-semibold text-on-surface">
                        {event.title}
                      </p>
                      <p className="mt-1 text-sm text-on-surface-variant">
                        {event.doctor} | {event.location}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-outline-variant/25 bg-surface-container-lowest p-6 shadow-sm">
              <h4 className="flex items-center gap-2 font-headline text-xl font-black text-on-surface">
                <Activity className="text-primary" size={18} />
                Latest vitals
              </h4>
              <div className="mt-5 grid grid-cols-3 gap-4">
                <VitalCard
                  label="BPM"
                  status="Normal"
                  value={`${selectedPatient.vitals.bpm}`}
                />
                <VitalCard
                  label="BP"
                  status="Stable"
                  value={selectedPatient.vitals.bp}
                />
                <VitalCard
                  label="SpO2"
                  status="Ideal"
                  value={`${selectedPatient.vitals.spo2}%`}
                />
              </div>
            </div>

            <div className="rounded-[2rem] border border-outline-variant/25 bg-surface-container-lowest p-6 shadow-sm">
              <h4 className="font-headline text-xl font-black text-on-surface">
                Insurance policy
              </h4>
              <p className="mt-2 text-sm text-on-surface-variant">
                {selectedPatient.insurance.provider} |{" "}
                {selectedPatient.insurance.policyNumber}
              </p>
              <div className="mt-6 flex items-center justify-between rounded-[1.25rem] bg-surface-container-low p-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-on-surface-variant">
                    Coverage
                  </p>
                  <p className="mt-2 font-semibold text-on-surface">
                    {selectedPatient.insurance.status}
                  </p>
                </div>
                <div className="flex h-14 w-20 items-center justify-center rounded-xl border border-dashed border-outline-variant/40 bg-white">
                  <CreditCard className="text-outline" size={24} />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

function ContactRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface">
      <span className="text-outline">{icon}</span>
      {text}
    </div>
  );
}

function AlertCard({ body, title }: { body: string; title: string }) {
  return (
    <div className="rounded-[1.25rem] bg-white/70 p-4">
      <p className="font-semibold text-error">{title}</p>
      <p className="mt-1 text-sm text-on-surface-variant">{body}</p>
    </div>
  );
}

function VitalCard({
  label,
  status,
  value,
}: {
  label: string;
  status: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.2rem] bg-surface-container-low p-4 text-center">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
        {label}
      </p>
      <p className="mt-2 font-headline text-2xl font-black text-on-surface">
        {value}
      </p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-secondary">
        {status}
      </p>
    </div>
  );
}
