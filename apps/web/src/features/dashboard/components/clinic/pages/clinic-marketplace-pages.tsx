"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ClinicGalleryBento,
  type ClinicGalleryBentoItem,
  extendedClinicGalleryItems,
} from "@/features/dashboard/components/clinic/clinic-gallery-bento";
import {
  Camera,
  CheckCircle2,
  Clock,
  Eye,
  ImagePlus,
  MapPin,
  MessageSquareReply,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import {
  type VirujHospitalGalleryInput,
  virujBackend,
} from "@/lib/viruj-backend";

const doctors = [
  ["Dr. Aditi Rao", "Dermatology", "Live", "Skin Care, Hair Consults", "18.4k", "428", "4.8"],
  ["Dr. Karan Mehta", "Orthopedics", "Live", "Joint Pain, Sports Injury", "12.2k", "301", "4.7"],
  ["Dr. Nisha Kapoor", "Fertility", "Draft", "Fertility Counselling", "8.9k", "176", "4.9"],
] as const;

const services = [
  ["Full Body Checkup", "Preventive Care", "4 doctors", "Rs 1,499", "Visible", "642"],
  ["Dental Cleaning", "Dental", "2 doctors", "Rs 799", "Visible", "388"],
  ["Skin Consultation", "Skin Care", "1 doctor", "Rs 599", "Draft", "219"],
  ["Fertility Counselling", "Fertility", "1 doctor", "Rs 999", "Visible", "174"],
] as const;

const offeringCategories = [
  "Dental",
  "Diagnostics",
  "Wellness",
  "Skin Care",
  "Fertility",
] as const;

type ClinicOffering = {
  name: string;
  description: string;
  category: string;
  doctors: string;
  price: string;
  duration: string;
  booking: string;
  visibility: string;
  featured: boolean;
  views: string;
  requests: string;
};

const offerings: ClinicOffering[] = [
  {
    name: "General Consultation",
    description: "First-line doctor consultation for common health concerns.",
    category: "General Medicine",
    doctors: "Dr. Aditi Rao",
    price: "Rs 499 - Rs 799",
    duration: "20 min",
    booking: "Online booking on",
    visibility: "Public + Search",
    featured: true,
    views: "18.4k",
    requests: "428",
  },
  {
    name: "Dental Cleaning",
    description: "Professional dental scaling and polishing for oral hygiene.",
    category: "Dental",
    doctors: "Dr. Karan Mehta, Dr. Gupta",
    price: "Rs 799",
    duration: "45 min",
    booking: "Online booking on",
    visibility: "Public + Search",
    featured: true,
    views: "12.2k",
    requests: "388",
  },
  {
    name: "ECG",
    description: "Quick heart rhythm screening with public booking support.",
    category: "Diagnostics",
    doctors: "No doctor required",
    price: "Rs 350",
    duration: "15 min",
    booking: "Request only",
    visibility: "Public profile",
    featured: true,
    views: "9.7k",
    requests: "302",
  },
  {
    name: "Fertility Assessment",
    description: "Initial fertility counselling and assessment package.",
    category: "Fertility",
    doctors: "Dr. Nisha Kapoor",
    price: "Rs 999 - Rs 1,499",
    duration: "30 min",
    booking: "Online booking on",
    visibility: "Public + Search",
    featured: false,
    views: "8.9k",
    requests: "176",
  },
];

const patients = [
  ["Riya Sharma", "+91 98765 11223", "Skin Consultation", "Viruj Marketplace", "Request Sent", "Today, 11:20 AM"],
  ["Aman Verma", "+91 99887 44551", "Full Body Checkup", "Direct Listing", "Booked", "Today, 09:45 AM"],
  ["Neha Iyer", "+91 91234 77880", "Dental Cleaning", "Viruj Marketplace", "Follow-up", "Yesterday"],
  ["Kabir Malhotra", "+91 90000 45678", "Fertility Counselling", "Doctor Profile", "Request Sent", "2 days ago"],
] as const;

const facilities = [
  "Parking",
  "Pharmacy",
  "Laboratory",
  "Wheelchair Access",
  "Insurance Accepted",
  "Waiting Area",
] as const;

const activity = [
  ["New review received", "Riya Sharma rated the clinic 5 stars.", "12 min ago"],
  ["Doctor added", "Dr. Nisha Kapoor was attached to this clinic.", "2 hours ago"],
  ["Service published", "Dental Cleaning is now visible on Viruj.", "Yesterday"],
  ["Gallery image uploaded", "Reception area photo added to public gallery.", "Yesterday"],
  ["Clinic profile updated", "Cover image and description were refreshed.", "2 days ago"],
] as const;

export function ClinicProfileManagementPage() {
  return (
    <ClinicPageShell
      eyebrow="Clinic"
      title="Profile Management"
      subtitle="Control the public clinic listing patients see across Viruj."
      actions={<PrimaryAction icon={<Eye size={16} />} label="Preview Listing" />}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-5">
          <Panel title="Basic Information" subtitle="Marketplace identity">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Clinic Name" value="Viruj Advanced Clinic" />
              <Field label="Listing Category" value="Multispeciality Clinic" />
              <Field label="Public Slug" value="viruj-advanced-clinic" />
              <Field label="Primary City" value="Mumbai" />
            </div>
          </Panel>
          <Panel title="Contact Information" subtitle="Patient-facing contact details">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Phone" value="+91 98765 43210" />
              <Field label="Email" value="hello@virujclinic.com" />
              <Field label="Website" value="virujclinic.com" />
              <Field label="Support Hours" value="9:00 AM - 8:00 PM" />
            </div>
          </Panel>
          <Panel title="Description" subtitle="The story shown on your public listing">
            <textarea
              className="min-h-32 w-full resize-none rounded-2xl border border-violet-100 bg-violet-50/70 p-4 text-sm font-medium leading-6 text-slate-700 outline-none focus:ring-2 focus:ring-violet-200 dark:border-violet-400/[0.12] dark:bg-violet-400/[0.08] dark:text-slate-200"
              defaultValue="A modern neighbourhood clinic offering trusted specialists, transparent services, and a comfortable patient experience through the Viruj marketplace."
            />
          </Panel>
          <Panel title="Media & Verification" subtitle="Logo, cover image, and registration">
            <div className="grid gap-4 md:grid-cols-3">
              <UploadTile label="Logo" />
              <UploadTile label="Cover Image" wide />
              <StatusTile label="Verification Status" value="Under Review" />
              <StatusTile label="Registration Number" value="MH-CL-2041" />
              <StatusTile label="Visibility" value="Public" />
            </div>
          </Panel>
        </section>

        <aside className="space-y-5">
          <Panel title="How patients see your clinic" subtitle="Public preview card">
            <div className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-sm dark:border-violet-400/[0.12] dark:bg-white/[0.04]">
              <div className="h-32 bg-[linear-gradient(135deg,#6d28d9,#d946ef)]" />
              <div className="p-5">
                <div className="-mt-12 flex size-20 items-center justify-center rounded-2xl bg-white text-[#6d28d9] shadow-lg ring-1 ring-violet-100 dark:bg-[#17141f] dark:ring-violet-400/[0.18]">
                  <Stethoscope size={30} />
                </div>
                <h3 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">
                  Viruj Advanced Clinic
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Multispeciality Clinic - Mumbai
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-amber-600">
                  <Star size={16} fill="currentColor" />
                  4.8 - 1,284 reviews
                </div>
                <button className="mt-5 h-11 w-full rounded-xl bg-[#6d28d9] text-sm font-semibold text-white" type="button">
                  Request Appointment
                </button>
              </div>
            </div>
          </Panel>
          <Panel title="Listing Health" subtitle="Profile completeness">
            <div className="space-y-3">
              <Progress label="Basic information" value="100%" width="100%" />
              <Progress label="Gallery" value="72%" width="72%" />
              <Progress label="Services" value="88%" width="88%" />
            </div>
          </Panel>
        </aside>
      </div>
    </ClinicPageShell>
  );
}

export function ClinicLocationsPage() {
  return (
    <ClinicPageShell eyebrow="Clinic" title="Locations" subtitle="Manage addresses and map visibility for your clinic listing." actions={<PrimaryAction icon={<Plus size={16} />} label="Add Location" />}>
      <div className="grid gap-5 xl:grid-cols-3">
        {["Bandra West", "Andheri East", "Powai"].map((location, index) => (
          <Panel key={location} title={location} subtitle={index === 0 ? "Primary listing location" : "Branch location"}>
            <div className="space-y-4 text-sm">
              <InfoLine icon={<MapPin size={16} />} label="Address" value={`${index + 12}, Healthcare Avenue, Mumbai`} />
              <InfoLine icon={<Clock size={16} />} label="Hours" value="Mon-Sat, 9:00 AM - 8:00 PM" />
              <StatusPill value={index === 2 ? "Draft" : "Visible"} />
            </div>
          </Panel>
        ))}
      </div>
    </ClinicPageShell>
  );
}

export function ClinicWorkingHoursPage() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  return (
    <ClinicPageShell eyebrow="Clinic" title="Working Hours" subtitle="Set the public availability patients see before requesting appointments.">
      <Panel title="Weekly Schedule" subtitle="Marketplace display hours">
        <div className="divide-y divide-slate-200/70 dark:divide-white/[0.07]">
          {days.map((day, index) => (
            <div className="grid gap-3 py-4 text-sm md:grid-cols-[1fr_1fr_auto]" key={day}>
              <strong className="text-slate-950 dark:text-white">{day}</strong>
              <span className="font-medium text-slate-500">{index === 6 ? "Closed" : "9:00 AM - 8:00 PM"}</span>
              <button className="rounded-lg bg-violet-50 px-3 py-2 text-xs font-semibold text-[#6d28d9] dark:bg-violet-400/[0.12] dark:text-violet-200" type="button">
                Edit
              </button>
            </div>
          ))}
        </div>
      </Panel>
    </ClinicPageShell>
  );
}

export function ClinicPatientsPage() {
  return (
    <ClinicPageShell
      actions={<PrimaryAction icon={<Users size={16} />} label="Import Patient" />}
      eyebrow="Patients"
      title="Patient List"
      subtitle="Manage patients connected to this clinic through Viruj requests and bookings."
    >
      <Toolbar placeholder="Search patients..." tabs={["All", "Booked", "Request Sent", "Follow-up"]} />
      <Panel title="Patients" subtitle="Clinic-linked patient relationships">
        <div className="overflow-hidden rounded-2xl border border-violet-100 dark:border-violet-400/[0.12]">
          <div className="grid min-w-[900px] grid-cols-[240px_160px_190px_170px_130px_150px] gap-4 bg-violet-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:bg-violet-400/[0.08]">
            <span>Patient</span>
            <span>Contact</span>
            <span>Requested Service</span>
            <span>Source</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-violet-100 dark:divide-violet-400/[0.1]">
            {patients.map((patient) => (
              <div
                className="grid min-w-[900px] grid-cols-[240px_160px_190px_170px_130px_150px] items-center gap-4 px-5 py-4 text-sm"
                key={patient[0]}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-sm font-bold text-[#6d28d9]">
                    {getInitials(patient[0])}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-950 dark:text-white">
                      {patient[0]}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-500">
                      Last activity: {patient[5]}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {patient[1]}
                </span>
                <span className="font-medium text-slate-600 dark:text-slate-400">
                  {patient[2]}
                </span>
                <span className="font-medium text-slate-600 dark:text-slate-400">
                  {patient[3]}
                </span>
                <StatusPill value={patient[4]} />
                <div className="flex justify-end gap-2">
                  <SecondaryAction label="View" />
                  <SecondaryAction label="Message" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </ClinicPageShell>
  );
}

export function ClinicDoctorsPresencePage() {
  const [doctorRows, setDoctorRows] = useState(() =>
    doctors.map((doctor) => [...doctor] as string[])
  );

  const addDoctor = () => {
    setDoctorRows((rows) => [
      ...rows,
      [
        `Dr. New Specialist ${rows.length + 1}`,
        "General Medicine",
        "Draft",
        "General Consultation",
        "0",
        "0",
        "New",
      ],
    ]);
  };

  const editDoctor = (doctorName: string) => {
    setDoctorRows((rows) =>
      rows.map((doctor) =>
        doctor[0] === doctorName
          ? [doctor[0], doctor[1], doctor[2] === "Live" ? "Needs Review" : "Live", doctor[3], doctor[4], doctor[5], doctor[6]]
          : doctor
      )
    );
  };

  const deleteDoctor = (doctorName: string) => {
    setDoctorRows((rows) => rows.filter((doctor) => doctor[0] !== doctorName));
  };

  return (
    <ClinicPageShell eyebrow="Doctors" title="Attached Doctors" subtitle="Manage doctors associated with this clinic listing." actions={<PrimaryAction icon={<Plus size={16} />} label="Add Doctor" onClick={addDoctor} />}>
      <Toolbar placeholder="Search doctors..." tabs={["All", "Live", "Draft", "Needs Review"]} />
      <Panel title="Doctor List" subtitle="Listing doctors and assigned services">
        <div className="overflow-hidden rounded-2xl border border-violet-100 dark:border-violet-400/[0.12]">
          <div className="grid min-w-[860px] grid-cols-[280px_180px_110px_minmax(220px,1fr)_190px] gap-4 bg-violet-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:bg-violet-400/[0.08]">
            <span>Doctor</span>
            <span>Specialization</span>
            <span>Status</span>
            <span>Assigned Services</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-violet-100 dark:divide-violet-400/[0.1]">
            {doctorRows.map((doctor) => (
              <div
                className="grid min-w-[860px] grid-cols-[280px_180px_110px_minmax(220px,1fr)_190px] items-center gap-4 px-5 py-4 text-sm"
                key={doctor[0]}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-sm font-bold text-[#6d28d9]">
                    {doctor[0].split(" ").at(-1)?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-950 dark:text-white">
                      {doctor[0]}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-500">
                      {doctor[4]} views - {doctor[5]} requests - {doctor[6]} rating
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {doctor[1]}
                </span>
                <StatusPill value={doctor[2]} />
                <span className="font-medium text-slate-600 dark:text-slate-400">
                  {doctor[3]}
                </span>
                <div className="flex justify-end gap-2">
                  <SecondaryAction label="Edit" onClick={() => editDoctor(doctor[0])} />
                  <SecondaryAction label="Remove" onClick={() => deleteDoctor(doctor[0])} tone="danger" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </ClinicPageShell>
  );
}

export function ClinicOfferingsPage() {
  const [offeringRows, setOfferingRows] = useState<ClinicOffering[]>(() => [
    ...offerings,
  ]);
  const featuredOfferings = offeringRows.filter((offering) => offering.featured);
  const selectedOffering = offeringRows[0] ?? offerings[0];

  const createOffering = () => {
    setOfferingRows((rows) => [
      ...rows,
      {
        name: `New Offering ${rows.length + 1}`,
        description: "Public-facing service description for Viruj patients.",
        category: "Wellness",
        doctors: "No doctor required",
        price: "Rs 499",
        duration: "20 min",
        booking: "Online booking on",
        visibility: "Public + Search",
        featured: false,
        views: "0",
        requests: "0",
      },
    ]);
  };

  const editOffering = (offeringName: string) => {
    setOfferingRows((rows) =>
      rows.map((offering) =>
        offering.name === offeringName
          ? {
              ...offering,
              featured: !offering.featured,
              visibility:
                offering.visibility === "Public + Search"
                  ? "Public profile"
                  : "Public + Search",
            }
          : offering
      )
    );
  };

  const deleteOffering = (offeringName: string) => {
    setOfferingRows((rows) =>
      rows.filter((offering) => offering.name !== offeringName)
    );
  };

  return (
    <ClinicPageShell
      actions={<PrimaryAction icon={<Plus size={16} />} label="Create Offering" onClick={createOffering} />}
      eyebrow="Clinic Offerings"
      title="Services & Facilities Catalog"
      subtitle="Build the public storefront patients see on Viruj clinic pages, search, discovery, doctor profiles, and booking flows."
    >
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <Toolbar
            placeholder="Search offerings..."
            tabs={["All", "Featured", "Online Booking", "Visible", "Draft"]}
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Total Offerings" value={offeringRows.length.toString()} />
            <KpiCard label="Active Offerings" value={offeringRows.filter((offering) => offering.visibility.includes("Public")).length.toString()} />
            <KpiCard label="Most Viewed Service" value={offeringRows[0]?.name ?? "-"} />
            <KpiCard label="Most Requested Service" value={offeringRows[1]?.name ?? "-"} />
          </div>

          <Panel title="Category Management" subtitle="Categories are clinic-created, not hardcoded">
            <div className="flex flex-wrap gap-2">
              {offeringCategories.map((category) => (
                <span
                  className="rounded-full bg-violet-50 px-4 py-2 text-sm font-semibold text-[#6d28d9] ring-1 ring-violet-100 dark:bg-violet-400/[0.10] dark:text-violet-200 dark:ring-violet-400/[0.14]"
                  key={category}
                >
                  {category}
                </span>
              ))}
              <button
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-violet-100 dark:bg-white/[0.06] dark:text-slate-200 dark:ring-white/[0.08]"
                type="button"
              >
                <Plus size={14} />
                Add Category
              </button>
            </div>
          </Panel>

          {offeringRows.length === 0 ? (
            <Panel title="No services added yet" subtitle="Create your first public-facing offering">
              <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl bg-violet-50 text-center dark:bg-violet-400/[0.08]">
                <Sparkles className="text-[#6d28d9]" size={42} />
                <h3 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">
                  No services added yet
                </h3>
                <p className="mt-2 max-w-sm text-sm font-medium text-slate-500">
                  Add services to power your public clinic page and service discovery.
                </p>
                <div className="mt-5">
                  <PrimaryAction icon={<Plus size={16} />} label="Create First Service" onClick={createOffering} />
                </div>
              </div>
            </Panel>
          ) : null}

          {featuredOfferings.length > 0 ? (
            <Panel title="Featured Services" subtitle="Featured items appear first on the public clinic page">
              <div className="grid gap-4 md:grid-cols-3">
                {featuredOfferings.map((offering) => (
                  <div className="rounded-2xl bg-[linear-gradient(135deg,#f5f3ff,#fae8ff)] p-4 ring-1 ring-violet-100 dark:bg-none dark:bg-violet-400/[0.10] dark:ring-violet-400/[0.14]" key={offering.name}>
                    <Sparkles className="text-[#6d28d9]" size={20} />
                    <p className="mt-3 font-bold text-slate-950 dark:text-white">{offering.name}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{offering.category}</p>
                  </div>
                ))}
              </div>
            </Panel>
          ) : null}

          <Panel title="Offerings List" subtitle="Manage the public services and facilities catalog">
            <div className="overflow-hidden rounded-2xl border border-violet-100 dark:border-violet-400/[0.12]">
              <div className="grid min-w-[1080px] grid-cols-[240px_150px_190px_130px_120px_150px_130px_160px] gap-4 bg-violet-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:bg-violet-400/[0.08]">
                <span>Offering</span>
                <span>Category</span>
                <span>Assigned Doctors</span>
                <span>Price</span>
                <span>Duration</span>
                <span>Booking</span>
                <span>Visibility</span>
                <span className="text-right">Actions</span>
              </div>
              <div className="divide-y divide-violet-100 dark:divide-violet-400/[0.1]">
                {offeringRows.map((offering) => (
                  <div
                    className="grid min-w-[1080px] grid-cols-[240px_150px_190px_130px_120px_150px_130px_160px] items-center gap-4 px-5 py-4 text-sm"
                    key={offering.name}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-bold text-slate-950 dark:text-white">
                          {offering.name}
                        </p>
                        {offering.featured ? <StatusPill value="Featured" /> : null}
                      </div>
                      <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">
                        {offering.description}
                      </p>
                    </div>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {offering.category}
                    </span>
                    <span className="font-medium text-slate-600 dark:text-slate-400">
                      {offering.doctors}
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {offering.price}
                    </span>
                    <span className="font-medium text-slate-600 dark:text-slate-400">
                      {offering.duration}
                    </span>
                    <span className="font-medium text-slate-600 dark:text-slate-400">
                      {offering.booking}
                    </span>
                    <StatusPill value={offering.visibility} />
                    <div className="flex justify-end gap-2">
                      <SecondaryAction label="Edit" onClick={() => editOffering(offering.name)} />
                      <SecondaryAction label="Delete" onClick={() => deleteOffering(offering.name)} tone="danger" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <DrawerPreview
            title="Create Offering Drawer"
            fields={[
              "Service Name",
              "Short Description",
              "Detailed Description",
              "Category",
              "Price",
              "Duration",
              "Assign Doctors",
              "Online Booking Enabled",
              "Featured Toggle",
              "Status",
              "Service Image",
            ]}
          />
        </div>

        <aside className="space-y-5">
          <Panel title="How this service appears to patients" subtitle="Mobile app preview">
            <div className="mx-auto max-w-[300px] rounded-[2rem] border border-slate-200 bg-slate-950 p-3 shadow-2xl dark:border-white/[0.08]">
              <div className="overflow-hidden rounded-[1.45rem] bg-white text-slate-950">
                <div className="h-28 bg-[linear-gradient(135deg,#6d28d9,#d946ef)] p-4 text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75">
                    Services Available
                  </p>
                  <h3 className="mt-2 text-xl font-bold">{selectedOffering.name}</h3>
                </div>
                <div className="space-y-4 p-4">
                  <p className="text-sm leading-6 text-slate-600">
                    {selectedOffering.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <PreviewChip label="Price" value={selectedOffering.price} />
                    <PreviewChip label="Duration" value={selectedOffering.duration} />
                  </div>
                  <div className="rounded-2xl bg-violet-50 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Doctor Assignment
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-950">
                      {selectedOffering.doctors}
                    </p>
                  </div>
                  <button className="h-11 w-full rounded-xl bg-[#6d28d9] text-sm font-bold text-white" type="button">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Public Visibility" subtitle="Controls supported by every offering">
            <div className="space-y-3">
              <ToggleRow label="Visible On Public Profile" value="Enabled" />
              <ToggleRow label="Visible In Search" value="Enabled" />
              <ToggleRow label="Online Booking Enabled" value="Enabled" />
              <ToggleRow label="Featured" value="Enabled" />
            </div>
          </Panel>
        </aside>
      </section>
    </ClinicPageShell>
  );
}

export function ClinicServicesPage() {
  const [serviceRows, setServiceRows] = useState(() =>
    services.map((service) => [...service] as string[])
  );

  const createService = () => {
    setServiceRows((rows) => [
      ...rows,
      [
        `New Service ${rows.length + 1}`,
        "Wellness",
        "No doctor required",
        "Rs 499",
        "Draft",
        "0",
      ],
    ]);
  };

  const editService = (serviceName: string) => {
    setServiceRows((rows) =>
      rows.map((service) =>
        service[0] === serviceName
          ? [
              service[0],
              service[1],
              service[2],
              service[3],
              service[4] === "Visible" ? "Draft" : "Visible",
              service[5],
            ]
          : service
      )
    );
  };

  const deleteService = (serviceName: string) => {
    setServiceRows((rows) =>
      rows.filter((service) => service[0] !== serviceName)
    );
  };

  return (
    <ClinicPageShell eyebrow="Services" title="Custom Services" subtitle="Create dynamic services and categories without hardcoded clinic departments." actions={<PrimaryAction icon={<Plus size={16} />} label="Create Service" onClick={createService} />}>
      <Toolbar placeholder="Search services..." tabs={["All", "Visible", "Draft", "Archived"]} />
      <Panel title="Service Catalog" subtitle="Marketplace availability">
        <div className="overflow-hidden rounded-2xl border border-violet-100 dark:border-violet-400/[0.12]">
          <div className="grid min-w-[860px] grid-cols-[220px_150px_180px_120px_110px_180px] gap-4 bg-violet-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:bg-violet-400/[0.08]">
            <span>Service</span>
            <span>Category</span>
            <span>Assigned Doctors</span>
            <span>Price</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-violet-100 dark:divide-violet-400/[0.1]">
            {serviceRows.map((service) => (
              <div
                className="grid min-w-[860px] grid-cols-[220px_150px_180px_120px_110px_180px] items-center gap-4 px-5 py-4 text-sm"
                key={service[0]}
              >
                <span className="font-bold text-slate-950 dark:text-white">
                  {service[0]}
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {service[1]}
                </span>
                <span className="font-medium text-slate-600 dark:text-slate-400">
                  {service[2]}
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {service[3]}
                </span>
                <StatusPill value={service[4]} />
                <div className="flex justify-end gap-2">
                  <SecondaryAction label="Edit" onClick={() => editService(service[0])} />
                  <SecondaryAction label="Delete" onClick={() => deleteService(service[0])} tone="danger" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Panel>
      <DrawerPreview title="Create Service" fields={["Name", "Description", "Category", "Duration", "Price", "Assign Doctors", "Online Booking"]} />
    </ClinicPageShell>
  );
}

export function ClinicFacilitiesPage() {
  return (
    <ClinicPageShell eyebrow="Facilities" title="Facility Highlights" subtitle="Show patients what is available before they visit." actions={<PrimaryAction icon={<Plus size={16} />} label="Add Facility" />}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {facilities.map((facility) => (
          <Panel key={facility} title={facility} subtitle="Visible on public profile">
            <div className="flex items-center justify-between">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-violet-50 text-[#6d28d9] dark:bg-violet-400/[0.12] dark:text-violet-200">
                <CheckCircle2 size={22} />
              </span>
              <div className="flex gap-2">
                <SecondaryAction label="Edit" />
                <button className="flex size-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-400/[0.12]" type="button">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </ClinicPageShell>
  );
}

export function ClinicGalleryPage({
  organizationId,
}: {
  organizationId?: string;
}) {
  const primaryItems = extendedClinicGalleryItems.slice(0, 5);
  const extraItems = extendedClinicGalleryItems.slice(5);
  const queryClient = useQueryClient();
  const queryKey = virujBackend.hospitalGallery.key(organizationId);
  const [localImagesById, setLocalImagesById] = useState<Record<string, string>>({});
  const [previewItem, setPreviewItem] = useState<ClinicGalleryBentoItem | null>(null);

  const galleryQuery = useQuery({
    enabled: Boolean(organizationId),
    queryFn: () => virujBackend.hospitalGallery.list({ organizationId }),
    queryKey,
  });

  const galleryItems = galleryQuery.data ?? [];
  const galleryItemByCardId = useMemo(() => {
    const records: Record<string, (typeof galleryItems)[number] | undefined> = {};

    extendedClinicGalleryItems.forEach((item, index) => {
      records[item.id] = galleryItems.find((galleryItem) => galleryItem.sortOrder === index);
    });

    return records;
  }, [galleryItems]);
  const imageUrlsById = useMemo(() => {
    const urls: Record<string, string | undefined> = {};

    extendedClinicGalleryItems.forEach((item) => {
      urls[item.id] = galleryItemByCardId[item.id]?.url;
    });

    return { ...urls, ...localImagesById };
  }, [galleryItemByCardId, localImagesById]);

  const createGalleryMutation = useMutation({
    mutationFn: (gallery: VirujHospitalGalleryInput) =>
      virujBackend.hospitalGallery.create({ gallery, organizationId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateGalleryMutation = useMutation({
    mutationFn: (input: {
      gallery: Partial<VirujHospitalGalleryInput>;
      id: string;
    }) =>
      virujBackend.hospitalGallery.update({
        gallery: input.gallery,
        id: input.id,
        organizationId,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteGalleryMutation = useMutation({
    mutationFn: (id: string) => virujBackend.hospitalGallery.delete({ id, organizationId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  function saveCardImage(item: ClinicGalleryBentoItem, file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;

      const url = reader.result;
      const sortOrder = extendedClinicGalleryItems.findIndex(
        (galleryItem) => galleryItem.id === item.id
      );
      const gallery: VirujHospitalGalleryInput = {
        altText: `${item.title} ${item.subtitle}`,
        caption: item.subtitle,
        isPublished: true,
        mediaType: "IMAGE",
        sortOrder: Math.max(sortOrder, 0),
        url,
      };

      setLocalImagesById((current) => ({ ...current, [item.id]: url }));

      if (!organizationId) return;

      const existing = galleryItemByCardId[item.id];

      if (existing) {
        updateGalleryMutation.mutate({ gallery, id: existing.id });
        return;
      }

      createGalleryMutation.mutate(gallery);
    };
    reader.readAsDataURL(file);
  }

  function deleteCardImage(item: ClinicGalleryBentoItem) {
    setLocalImagesById((current) => {
      const next = { ...current };
      delete next[item.id];
      return next;
    });

    if (previewItem?.id === item.id) {
      setPreviewItem(null);
    }

    const existing = galleryItemByCardId[item.id];
    if (existing && organizationId) {
      deleteGalleryMutation.mutate(existing.id);
    }
  }

  function previewCardImage(item: ClinicGalleryBentoItem) {
    if (!imageUrlsById[item.id]) return;
    setPreviewItem(item);
  }

  const previewUrl = previewItem ? imageUrlsById[previewItem.id] : undefined;

  return (
    <ClinicPageShell eyebrow="Gallery" title="Media Manager" subtitle="Upload, reorder, delete, preview, and choose the cover image." actions={<PrimaryAction icon={<ImagePlus size={16} />} label="Upload Images" />}>
      <ClinicGalleryBento
        actionsForItem={(item) => (
          <>
            <SecondaryAction label="Preview" onClick={() => previewCardImage(item)} />
            <SecondaryAction label="Delete" onClick={() => deleteCardImage(item)} tone="danger" />
          </>
        )}
        extraItems={extraItems}
        imageUrlsById={imageUrlsById}
        items={primaryItems}
        onImageSelected={saveCardImage}
      />

      {previewItem && previewUrl ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-6 backdrop-blur-xl backdrop-saturate-50">
          <div className="max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-900 bg-[#ececec] shadow-[6px_6px_0_0_#0f172a] dark:border-slate-200 dark:bg-[#1a1d22] dark:shadow-[6px_6px_0_0_#e2e8f0]">
            <div className="flex items-center justify-between gap-3 border-b border-slate-900 px-4 py-3 dark:border-slate-200">
              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-900 dark:text-slate-100">
                  {previewItem.title}
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {previewItem.subtitle}
                </p>
              </div>
              <button
                className="rounded-sm border border-slate-900 bg-white px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-slate-900 transition hover:bg-slate-100 dark:border-slate-200 dark:bg-slate-900 dark:text-slate-100"
                onClick={() => setPreviewItem(null)}
                type="button"
              >
                Close
              </button>
            </div>
            <div className="max-h-[76vh] overflow-auto p-4">
              <img
                alt={`${previewItem.title} ${previewItem.subtitle}`}
                className="mx-auto max-h-[70vh] w-auto max-w-full border border-slate-900 object-contain dark:border-slate-200"
                src={previewUrl}
              />
            </div>
          </div>
        </div>
      ) : null}
    </ClinicPageShell>
  );
}
export function ClinicReviewsPage() {
  const reviews = [
    ["Riya Sharma", "5.0", "Clean clinic, easy booking, and helpful doctor.", "Today"],
    ["Aman Verma", "4.0", "Good experience. Waiting area was comfortable.", "Yesterday"],
    ["Neha Iyer", "5.0", "The service list made it easy to choose a specialist.", "2 days ago"],
  ] as const;

  return (
    <ClinicPageShell eyebrow="Reviews" title="Review Management" subtitle="Track rating health and reply to patient feedback.">
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Average Rating" value="4.8" />
        <KpiCard label="Total Reviews" value="1,284" />
        <KpiCard label="Recent Reviews" value="42" />
        <KpiCard label="5-Star Share" value="86%" />
      </div>
      <Panel title="Rating Distribution" subtitle="Last 90 days">
        <div className="space-y-3">
          {["5 stars", "4 stars", "3 stars", "2 stars", "1 star"].map((label, index) => (
            <Progress key={label} label={label} value={`${[86, 9, 3, 1, 1][index]}%`} width={`${[86, 9, 3, 1, 1][index]}%`} />
          ))}
        </div>
      </Panel>
      <Panel title="Review List" subtitle="Patient-visible feedback">
        <div className="space-y-3">
          {reviews.map((review) => (
            <div className="rounded-2xl bg-violet-50/70 p-4 dark:bg-violet-400/[0.08]" key={review[0]}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-950 dark:text-white">{review[0]}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{review[2]}</p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">{review[1]} ★</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{review[3]}</span>
                <SecondaryAction icon={<MessageSquareReply size={14} />} label="Reply" />
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </ClinicPageShell>
  );
}

export function ClinicSettingsPage() {
  const tabs = ["General", "Visibility", "Booking Preferences", "Notifications", "Integrations"];
  return (
    <ClinicPageShell eyebrow="Settings" title="Marketplace Settings" subtitle="Configure how your clinic appears and receives requests on Viruj.">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab, index) => (
          <button className={index === 0 ? "h-10 rounded-xl bg-[#6d28d9] px-4 text-sm font-semibold text-white" : "h-10 rounded-xl bg-violet-50 px-4 text-sm font-semibold text-slate-600 dark:bg-violet-400/[0.10] dark:text-slate-300"} key={tab} type="button">
            {tab}
          </button>
        ))}
      </div>
      <Panel title="General" subtitle="Default marketplace controls">
        <div className="grid gap-4 md:grid-cols-2">
          <ToggleRow label="Public Visibility" value="Enabled" />
          <ToggleRow label="Online Appointment Requests" value="Enabled" />
          <ToggleRow label="Review Replies" value="Enabled" />
          <ToggleRow label="WhatsApp Notifications" value="Disabled" />
        </div>
      </Panel>
    </ClinicPageShell>
  );
}

export function ClinicPageShell({
  actions,
  children,
  eyebrow,
  subtitle,
  title,
}: {
  actions?: ReactNode;
  children: ReactNode;
  eyebrow: string;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="space-y-6 p-6 lg:p-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-500">
            {eyebrow}
          </p>
          <h1 className="mt-2 font-headline text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">
            {title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-500">
            {subtitle}
          </p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </header>
      {children}
    </div>
  );
}

function Panel({ children, subtitle, title }: { children: ReactNode; subtitle?: string; title: string }) {
  return (
    <section className="rounded-2xl border border-violet-100/80 bg-white/88 p-5 shadow-sm dark:border-violet-400/[0.12] dark:bg-[#14171b]">
      <h2 className="font-headline text-base font-semibold text-slate-950 dark:text-slate-100">{title}</h2>
      {subtitle ? <p className="mt-1 text-xs font-medium text-slate-500">{subtitle}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</span>
      <input className="h-11 w-full rounded-xl border border-violet-100 bg-violet-50/70 px-4 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-violet-200 dark:border-violet-400/[0.12] dark:bg-violet-400/[0.08] dark:text-slate-100" readOnly value={value} />
    </label>
  );
}

function PrimaryAction({
  icon,
  label,
  onClick,
}: {
  icon?: ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#6d28d9] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5b21b6]" onClick={onClick} type="button">{icon}{label}</button>;
}

function SecondaryAction({
  icon,
  label,
  onClick,
  tone,
}: {
  icon?: ReactNode;
  label: string;
  onClick?: () => void;
  tone?: "danger";
}) {
  return <button className={tone === "danger" ? "inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-rose-50 px-3 text-xs font-semibold text-rose-600 dark:bg-rose-400/[0.12]" : "inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-violet-100 dark:bg-white/[0.06] dark:text-slate-200 dark:ring-white/[0.08]"} onClick={onClick} type="button">{icon}{label}</button>;
}

function Toolbar({ placeholder, tabs }: { placeholder: string; tabs: string[] }) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-100/80 bg-white/80 p-4 shadow-sm dark:border-violet-400/[0.12] dark:bg-[#14171b]">
      <div className="relative min-w-64 flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
        <input className="h-11 w-full rounded-xl border-none bg-violet-50 pl-11 pr-4 text-sm font-semibold outline-none dark:bg-violet-400/[0.08]" placeholder={placeholder} />
      </div>
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab, index) => (
          <button className={index === 0 ? "h-9 rounded-lg bg-[#6d28d9] px-3 text-xs font-semibold text-white" : "h-9 rounded-lg bg-violet-50 px-3 text-xs font-semibold text-slate-600 dark:bg-violet-400/[0.08] dark:text-slate-300"} key={tab} type="button">{tab}</button>
        ))}
      </div>
    </section>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <section className="rounded-2xl border border-violet-100 bg-white/88 p-5 shadow-sm dark:border-violet-400/[0.12] dark:bg-[#14171b]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-3 font-headline text-3xl font-semibold text-slate-950 dark:text-white">{value}</p>
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-violet-50 p-3 dark:bg-violet-400/[0.08]"><p className="text-[10px] font-semibold uppercase text-slate-500">{label}</p><p className="mt-1 font-bold text-slate-950 dark:text-white">{value}</p></div>;
}

function StatusPill({ value }: { value: string }) {
  return <span className="w-fit rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-[#6d28d9] dark:bg-violet-400/[0.14] dark:text-violet-200">{value}</span>;
}

function InfoLine({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="flex items-start gap-3"><span className="mt-0.5 text-[#6d28d9]">{icon}</span><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{value}</p></div></div>;
}

function UploadTile({ label, wide }: { label: string; wide?: boolean }) {
  return <div className={wide ? "md:col-span-2 rounded-2xl border border-dashed border-violet-200 bg-violet-50/70 p-5 dark:border-violet-400/[0.2] dark:bg-violet-400/[0.08]" : "rounded-2xl border border-dashed border-violet-200 bg-violet-50/70 p-5 dark:border-violet-400/[0.2] dark:bg-violet-400/[0.08]"}><ImagePlus className="text-[#6d28d9]" size={22} /><p className="mt-3 font-semibold text-slate-900 dark:text-white">{label}</p><p className="mt-1 text-xs text-slate-500">Upload or replace</p></div>;
}

function StatusTile({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-violet-50/70 p-5 dark:bg-violet-400/[0.08]"><ShieldCheck className="text-[#6d28d9]" size={22} /><p className="mt-3 text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 font-bold text-slate-950 dark:text-white">{value}</p></div>;
}

function Progress({ label, value, width }: { label: string; value: string; width: string }) {
  return <div><div className="mb-2 flex justify-between text-sm"><span className="font-semibold text-slate-700 dark:text-slate-300">{label}</span><strong>{value}</strong></div><div className="h-2 rounded-full bg-violet-100 dark:bg-violet-400/[0.12]"><div className="h-2 rounded-full bg-[#6d28d9]" style={{ width }} /></div></div>;
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return <div className="overflow-hidden rounded-2xl border border-violet-100 dark:border-violet-400/[0.12]"><div className="grid min-w-[760px] grid-cols-6 gap-4 bg-violet-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:bg-violet-400/[0.08]">{headers.map((header) => <span key={header}>{header}</span>)}</div><div className="divide-y divide-violet-100 dark:divide-violet-400/[0.1]">{rows.map((row) => <div className="grid min-w-[760px] grid-cols-6 gap-4 px-5 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200" key={row[0]}>{row.map((cell) => <span key={cell}>{cell}</span>)}</div>)}</div></div>;
}

function DrawerPreview({ fields, title }: { fields: string[]; title: string }) {
  return <Panel title={title} subtitle="Drawer-based form structure"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{fields.map((field) => <div className="rounded-xl bg-violet-50 p-4 text-sm font-semibold text-slate-700 dark:bg-violet-400/[0.08] dark:text-slate-200" key={field}>{field}</div>)}</div></Panel>;
}

function ChartPanel({ title }: { title: string }) {
  return <Panel title={title} subtitle="Last 30 days"><div className="flex h-52 items-end gap-3">{[42, 68, 54, 82, 72, 96, 88, 110, 104, 128].map((height, index) => <div className="flex flex-1 items-end" key={index}><div className="w-full rounded-t-xl bg-[linear-gradient(180deg,#d946ef,#6d28d9)]" style={{ height }} /></div>)}</div></Panel>;
}

function RankedList({ items }: { items: readonly (readonly [string, string])[] }) {
  return <div className="space-y-3">{items.map((item, index) => <div className="flex items-center justify-between rounded-xl bg-violet-50 p-3 text-sm dark:bg-violet-400/[0.08]" key={item[0]}><span className="font-semibold text-slate-800 dark:text-slate-100">{index + 1}. {item[0]}</span><strong>{item[1]}</strong></div>)}</div>;
}

function OfferingCard({
  index,
  offering,
}: {
  index: number;
  offering: ClinicOffering;
}) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-violet-100 bg-white/90 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(109,40,217,0.14)] dark:border-violet-400/[0.12] dark:bg-[#14171b]">
      <div className="relative h-32 bg-[linear-gradient(135deg,#fae8ff,#fae8ff)] p-5 dark:bg-none dark:bg-violet-400/[0.10]">
        <div className="flex items-start justify-between">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-[#6d28d9] shadow-sm dark:bg-white/[0.10] dark:text-violet-200">
            {index % 2 === 0 ? <Sparkles size={22} /> : <Stethoscope size={22} />}
          </span>
          <div className="flex gap-2">
            {offering.featured ? <StatusPill value="Featured" /> : null}
            <button className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-slate-600 shadow-sm dark:bg-white/[0.10] dark:text-slate-200" type="button">
              Actions
            </button>
          </div>
        </div>
        <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-xs font-bold text-[#6d28d9]">
          <span>{offering.category}</span>
          <span>{offering.visibility}</span>
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <h3 className="font-headline text-xl font-semibold text-slate-950 dark:text-white">
            {offering.name}
          </h3>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
            {offering.description}
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <MiniStat label="Assigned Doctors" value={offering.doctors} />
          <MiniStat label="Price Range" value={offering.price} />
          <MiniStat label="Duration" value={offering.duration} />
          <MiniStat label="Booking Status" value={offering.booking} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-violet-100 pt-4 dark:border-violet-400/[0.10]">
          <div className="flex gap-2">
            <StatusPill value="Public Profile" />
            <StatusPill value="Search" />
          </div>
          <p className="text-xs font-bold text-slate-500">
            {offering.views} views - {offering.requests} requests
          </p>
        </div>
      </div>
    </article>
  );
}

function PreviewChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}

function ToggleRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between rounded-2xl bg-violet-50 p-4 dark:bg-violet-400/[0.08]"><span className="font-semibold text-slate-700 dark:text-slate-200">{label}</span><span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#6d28d9] shadow-sm dark:bg-white/[0.08]">{value}</span></div>;
}

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "PT";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}



