// ─────────────────────────────────────────────────────────────
//  ALL SITE TEXT LIVES HERE.
//  Edit this file to update the portfolio. No animation code here.
//  Anything marked TODO is a placeholder waiting for real content.
// ─────────────────────────────────────────────────────────────

export const site = {
  name: 'Virooshan Naidu',
  fullName: 'Virooshan Naidu A/L Rajkumar',
  title: 'AI & Software Developer',
  location: 'Shah Alam, Selangor, Malaysia',
  email: 'virooshann@gmail.com',
  github: 'https://github.com/virooshann',
  // TODO: paste your LinkedIn URL here. The button stays hidden while this is empty.
  linkedin: '',
  resume: 'assets/Virooshan_Naidu_Resume.pdf',
  // TODO: add your photo at assets/img/profile.jpg, then set this to 'assets/img/profile.jpg'.
  // While empty, a styled placeholder with your initials is shown instead.
  photo: '',
  photoAlt: 'Portrait of Virooshan Naidu',
};

// Labels shown in the HUD rail. One per section, in scroll order.
export const stages = [
  { id: 'hero',       code: '00', label: 'INPUT',      detail: 'raw signal' },
  { id: 'about',      code: '01', label: 'PREPROCESS', detail: 'normalise' },
  { id: 'attendance', code: '02', label: 'DETECT',     detail: 'multi-cam' },
  { id: 'plate',      code: '03', label: 'OCR',        detail: 'plate read' },
  { id: 'experience', code: '04', label: 'ROUTE',      detail: 'network' },
  { id: 'skills',     code: '05', label: 'CLASSIFY',   detail: 'clusters' },
  { id: 'contact',    code: '06', label: 'OUTPUT',     detail: 'match' },
];

export const about = {
  heading: 'About',
  text: 'Computer Science graduate specialising in Artificial Intelligence, focused on building practical AI and software solutions. Experienced in computer vision, machine learning and API integration, with additional industry experience in IT infrastructure and networking. Fluent in English, Malay and Tamil.',
};

// Projects. The order here = the order on the page.
// `scene` decides which 3D scene plays: 'attendance' or 'plate'.
// Set `enabled: false` to hide a project.
// `repo` / `demo`: leave '' to show a styled "coming soon" placeholder.
// `demo` can be an image or GIF path, e.g. 'assets/img/attendance-demo.gif'.
export const projects = [
  {
    enabled: true,
    id: 'attendance',
    scene: 'attendance',
    title: 'AI Classroom Attendance System',
    badge: 'Final Year Project · Grade A+',
    tags: ['Python', 'OpenCV', 'dlib', 'SQLite', 'Tkinter'],
    summary: 'Multi-camera facial recognition system: an entrance camera marks attendance and two classroom cameras track presence throughout the session.',
    highlights: [
      'Chose dlib HOG over DeepFace for CPU-only hardware',
      'Anti-spoofing liveness detection that reuses face encodings',
      'Duplicate-safe session creation',
      'Admin, lecturer and student portals with automatic Present / Late / Partial / Absent status',
    ],
    repo: '', // TODO: repo URL
    demo: '', // TODO: demo GIF or video still, e.g. 'assets/img/attendance-demo.gif'
    demoAlt: 'Demo of the AI Classroom Attendance System',
    // Decorative HUD readout shown on the card (not a fact, just flavour).
    readout: ['CAM_ENTRANCE', 'CAM_CLASS_A', 'CAM_CLASS_B'],
  },
  {
    enabled: true,
    id: 'plate',
    scene: 'plate',
    title: 'Malaysian License Plate Recognition System',
    badge: '',
    tags: ['Image processing', 'EasyOCR'],
    summary: 'A pipeline that locates plates using edge detection, morphological processing and candidate scoring, then improves OCR reliability by reading multiple enhanced versions of each plate and applying Malaysian plate-format correction rules.',
    highlights: [],
    repo: '', // TODO: repo URL
    demo: '', // TODO: demo image, e.g. 'assets/img/plate-demo.jpg'
    demoAlt: 'Demo of the Malaysian License Plate Recognition System',
    // Fictional demo plate that "resolves" character by character in the HUD.
    readout: 'BVN 2026',
  },
  {
    // ── Third project slot: fill in and set enabled: true ──
    enabled: false,
    id: 'project3',
    scene: 'attendance', // reuses an existing 3D scene
    title: 'TODO: Project title',
    badge: '',
    tags: ['TODO'],
    summary: 'TODO: one or two sentences about the project.',
    highlights: [],
    repo: '',
    demo: '',
    demoAlt: 'TODO: describe the demo image',
    readout: ['TODO'],
  },
];

// Experience + education timeline. Each entry lights up one node in the 3D network.
export const experience = [
  {
    role: 'Founder & CFO',
    org: 'Netrik Techworks',
    period: 'Jul 2025 – Present',
    text: 'A three-person technology services company offering hardware support, web and software development.',
  },
  {
    role: 'Junior IT Executive',
    org: 'Solara Systems (M) Sdn Bhd',
    period: 'Mar 2025 – Jul 2025',
    text: 'Network setup (VPNs, switches, routers, firewalls), security for VPN access and NVR/DVR systems, hardware diagnosis and repair, OS and BIOS maintenance.',
  },
  {
    role: 'Support Intern',
    org: 'IDS Medical Systems',
    period: 'Sep 2023 – Dec 2023',
    text: 'Software testing, prototype building and project planning.',
  },
];

export const education = [
  {
    role: 'BSc (Hons) Computer Science (Artificial Intelligence)',
    org: 'Asia Pacific University (APU)',
    period: 'Expected Nov 2026',
  },
  {
    role: 'Diploma in ICT (Software Engineering)',
    org: 'Asia Pacific University (APU)',
    period: '',
  },
];

// Exactly four groups → four orbiting clusters in 3D.
export const skills = [
  { group: 'Development', items: ['Python', 'SQL', 'API integration', 'AI-assisted development', 'Java', 'C++', 'R'] },
  { group: 'AI & Data', items: ['OpenCV', 'face_recognition / dlib', 'scikit-learn', 'XGBoost', 'Streamlit', 'RapidMiner'] },
  { group: 'IT & Networking', items: ['VPN', 'Switch & router configuration', 'Firewall setup', 'NVR/DVR security', 'Hardware diagnosis & repair'] },
  { group: 'Languages', items: ['English', 'Malay', 'Tamil'] },
];

export const contact = {
  heading: 'Get in touch',
};

export const footer = '© 2026 Virooshan Naidu · Built with Three.js and GSAP';
