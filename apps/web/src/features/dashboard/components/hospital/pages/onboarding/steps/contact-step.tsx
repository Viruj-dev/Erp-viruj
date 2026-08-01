import { TextField } from "../fields";
import type { OnboardingState } from "../types";

export function ContactStep({
  data,
  updateProfile,
}: {
  data: OnboardingState;
  updateProfile: (key: keyof OnboardingState["profile"], value: string) => void;
}) {
  return (
    <section className="grid gap-4 rounded-[26px] border border-slate-200/80 bg-white/78 p-5 shadow-sm md:grid-cols-2 dark:border-white/[0.10] dark:bg-white/[0.055]">
      <TextField
        label="Primary Mobile"
        onChange={(value) => updateProfile("phone", value)}
        placeholder="+91 98765 43210"
        value={data.profile.phone}
      />
      <TextField
        label="Alternate Mobile"
        onChange={(value) => updateProfile("alternateMobile", value)}
        placeholder="+91 98765 43211"
        value={data.profile.alternateMobile}
      />
      <TextField
        label="Email"
        onChange={(value) => updateProfile("email", value)}
        placeholder="care@clinic.co"
        type="email"
        value={data.profile.email}
      />
      <TextField
        label="Website"
        onChange={(value) => updateProfile("website", value)}
        placeholder="https://clinic.co"
        value={data.profile.website}
      />
      <TextField
        label="Emergency Contact"
        onChange={(value) => updateProfile("emergencyContact", value)}
        placeholder="+91 98765 43212"
        value={data.profile.emergencyContact}
      />
      <TextField
        label="WhatsApp Number"
        onChange={(value) => updateProfile("whatsappNumber", value)}
        placeholder="+91 98765 43210"
        value={data.profile.whatsappNumber}
      />
    </section>
  );
}
