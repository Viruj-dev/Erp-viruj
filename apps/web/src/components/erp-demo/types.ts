export type ErpDemoPage =
  | "dashboard"
  | "appointments"
  | "patients"
  | "staff"
  | "community"
  | "analytics"
  | "settings";

export interface PatientCondition {
  id: string;
  name: string;
  notes: string;
  type: "cardio" | "respiratory" | "general";
}

export interface PatientTimelineEvent {
  id: string;
  date: string;
  title: string;
  doctor: string;
  location: string;
  type: "upcoming" | "past";
}

export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  bloodGroup: string;
  email: string;
  phone: string;
  status: "Critical" | "Stable" | "Recovered";
  lastVisit: string;
  conditions: PatientCondition[];
  timeline: PatientTimelineEvent[];
  vitals: {
    bpm: number;
    bp: string;
    spo2: number;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    status: "Active" | "Inactive";
  };
  avatar?: string;
}

export interface AppointmentRecord {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  status: "Confirmed" | "Pending" | "Checked In" | "Completed" | "Cancelled";
  doctor: string;
  department: string;
  patientAvatar?: string;
  notes?: string;
}
