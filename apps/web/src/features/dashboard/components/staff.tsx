"use client";

import { useState } from "react";
import {
  Award,
  Briefcase,
  Mail,
  Phone,
  UserPlus,
  Users,
  X,
} from "lucide-react";

const staffMembers = [
  {
    id: "ST-001",
    name: "Dr. Sarah Mitchell",
    role: "Senior Cardiologist",
    department: "Cardiology",
    status: "active",
    email: "s.mitchell@viruj.health",
    phone: "+1 (555) 012-3456",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71f1536780?w=400&h=400&fit=crop",
    patients: 124,
    rating: 4.9,
    schedule: "Mon - Fri, 09:00 - 17:00",
    specializations: ["Interventional Cardiology", "Heart Failure"],
    experience: "12 years",
    bio: "Specializes in complex cardiovascular procedures with a strong focus on minimally invasive workflows.",
  },
  {
    id: "ST-002",
    name: "Dr. James Wilson",
    role: "Neurologist",
    department: "Neurology",
    status: "active",
    email: "j.wilson@viruj.health",
    phone: "+1 (555) 012-3457",
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop",
    patients: 89,
    rating: 4.8,
    schedule: "Tue - Sat, 08:00 - 16:00",
    specializations: ["Neuro-oncology", "Epilepsy"],
    experience: "8 years",
    bio: "Leads AI-assisted neurological diagnostics and collaborates on multi-center epilepsy studies.",
  },
  {
    id: "ST-003",
    name: "Nurse Elena Rodriguez",
    role: "Head Nurse",
    department: "Emergency",
    status: "on-leave",
    email: "e.rodriguez@viruj.health",
    phone: "+1 (555) 012-3458",
    image:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop",
    patients: 210,
    rating: 4.95,
    schedule: "Rotating shifts",
    specializations: ["Critical Care", "Trauma Management"],
    experience: "15 years",
    bio: "Coordinates emergency response and trauma escalation across the main facility and satellite units.",
  },
  {
    id: "ST-004",
    name: "Dr. Michael Chen",
    role: "Pediatrician",
    department: "Pediatrics",
    status: "active",
    email: "m.chen@viruj.health",
    phone: "+1 (555) 012-3459",
    image:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop",
    patients: 156,
    rating: 4.7,
    schedule: "Mon - Thu, 10:00 - 18:00",
    specializations: ["Neonatal Care", "Developmental Pediatrics"],
    experience: "6 years",
    bio: "Focuses on preventive pediatric care and developmental follow-up programs.",
  },
];

export function ErpDemoStaff() {
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(
    staffMembers[0]?.id ?? null
  );
  const selectedStaff =
    staffMembers.find((member) => member.id === selectedStaffId) ?? null;

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-3">
          <Badge icon={<Users size={16} />} text="124 total staff" />
          <Badge
            icon={<Award size={16} />}
            text="82 on duty"
            tone="secondary"
          />
        </div>
        <button
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-black text-white shadow-md"
          type="button"
        >
          <UserPlus size={16} />
          Add Member
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div
          className={`${selectedStaff ? "lg:col-span-8" : "lg:col-span-12"} grid gap-4 md:grid-cols-2 xl:grid-cols-3`}
        >
          {staffMembers.map((member) => (
            <button
              key={member.id}
              className={`rounded-[1.8rem] border p-5 text-left transition-all ${
                selectedStaff?.id === member.id
                  ? "border-primary bg-primary-container/10 ring-2 ring-primary/15"
                  : "border-outline-variant/20 bg-surface-container-low hover:border-primary/35 hover:shadow-lg"
              }`}
              onClick={() => setSelectedStaffId(member.id)}
              type="button"
            >
              <div className="flex items-start justify-between">
                <div className="relative">
                  <img
                    alt={member.name}
                    className="h-14 w-14 rounded-2xl object-cover"
                    src={member.image}
                  />
                  <span
                    className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
                      member.status === "active" ? "bg-secondary" : "bg-error"
                    }`}
                  />
                </div>
              </div>
              <h3 className="mt-4 font-headline text-xl font-black text-on-surface">
                {member.name}
              </h3>
              <p className="mt-1 text-xs font-black uppercase tracking-[0.2em] text-primary">
                {member.role}
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-outline-variant/20 pt-4 text-sm">
                <span className="flex items-center gap-2 text-on-surface-variant">
                  <Briefcase size={14} />
                  {member.department}
                </span>
                <span className="font-black text-on-surface">
                  {member.rating}
                </span>
              </div>
            </button>
          ))}
        </div>

        {selectedStaff ? (
          <aside className="space-y-6 lg:col-span-4">
            <div className="overflow-hidden rounded-[2rem] border border-outline-variant/20 bg-surface-container-low shadow-xl">
              <div className="relative h-32 bg-gradient-to-r from-primary to-primary-container">
                <button
                  className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white"
                  onClick={() => setSelectedStaffId(null)}
                  type="button"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="px-6 pb-6">
                <img
                  alt={selectedStaff.name}
                  className="-mt-12 h-24 w-24 rounded-[1.4rem] border-4 border-surface object-cover shadow-lg"
                  src={selectedStaff.image}
                />
                <h2 className="mt-4 font-headline text-3xl font-black text-on-surface">
                  {selectedStaff.name}
                </h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {selectedStaff.role} | {selectedStaff.id}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <ContactButton icon={<Mail size={16} />} label="Email" />
                  <ContactButton icon={<Phone size={16} />} label="Call" />
                </div>

                <div className="mt-8 space-y-6">
                  <DetailBlock
                    title="Professional bio"
                    value={selectedStaff.bio}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <SmallStat
                      label="Patients"
                      value={`${selectedStaff.patients}`}
                    />
                    <SmallStat
                      label="Experience"
                      value={selectedStaff.experience}
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-on-surface-variant">
                      Specializations
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedStaff.specializations.map((specialization) => (
                        <span
                          key={specialization}
                          className="rounded-full border border-secondary/20 bg-secondary-container/35 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-secondary"
                        >
                          {specialization}
                        </span>
                      ))}
                    </div>
                  </div>
                  <SmallStat label="Schedule" value={selectedStaff.schedule} />
                </div>
              </div>
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}

function Badge({
  icon,
  text,
  tone = "primary",
}: {
  icon: React.ReactNode;
  text: string;
  tone?: "primary" | "secondary";
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-black ${
        tone === "primary"
          ? "border-outline-variant/20 bg-surface-container-low text-on-surface"
          : "border-secondary/15 bg-secondary-container/35 text-secondary"
      }`}
    >
      {icon}
      {text}
    </div>
  );
}

function ContactButton({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      className="flex items-center justify-center gap-2 rounded-xl bg-surface-container-high px-4 py-3 text-sm font-black text-on-surface"
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

function DetailBlock({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-on-surface-variant">
        {title}
      </p>
      <p className="mt-3 text-sm leading-7 text-on-surface-variant">{value}</p>
    </div>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.2rem] border border-outline-variant/15 bg-surface-container-lowest p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-on-surface">{value}</p>
    </div>
  );
}
