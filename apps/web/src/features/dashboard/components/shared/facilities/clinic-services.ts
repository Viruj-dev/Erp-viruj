import type { VirujFacilityCategory } from "@/lib/viruj-backend";

// Clinic service names supplied by the product owner.
const groups: { category: VirujFacilityCategory; names: string[] }[] = [
  {
    category: "Treatment",
    names: [
      "General Physician Consultation",
      "Specialist Doctor Consultation",
      "Follow-up Consultation",
      "Fever and Infection Treatment",
      "Cold and Cough Treatment",
      "Diabetes Management",
      "Blood Pressure Management",
      "Thyroid Disorder Consultation",
      "Chronic Disease Management",
      "Dermatology Consultation",
      "ENT Consultation",
      "Ophthalmology Consultation",
      "Psychiatry Consultation",
      "Urology Consultation",
      "Gastroenterology Consultation",
      "Pulmonology Consultation",
      "Endocrinology Consultation",
      "Nephrology Consultation",
      "Wound Dressing",
      "Minor Wound Care",
      "Minor Wound Suturing",
      "Injection Administration",
      "Nebulization",
      "Earwax Removal",
      "Minor Burn Care",
      "Minor Injury Management",
      "Splint Application",
      "Cast Application",
      "Catheter Care",
      "Pain Management",
      "Online Doctor Consultation",
      "Telemedicine Follow-up",
    ],
  },
  { category: "Cardiology", names: ["Cardiology Consultation"] },
  { category: "Orthopedics", names: ["Orthopaedic Consultation"] },
  { category: "Neurology", names: ["Neurology Consultation"] },
  { category: "Oncology", names: ["Oncology Consultation"] },
  {
    category: "Dental",
    names: [
      "Dental Consultation",
      "Dental Cleaning and Scaling",
      "Dental Filling",
      "Tooth Extraction",
    ],
  },
  { category: "Diagnostic", names: ["Eye Examination", "Vision Testing"] },
  {
    category: "Women's Health",
    names: [
      "Gynaecology Consultation",
      "Women's Health Consultation",
      "Pregnancy Consultation",
      "Antenatal Care",
      "Postnatal Care",
      "Menstrual Health Consultation",
      "PCOS/PCOD Management",
      "Family Planning Counselling",
      "Menopause Management",
      "Infertility Consultation",
    ],
  },
  {
    category: "Children's Care",
    names: [
      "Paediatric Consultation",
      "Newborn Care Consultation",
      "Child Growth and Development Assessment",
      "Child Nutrition Counselling",
    ],
  },
  {
    category: "Vaccination",
    names: [
      "Childhood Vaccination",
      "Adult Vaccination",
      "General Vaccination and Immunization",
    ],
  },
  {
    category: "Rehabilitation",
    names: [
      "Physiotherapy",
      "Orthopaedic Rehabilitation",
      "Sports Injury Rehabilitation",
      "Post-Surgical Rehabilitation",
      "Mobility and Functional Assessment",
    ],
  },
  {
    category: "Wellness",
    names: [
      "Preventive Health Consultation",
      "Diet and Nutrition Counselling",
      "Weight Management",
      "Mental Health Counselling",
      "Stress Management",
      "Smoking Cessation Counselling",
      "Senior Citizen Healthcare",
      "Lifestyle Disease Prevention",
      "Full Body Physical Examination",
      "Routine Health Checkup",
      "Medical Fitness Assessment",
      "Medical Certificate Issuance, Where Appropriate",
    ],
  },
  { category: "Emergency", names: ["First Aid and Initial Stabilization"] },
  {
    category: "Home Care",
    names: [
      "Home Healthcare Visits",
      "Home Nursing Services",
      "Home Physiotherapy",
    ],
  },
];

export const clinicServices = groups.flatMap(({ category, names }) =>
  names.map((name) => ({ name, category }))
);
