"use client";

import { useState } from "react";
import {
  Bell,
  Camera,
  CheckCircle2,
  CreditCard,
  Database,
  HelpCircle,
  Save,
  Shield,
  Trash2,
  User,
} from "lucide-react";

const tabs = [
  {
    id: "profile",
    label: "Profile Settings",
    description: "Personal information and clinical identity",
    icon: User,
  },
  {
    id: "security",
    label: "Security & Access",
    description: "Password, 2FA, and institutional keys",
    icon: Shield,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Alerts, reminders, and system updates",
    icon: Bell,
  },
  {
    id: "billing",
    label: "Billing & Plans",
    description: "Subscription and institutional billing",
    icon: CreditCard,
  },
  {
    id: "data",
    label: "Data Management",
    description: "Exports, backups, and storage",
    icon: Database,
  },
  {
    id: "support",
    label: "Support & Help",
    description: "Documentation and direct support",
    icon: HelpCircle,
  },
] as const;

export function ErpDemoSettings({ userName }: { userName: string }) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("profile");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1200);
  };

  return (
    <div className="grid gap-8 p-6 lg:grid-cols-12 lg:p-8">
      <aside className="space-y-6 lg:col-span-4">
        <div className="rounded-[2rem] border border-outline-variant/20 bg-surface-container-low p-4">
          <div className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`flex w-full items-start gap-4 rounded-[1.2rem] px-4 py-4 text-left transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-md"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                <span className={`rounded-xl p-2 ${
                  activeTab === tab.id ? "bg-white/18" : "bg-surface-container-highest"
                }`}>
                  <tab.icon size={18} />
                </span>
                <span>
                  <span className="block text-sm font-black">{tab.label}</span>
                  <span className="mt-1 block text-xs leading-5 opacity-80">
                    {tab.description}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-error/20 bg-error-container/35 p-6">
          <p className="text-sm font-black text-error">Danger zone</p>
          <p className="mt-3 text-sm leading-7 text-on-surface-variant">
            Deleting this account would permanently remove access to the demo
            workspace and linked institution data.
          </p>
          <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-error px-4 py-3 text-sm font-black text-white shadow-md" type="button">
            <Trash2 size={16} />
            Delete Account
          </button>
        </div>
      </aside>

      <main className="lg:col-span-8">
        {activeTab === "profile" ? (
          <div className="space-y-8">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-headline text-4xl font-black text-on-surface">
                  Profile settings
                </h2>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Manage your professional clinical identity.
                </p>
              </div>
              <button className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-black text-white shadow-md disabled:opacity-60" disabled={isSaving} onClick={handleSave} type="button">
                <Save size={16} />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </header>

            <section className="space-y-8 rounded-[2rem] border border-outline-variant/20 bg-surface-container-low p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <div className="group relative">
                  <img alt="Profile" className="h-24 w-24 rounded-[1.5rem] border-4 border-surface object-cover shadow-lg" src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop" />
                  <button className="absolute inset-0 flex items-center justify-center rounded-[1.5rem] bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100" type="button">
                    <Camera size={20} />
                  </button>
                </div>
                <div>
                  <h3 className="font-headline text-2xl font-black text-on-surface">Profile photo</h3>
                  <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                    Update your image so colleagues can identify you quickly across the
                    dashboard, community feed, and workflow views.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Field defaultValue={userName || "Dr. Sarah Mitchell"} label="Full Name" />
                <Field defaultValue="Senior Cardiologist" label="Professional Role" />
                <Field defaultValue="s.mitchell@viruj.health" label="Email Address" />
                <Field defaultValue="+1 (555) 012-3456" label="Phone Number" />
              </div>

              <div>
                <label className="px-1 text-[11px] font-black uppercase tracking-[0.22em] text-on-surface-variant">
                  Professional Bio
                </label>
                <textarea
                  className="mt-2 w-full resize-none rounded-xl border-none bg-surface-container-highest px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20"
                  defaultValue="Specializing in complex cardiovascular procedures with a focus on minimally invasive techniques. Lead researcher for the HeartSync initiative."
                  rows={4}
                />
              </div>

              <div className="border-t border-outline-variant/20 pt-6">
                <p className="font-headline text-2xl font-black text-on-surface">
                  Institutional verification
                </p>
                <div className="mt-4 flex flex-col gap-4 rounded-[1.5rem] border border-primary/10 bg-primary-fixed/25 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <span className="rounded-xl bg-primary/10 p-3 text-primary">
                      <Shield size={18} />
                    </span>
                    <div>
                      <p className="font-semibold text-on-surface">Verified clinician</p>
                      <p className="text-sm text-on-surface-variant">Institutional ID: VIRUJ-ST-001</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-secondary-container/45 px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-secondary">
                    <CheckCircle2 size={14} />
                    Active
                  </span>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="rounded-[2rem] border border-outline-variant/20 bg-surface-container-low p-8">
            <h2 className="font-headline text-3xl font-black text-on-surface">
              {tabs.find((tab) => tab.id === activeTab)?.label}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-on-surface-variant">
              The active shell from ERP-demo is now installed. This tab is present in
              the new UI, but only the main profile surface has been expanded with form
              content for this pass.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function Field({ defaultValue, label }: { defaultValue: string; label: string }) {
  return (
    <div>
      <label className="px-1 text-[11px] font-black uppercase tracking-[0.22em] text-on-surface-variant">
        {label}
      </label>
      <input className="mt-2 w-full rounded-xl border-none bg-surface-container-highest px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20" defaultValue={defaultValue} type="text" />
    </div>
  );
}
