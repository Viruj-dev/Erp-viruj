const radiologyServiceGroups = [
  {
    category: "X-Ray",
    prefix: "RAD-A",
    modality: "X-ray",
    names: [
      "Chest X-Ray",
      "Digital X-Ray",
      "X-Ray of Abdomen",
      "X-Ray of Skull",
      "X-Ray of Spine",
      "Cervical Spine X-Ray",
      "Lumbar Spine X-Ray",
      "Pelvis X-Ray",
      "Shoulder X-Ray",
      "Arm and Elbow X-Ray",
      "Wrist and Hand X-Ray",
      "Hip X-Ray",
      "Knee X-Ray",
      "Leg and Ankle X-Ray",
      "Foot X-Ray",
      "Dental X-Ray",
      "Portable X-Ray"
    ]
  },
  {
    category: "Ultrasound and Sonography",
    prefix: "RAD-B",
    modality: "Ultrasound",
    names: [
      "Whole Abdomen Ultrasound",
      "Upper Abdomen Ultrasound",
      "Lower Abdomen Ultrasound",
      "Pelvic Ultrasound",
      "KUB Ultrasound (Kidneys, Ureters and Bladder)",
      "Obstetric Ultrasound",
      "Pregnancy Dating Scan",
      "Fetal Growth Scan",
      "Fetal Well-Being Scan",
      "NT Scan",
      "Anomaly Scan",
      "Transvaginal Ultrasound",
      "Breast Ultrasound",
      "Thyroid Ultrasound",
      "Scrotal Ultrasound",
      "Prostate Ultrasound",
      "Soft Tissue Ultrasound",
      "Musculoskeletal Ultrasound",
      "Neonatal Cranial Ultrasound"
    ]
  },
  {
    category: "Colour Doppler Studies",
    prefix: "RAD-C",
    modality: "Colour Doppler",
    names: [
      "Colour Doppler Ultrasound",
      "Obstetric Doppler",
      "Carotid Doppler",
      "Venous Doppler of Lower Limbs",
      "Arterial Doppler of Lower Limbs",
      "Upper Limb Doppler",
      "Renal Doppler",
      "Portal Vein Doppler",
      "Scrotal Doppler",
      "Fetal Doppler Study",
      "Peripheral Vascular Doppler"
    ]
  },
  {
    category: "CT Scan (Computed Tomography)",
    prefix: "RAD-D",
    modality: "CT",
    names: [
      "CT Scan of Brain",
      "CT Scan of Head",
      "CT Scan of Chest",
      "HRCT Chest",
      "CT Scan of Abdomen",
      "CT Scan of Pelvis",
      "CT Scan of Whole Abdomen",
      "CT Scan of Spine",
      "CT Scan of Paranasal Sinuses (PNS)",
      "CT Scan of Orbit",
      "CT Scan of Neck",
      "CT Angiography (CTA)",
      "CT Urography",
      "CT KUB",
      "CT Pulmonary Angiography",
      "CT Scan with Contrast",
      "CT Scan without Contrast",
      "3D CT Reconstruction"
    ]
  },
  {
    category: "MRI (Magnetic Resonance Imaging)",
    prefix: "RAD-E",
    modality: "MRI",
    names: [
      "MRI Brain",
      "MRI Spine",
      "MRI Cervical Spine",
      "MRI Lumbar Spine",
      "MRI Thoracic Spine",
      "MRI Knee",
      "MRI Shoulder",
      "MRI Hip",
      "MRI Ankle",
      "MRI Wrist",
      "MRI Abdomen",
      "MRI Pelvis",
      "MRI Whole Abdomen",
      "MRI Brain with Contrast",
      "MRI Brain without Contrast",
      "MR Angiography (MRA)",
      "MR Venography (MRV)",
      "MRCP",
      "MRI Breast",
      "MRI Cardiac"
    ]
  },
  {
    category: "Mammography and Breast Imaging",
    prefix: "RAD-F",
    modality: "Mammography",
    names: [
      "Digital Mammography",
      "Bilateral Mammography",
      "Unilateral Mammography",
      "Breast Tomosynthesis (3D Mammography)",
      "Breast Ultrasound",
      "Image-Guided Breast Biopsy, where available"
    ]
  },
  {
    category: "Bone Density and Specialized Imaging",
    prefix: "RAD-G",
    modality: "Specialized imaging",
    names: [
      "DEXA Scan (Bone Mineral Density)",
      "Whole-Body DEXA",
      "Bone Age X-Ray",
      "Orthopantomogram (OPG)",
      "Cephalometric X-Ray",
      "Sinus X-Ray",
      "Hysterosalpingography (HSG)",
      "Barium Studies",
      "Fluoroscopy",
      "Image-Guided Biopsy",
      "Image-Guided Drainage"
    ]
  },
  {
    category: "Cardiac and Vascular Imaging",
    prefix: "RAD-H",
    modality: "Cardiac / vascular imaging",
    names: [
      "Echocardiography (2D Echo)",
      "Colour Doppler Echocardiography",
      "Stress Echocardiography",
      "Transoesophageal Echocardiography (TEE)",
      "Vascular Ultrasound",
      "Aortic Ultrasound"
    ]
  },
  {
    category: "Nuclear Medicine Imaging",
    prefix: "RAD-I",
    modality: "Nuclear medicine",
    names: [
      "PET-CT Scan",
      "SPECT Scan",
      "Thyroid Scan",
      "Bone Scan",
      "Renal Nuclear Scan",
      "Myocardial Perfusion Scan",
      "Thyroid Uptake Study"
    ]
  },
  {
    category: "Radiology Support Services",
    prefix: "RAD-J",
    modality: "Radiology support",
    names: [
      "Radiologist Consultation",
      "Radiology Report Preparation",
      "Second Opinion on Imaging",
      "Digital Imaging and Report Access",
      "CD/Film Imaging Copy",
      "Image Transfer to Treating Doctor",
      "Appointment Booking for Imaging",
      "Contrast Administration, where available",
      "Image-Guided Interventional Radiology",
      "Teleradiology Reporting"
    ]
  }
];

export const radiologyServicePresets = radiologyServiceGroups.flatMap(
  ({ category, prefix, modality, names }) =>
    names.map((name) => ({
      category,
      name,
      modality: name === "Breast Ultrasound" ? "Ultrasound" : modality,
      contrast: name.includes("with Contrast"),
      code: `${prefix}-${name
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "-")
        .replace(/-$/, "")}`.slice(0, 40)
    }))
);
