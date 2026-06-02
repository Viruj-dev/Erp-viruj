export const doctorPatients = [
  ["Margot Sterling", "#PA-2041", "Today, 09:15 AM", "12", "Checked-in", "MS", "blue"],
  ["Jameson Burke", "#PA-1988", "Nov 02, 2023", "24", "Medical Alert", "JB", "rose"],
  ["Helena Lowell", "#PA-2115", "Nov 10, 2023", "3", "Scheduled", "HL", "indigo"],
  ["Arthur Reed", "#PA-1842", "Oct 15, 2023", "41", "Completed", "AR", "teal"],
  ["Sarah Davenport", "#PA-2150", "Nov 12, 2023", "1", "Checked-in", "SD", "blue"],
] as const;

export const appointments = [
  ["APT-1024", "Margot Sterling", "Today, 08:30 AM", "Clinic", "Confirmed", "Chest discomfort"],
  ["APT-1025", "Jameson Burke", "Today, 10:00 AM", "Online", "Requested", "Follow-up review"],
  ["APT-1026", "Helena Lowell", "Tomorrow, 02:00 PM", "Clinic", "In Progress", "Cardiac rhythm consult"],
  ["APT-1027", "Arthur Reed", "Fri, 04:30 PM", "Clinic", "Completed", "Post procedure review"],
] as const;

export const consultations = [
  ["CON-4421", "Margot Sterling", "Hypertension review", "In Progress", "Today, 08:45 AM"],
  ["CON-4418", "Arthur Reed", "Post angioplasty follow-up", "Completed", "Oct 24, 2023"],
  ["CON-4407", "Sarah Davenport", "Preventive cardiology", "Draft", "Oct 21, 2023"],
] as const;

export const locations = [
  ["St. Mary's General Hospital", "HOSPITAL", "London", "$180.00", "Active", "Primary"],
  ["The Health Hub Clinic", "CLINIC", "Westminster", "$95.00", "Active", "Secondary"],
  ["Greenwich Outpatient Center", "HOSPITAL", "Greenwich", "$120.00", "Maintenance", "Secondary"],
  ["City Heart Specialist Wing", "CLINIC", "London", "$250.00", "Active", "Secondary"],
] as const;
