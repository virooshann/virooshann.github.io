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
  // Leave '' to show a placeholder tile with your initials instead.
  photo: 'assets/img/profile.jpg',
  photoAlt: 'Portrait of Virooshan Naidu in a white shirt, arms crossed, in an office',
};

// Labels shown in the HUD rail. One per section, in scroll order.
// `id` matches a section's scene name (projects use their `scene`).
export const stages = [
  { id: 'hero',       code: '00', label: 'INPUT',      detail: 'raw signal' },
  { id: 'about',      code: '01', label: 'PREPROCESS', detail: 'normalise' },
  { id: 'attendance', code: '02', label: 'DETECT',     detail: 'multi-cam' },
  { id: 'plate',      code: '03', label: 'OCR',        detail: 'plate read' },
  { id: 'predictor',  code: '04', label: 'PREDICT',    detail: 'regression' },
  { id: 'experience', code: '05', label: 'ROUTE',      detail: 'network' },
  { id: 'skills',     code: '06', label: 'CLASSIFY',   detail: 'clusters' },
  { id: 'contact',    code: '07', label: 'OUTPUT',     detail: 'match' },
];

export const about = {
  heading: 'About',
  paragraphs: [
    'Computer Science graduate specialising in Artificial Intelligence, with a focus on building practical AI and software solutions. Experienced in computer vision, machine learning and API integration, demonstrated through a multi-camera facial recognition attendance system and a license plate recognition pipeline.',
    'Brings hands-on industry experience in IT infrastructure, networking and hardware support, and runs a registered IT services company handling both technical delivery and finances. A highly collaborative team player who enjoys leading groups, communicates confidently in English, Malay and Tamil, and manages time well across multiple responsibilities.',
  ],
  languages: 'English · Malay · Tamil (all native)',
  // Leadership & involvements
  involvements: [
    ['President', 'Young Enterprise Club (secondary school)'],
    ['Main Goalkeeper', 'School football team'],
    ['Main Goalkeeper', 'APU futsal team'],
    ['Group Leader', 'For the majority of university group assignments'],
    ['Regular Blood Donor', 'Donating every three months'],
  ],
};

// Projects. The order here = the order on the page.
// `scene` picks the 3D scene: 'attendance', 'plate' or 'predictor'.
// `repo`:  a URL shows a button · '' shows "coming soon" · null hides the button.
// `demo`:  an image path shows it · '' shows a "coming soon" placeholder · null hides it.
// `demoSize`: the image's [width, height] in pixels (prevents layout jumps while loading).
export const projects = [
  {
    enabled: true,
    id: 'attendance',
    scene: 'attendance',
    title: 'AI Classroom Attendance System',
    badge: 'Final Year Project · Grade A+',
    tags: ['Python', 'OpenCV', 'dlib', 'SQLite', 'Tkinter'],
    summary: 'Built a multi-camera facial recognition system: an entrance camera marks attendance and two classroom cameras track presence throughout the session.',
    highlights: [
      'Chose dlib HOG over DeepFace after testing showed DeepFace ran at 1–3 FPS on CPU-only classroom hardware.',
      'Added anti-spoofing liveness detection that reuses face encodings, rejecting printed photos at no extra compute cost.',
      'Prevented duplicate session records when the camera and lecturer portal trigger simultaneously.',
      'Delivered admin, lecturer and student portals with live attendance monitoring and automatic Present / Late / Partial / Absent status.',
    ],
    // Repo is private for now, so this links to the GitHub profile.
    repo: 'https://github.com/virooshann',
    demo: 'assets/img/attendance-demo.webp',
    demoSize: [927, 544],
    demoAlt: 'Entrance camera window of the attendance system showing a student (face blurred) with a green "Attendance Marked" banner',
    // Decorative HUD readout on the card.
    readout: ['CAM_ENTRANCE', 'CAM_CLASS_A', 'CAM_CLASS_B'],
    readoutDone: 'PRESENT',
  },
  {
    enabled: true,
    id: 'plate',
    scene: 'plate',
    title: 'Malaysian License Plate Recognition System',
    badge: '',
    tags: ['Python', 'Image processing', 'EasyOCR'],
    summary: 'Designed, built and tested a pipeline using edge detection, morphological processing and candidate scoring to locate plates.',
    highlights: [
      'Improved OCR reliability by reading multiple enhanced versions of each plate and applying Malaysian plate-format correction rules.',
    ],
    repo: 'https://github.com/virooshann',
    demo: 'assets/img/plate-demo.webp',
    demoSize: [888, 471],
    demoAlt: 'License plate recognition app reading plate AKD 9878 at 100% confidence and identifying the state as Perak',
    // Demo plate that "resolves" character by character in the HUD and forms the 3D plate.
    readout: 'AKD 9878',
  },
  {
    enabled: true,
    id: 'predictor',
    scene: 'predictor',
    title: 'Student Exam Score Predictor',
    badge: '',
    tags: ['Python', 'scikit-learn', 'XGBoost', 'Streamlit'],
    summary: 'Trained and tuned four regression models with GridSearchCV and deployed them in a Streamlit web app with model selection and validated inputs.',
    highlights: [],
    repo: null,
    demo: null,
    demoSize: null,
    demoAlt: '',
    readout: ['MODEL_1', 'MODEL_2', 'MODEL_3', 'MODEL_4'],
    readoutDone: 'TUNED',
  },
];

// Experience + education timeline. Each entry lights up one node in the 3D network.
export const experience = [
  {
    role: 'Founder & CFO',
    org: 'Netrik Techworks',
    period: 'Jul 2025 – Present',
    points: [
      'Founded an SSM-registered IT services company offering PC and laptop repair, network setup, CCTV installation, server management, website development and maintenance, custom software development, and the sale of computer parts and accessories.',
      'Manage company finances end to end, including budgeting, pricing, quotations, invoicing, accounts and banking.',
      'Developed and maintain the company\'s internal systems: the company website, a customer ticketing system, an invoice, quotation and receipt generator, and in-house accounting software.',
      'Contribute directly to technical work, including coding on client software projects.',
    ],
    achievement: 'Built the company\'s complete operational toolkit in-house, from customer tickets to invoicing and accounting, giving the business a streamlined workflow from enquiry to payment.',
  },
  {
    role: 'Junior IT Executive',
    org: 'Solara Systems (M) Sdn Bhd',
    period: 'Mar 2025 – Jul 2025',
    points: [
      'Set up networks at 10+ client sites, configuring Cisco and TP-Link switches and routers, Sophos firewalls and VPNs to establish secure, stable connections.',
      'Secured VPN access and Dahua NVR/DVR surveillance systems with proper authentication controls.',
      'Diagnosed, repaired and upgraded 50+ laptops, replacing components including RAM, SSDs, batteries, ribbon cables, keyboards and fans.',
      'Performed BIOS updates, Windows upgrades, driver installations and Microsoft Office activation.',
      'Resolved hardware, software and connectivity issues for end users, and supported Windows and Windows Server environments.',
    ],
    achievement: 'Simplified the company\'s standard operating procedures (SOPs) so tasks were easier and quicker for the team to follow, and was trusted with independent responsibility for client work.',
  },
  {
    role: 'Support Intern',
    org: 'IDS Medical Systems',
    period: 'Sep 2023 – Dec 2023',
    points: [
      'Tested software applications to identify and resolve defects before release, ensuring functionality and quality.',
      'Assisted in building user-friendly project prototypes.',
      'Took part in strategic planning sessions to align projects with long-term goals.',
    ],
    achievement: '',
  },
];

export const education = [
  {
    role: 'BSc (Hons) Computer Science (Artificial Intelligence)',
    org: 'Asia Pacific University of Technology & Innovation (APU)',
    period: 'Expected Nov 2026',
    grade: 'CGPA 2.78',
    modules: 'Image Processing & Computer Vision, Big Data Analytics, Text Analytics, Enterprise Programming for Distributed Applications, Enterprise IoT',
  },
  {
    role: 'Diploma in ICT (Software Engineering)',
    org: 'Asia Pacific University of Technology & Innovation (APU)',
    period: '',
    grade: 'CGPA 2.90',
    modules: 'Networks and Networking, Operating Systems, Database Systems, Web Development',
  },
];

// One card per group; each group becomes one particle cluster in 3D.
export const skills = [
  { group: 'Programming', items: ['Python', 'SQL', 'Java', 'C++', 'R'] },
  { group: 'AI & Data', items: ['OpenCV', 'face_recognition / dlib', 'EasyOCR', 'scikit-learn', 'XGBoost', 'Streamlit', 'RapidMiner'] },
  { group: 'Development', items: ['API integration', 'AI-assisted development', 'Git', 'GitHub', 'VS Code', 'Claude Code', 'ChatGPT'] },
  { group: 'Cloud & Deployment', items: ['Google Cloud', 'AWS', 'Cloudflare', 'Vercel'] },
  { group: 'Networking & Security', items: ['Cisco', 'TP-Link', 'Sophos firewalls', 'VPN configuration', 'Switch & router setup', 'Dahua NVR/DVR & CCTV'] },
  { group: 'Systems & Hardware', items: ['Windows', 'Windows Server', 'Server management', 'Hardware diagnosis & repair', 'BIOS updates'] },
  { group: 'Productivity', items: ['Microsoft Office', 'Canva'] },
  { group: 'Soft Skills', items: ['Teamwork', 'Leadership', 'Communication', 'Time management', 'Problem-solving'] },
];

export const contact = {
  heading: 'Get in touch',
};

export const footer = '© 2026 Virooshan Naidu · Built with Three.js and GSAP';
