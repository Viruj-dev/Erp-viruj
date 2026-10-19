export const pathologyServicePresets = [
  {
    category: "Haematology",
    name: "Complete blood count",
    code: "CBC",
    specimen: "Blood",
  },
  {
    category: "Haematology",
    name: "Erythrocyte sedimentation rate",
    code: "ESR",
    specimen: "Blood",
  },
  {
    category: "Biochemistry",
    name: "Blood glucose",
    code: "GLU",
    specimen: "Blood",
  },
  {
    category: "Biochemistry",
    name: "Liver function test",
    code: "LFT",
    specimen: "Blood",
  },
  {
    category: "Biochemistry",
    name: "Kidney function test",
    code: "KFT",
    specimen: "Blood",
  },
  {
    category: "Biochemistry",
    name: "Lipid profile",
    code: "LIPID",
    specimen: "Blood",
  },
  {
    category: "Hormones & immunology",
    name: "Thyroid profile",
    code: "THYROID",
    specimen: "Blood",
  },
  {
    category: "Hormones & immunology",
    name: "Vitamin D",
    code: "VITD",
    specimen: "Blood",
  },
  {
    category: "Microbiology",
    name: "Urine culture",
    code: "UCULT",
    specimen: "Urine",
  },
  {
    category: "Clinical pathology",
    name: "Urine routine examination",
    code: "URINE",
    specimen: "Urine",
  },
  {
    category: "Molecular testing",
    name: "PCR test",
    code: "PCR",
    specimen: "Swab",
  },
  {
    category: "Health packages",
    name: "Preventive health checkup",
    code: "HEALTH",
    specimen: "Blood and urine",
  },
] as const;
