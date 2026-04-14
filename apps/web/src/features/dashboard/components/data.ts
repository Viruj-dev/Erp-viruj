import type {
  AppointmentRecord,
  PatientRecord,
} from "@/features/dashboard/components/types";

export const weeklyBookings = [
  { name: "Mon", value: 60 },
  { name: "Tue", value: 75 },
  { name: "Wed", value: 45 },
  { name: "Thu", value: 90 },
  { name: "Fri", value: 70 },
  { name: "Sat", value: 30 },
  { name: "Sun", value: 20 },
] as const;

export const revenueTrend = [
  { month: "Jan", revenue: 45, expenses: 32 },
  { month: "Feb", revenue: 52, expenses: 34 },
  { month: "Mar", revenue: 48, expenses: 31 },
  { month: "Apr", revenue: 61, expenses: 38 },
  { month: "May", revenue: 55, expenses: 35 },
  { month: "Jun", revenue: 67, expenses: 40 },
  { month: "Jul", revenue: 72, expenses: 42 },
] as const;

export const departmentSplit = [
  { name: "Cardiology", value: 35, color: "#00478d" },
  { name: "Neurology", value: 25, color: "#006a6a" },
  { name: "Pediatrics", value: 20, color: "#154bf1" },
  { name: "Emergency", value: 15, color: "#ba1a1a" },
  { name: "Other", value: 5, color: "#727783" },
] as const;

export const patientDemographics = [
  { age: "0-18", count: 120 },
  { age: "19-35", count: 250 },
  { age: "36-50", count: 380 },
  { age: "51-65", count: 420 },
  { age: "65+", count: 310 },
] as const;

export const patients: PatientRecord[] = [
  {
    id: "VH-2024-9912",
    name: "Eleanor Harris",
    age: 64,
    gender: "Female",
    bloodGroup: "O Positive",
    email: "e.harris@email.com",
    phone: "+1 (555) 902-1244",
    status: "Critical",
    lastVisit: "2024-03-15",
    conditions: [
      {
        id: "1",
        name: "Hypertension",
        notes: "Managing with Lisinopril 20mg daily.",
        type: "cardio",
      },
      {
        id: "2",
        name: "Mild Asthma",
        notes: "Exercise-induced. Occasional use of Salbutamol inhaler.",
        type: "respiratory",
      },
    ],
    timeline: [
      {
        id: "t1",
        date: "Apr 12, 2024",
        title: "Cardiology Consultation",
        doctor: "Dr. Robert Vance",
        location: "Room 402",
        type: "upcoming",
      },
      {
        id: "t2",
        date: "Mar 05, 2024",
        title: "Routine Blood Panel",
        doctor: "Laboratory A",
        location: "Main Lab",
        type: "past",
      },
    ],
    vitals: { bpm: 72, bp: "128/84", spo2: 98 },
    insurance: {
      provider: "Blue Cross Shield",
      policyNumber: "BC-449102-1",
      status: "Active",
    },
  },
  {
    id: "VH-2024-8842",
    name: "Marcus Thompson",
    age: 45,
    gender: "Male",
    bloodGroup: "A Positive",
    email: "m.thompson@email.com",
    phone: "+1 (555) 123-4567",
    status: "Stable",
    lastVisit: "2024-03-10",
    conditions: [],
    timeline: [],
    vitals: { bpm: 68, bp: "120/80", spo2: 99 },
    insurance: {
      provider: "Aetna",
      policyNumber: "AE-9921-00",
      status: "Active",
    },
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
  },
  {
    id: "VH-2024-7721",
    name: "Julianna Wright",
    age: 29,
    gender: "Female",
    bloodGroup: "B Negative",
    email: "j.wright@email.com",
    phone: "+1 (555) 765-4321",
    status: "Stable",
    lastVisit: "2024-03-01",
    conditions: [],
    timeline: [],
    vitals: { bpm: 75, bp: "115/75", spo2: 97 },
    insurance: {
      provider: "Cigna",
      policyNumber: "CI-1122-33",
      status: "Active",
    },
  },
];

export const appointments: AppointmentRecord[] = [
  {
    id: "APT-78923-B",
    patientId: "VH-2024-9912",
    patientName: "Eleanor Harris",
    patientAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    date: "Oct 14, 2023",
    time: "09:30 AM",
    status: "Confirmed",
    doctor: "Dr. Smith",
    department: "Cardiology",
    notes:
      "Previous visit on Aug 12 showed early signs of hypertension. Patient reporting recurring headaches and palpitations. Needs ECG review.",
  },
  {
    id: "APT-78924-C",
    patientId: "VH-2024-18239",
    patientName: "Jerome Bell",
    date: "Oct 14, 2023",
    time: "10:15 AM",
    status: "Pending",
    doctor: "Dr. Arnab",
    department: "Neurology",
  },
  {
    id: "APT-78925-D",
    patientId: "VH-2024-20511",
    patientName: "Robert Fox",
    patientAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    date: "Oct 14, 2023",
    time: "11:00 AM",
    status: "Checked In",
    doctor: "Dr. Smith",
    department: "Cardiology",
  },
  {
    id: "APT-78926-E",
    patientId: "VH-2024-19003",
    patientName: "Kathryn Murphy",
    patientAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    date: "Oct 14, 2023",
    time: "02:45 PM",
    status: "Confirmed",
    doctor: "Dr. Vikram",
    department: "Pediatrics",
  },
];
