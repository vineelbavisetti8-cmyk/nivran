export type Comment = {
  id: string;
  author: string;
  role?: "Citizen" | "Official" | "System";
  text: string;
  created: string;
};

export type EscalationEvent = {
  id: string;
  fromLevel: number;
  toLevel: number;
  fromTitle: string;
  toTitle: string;
  escalatedAt: string;
  reason: string;
};

export type StatusHistoryEvent = {
  id: string;
  status: string;
  comment: string;
  actorRole: "citizen" | "official" | "system";
  actorName: string;
  createdAt: string;
  proofUrl?: string;
};

export type ResolutionProof = {
  photoUrl?: string;
  note: string;
  resolvedBy: string;
  resolvedAt: string;
};

export type Complaint = {
  id: string;
  title: string;
  category: string;
  district?: string;
  address?: string;
  location: string;
  lat?: number;
  lng?: number;
  status: "Submitted" | "Acknowledged" | "In progress" | "Awaiting confirmation" | "Resolved" | "Escalated";
  priority: "Normal" | "High" | "Critical";
  currentLevel: 1 | 2 | 3;
  levelTitle: string;
  owner: string;
  due: string;
  slaDeadline: string; // ISO date string
  slaSecondsTotal: number;
  isDemoSpeed?: boolean;
  created: string;
  createdAtIso: string;
  description: string;
  aiSummary?: string;
  citizenName?: string;
  phone?: string;
  imageUrl?: string;
  audioUrl?: string;
  voiceTranscript?: string;
  resolutionProof?: ResolutionProof;
  escalationLog?: EscalationEvent[];
  statusHistory?: StatusHistoryEvent[];
  comments?: Comment[];
  reactions?: number;
  confirmed?: boolean;
  citizenReopened?: boolean;
};

export const officialLevels = [
  { level: 1, title: "Ward Junior Engineer & Field Officer", name: "R. Kumar", department: "Rural Water & Sanitation (RWS) / Field Ops" },
  { level: 2, title: "Municipal Commissioner & Mandal Revenue Officer", name: "S. Balaji", department: "Mandal Administration & Grievance Oversight" },
  { level: 3, title: "District Collector & District Magistrate", name: "Dr. K. Venkata Ramana, IAS", department: "Chief Minister Grievance Redressal Cell" },
];

export const complaints: Complaint[] = [
  {
    id: "NVR-26-01842",
    title: "Community handpump broken near ZP High School",
    category: "Water & sanitation",
    district: "Chittoor District, Andhra Pradesh",
    address: "Near ZP High School, Ward 4, Punganur",
    location: "Near ZP High School, Ward 4, Punganur, Chittoor District, Andhra Pradesh",
    lat: 13.3667,
    lng: 78.5833,
    status: "In progress",
    priority: "High",
    currentLevel: 1,
    levelTitle: "Level 1 · Ward Junior Engineer & Field Officer",
    owner: "RWS Dept · R. Kumar (Junior Engineer)",
    due: "SLA in 65s",
    slaDeadline: new Date(Date.now() + 65 * 1000).toISOString(),
    slaSecondsTotal: 90,
    isDemoSpeed: true,
    created: "Today, 10:42 AM",
    createdAtIso: new Date(Date.now() - 25 * 1000).toISOString(),
    description: "The primary drinking water borewell handpump near ZP High School in ward 4 has had a broken handle and cracked riser pipe for 5 days. 65 village families are walking 1.5 km to fetch water.",
    aiSummary: "Drinking water handpump riser pipe damaged affecting 65 households in Punganur.",
    citizenName: "Venkata Lakshmi",
    phone: "9848012345",
    imageUrl: "/images/issues/village_broken_handpump.jpg",
    escalationLog: [],
    statusHistory: [
      {
        id: "SH-1",
        status: "Submitted",
        comment: "Citizen filed grievance with real village handpump photo. AI triage auto-assigned to RWS department.",
        actorRole: "citizen",
        actorName: "Venkata Lakshmi",
        createdAt: "Today, 10:42 AM",
      },
      {
        id: "SH-2",
        status: "In progress",
        comment: "Field Engineer R. Kumar acknowledged ticket and dispatched mechanical spares.",
        actorRole: "official",
        actorName: "R. Kumar (Junior Engineer)",
        createdAt: "Today, 10:44 AM",
      },
    ],
    comments: [
      { id: "CMT-1", author: "R. Kumar (Official)", role: "Official", text: "Mechanic gang has been sent with replacement spare parts.", created: "Today, 10:45 AM" },
      { id: "CMT-2", author: "G. Murthy (Resident)", role: "Citizen", text: "School students are also depending on this. Please fix before afternoon.", created: "Today, 10:48 AM" }
    ],
    reactions: 24,
    confirmed: false,
  },
  {
    id: "NVR-26-01839",
    title: "Low-hanging 11KV live wire over village approach path",
    category: "Electricity",
    district: "Guntur District, Andhra Pradesh",
    address: "Tractor Approach Road, Beside Primary School, Mangalagiri",
    location: "Tractor Approach Road, Beside Primary School, Mangalagiri, Guntur District, Andhra Pradesh",
    lat: 16.4300,
    lng: 80.5700,
    status: "Escalated",
    priority: "Critical",
    currentLevel: 2,
    levelTitle: "Level 2 · Municipal Commissioner & Executive Engineer",
    owner: "APSPDCL Oversight · S. Balaji (Commissioner)",
    due: "Overdue (Level 2 Escalation)",
    slaDeadline: new Date(Date.now() + 180 * 1000).toISOString(),
    slaSecondsTotal: 90,
    isDemoSpeed: true,
    created: "Yesterday, 4:18 PM",
    createdAtIso: new Date(Date.now() - 3600 * 1000).toISOString(),
    description: "After recent gale rains, the 11KV line pole tilted and the electric wire is sagging just 6 feet above the tractor pathway. Extreme electrocution risk for farm carts and school children.",
    aiSummary: "Hazardous 11KV power line sagged to 6ft over agricultural approach road in Mangalagiri.",
    citizenName: "K. Raghunath",
    phone: "9440156789",
    imageUrl: "/images/issues/village_transformer_wires.jpg",
    escalationLog: [
      {
        id: "ESC-1",
        fromLevel: 1,
        toLevel: 2,
        fromTitle: "Level 1: Ward Linesman & JE",
        toTitle: "Level 2: Municipal Commissioner & Executive Engineer",
        escalatedAt: "Today, 11:00 AM",
        reason: "Level 1 response SLA window expired with no field action logged. Auto-escalated to Level 2 supervisor.",
      }
    ],
    statusHistory: [
      {
        id: "SH-3",
        status: "Submitted",
        comment: "Citizen reported sagging high-tension wire with photographic proof.",
        actorRole: "citizen",
        actorName: "K. Raghunath",
        createdAt: "Yesterday, 4:18 PM",
      },
      {
        id: "SH-4",
        status: "Escalated",
        comment: "Auto-escalation triggered: Level 1 SLA breached. Promoted to Level 2 Commissioner queue with critical priority.",
        actorRole: "system",
        actorName: "Nivaran SLA Engine",
        createdAt: "Today, 11:00 AM",
      }
    ],
    comments: [
      { id: "CMT-3", author: "P. Naresh", role: "Citizen", text: "Tractors loaded with sugarcane cannot pass without touching the wire!", created: "Yesterday, 6:30 PM" }
    ],
    reactions: 39,
    confirmed: false,
  },
  {
    id: "NVR-26-01831",
    title: "Collapsed brick culvert and muddy crater road",
    category: "Roads & transport",
    district: "Annamayya District, Andhra Pradesh",
    address: "Main Village Link Road Culvert, Near Railway Crossing, Rajampet",
    location: "Main Village Link Road Culvert, Near Railway Crossing, Rajampet, Annamayya District, Andhra Pradesh",
    lat: 14.1833,
    lng: 79.1667,
    status: "Awaiting confirmation",
    priority: "High",
    currentLevel: 1,
    levelTitle: "Level 1 · Panchayat Raj Road Inspector",
    owner: "Panchayat Raj & Rural Roads · A. Singh",
    due: "Awaiting Citizen Approval",
    slaDeadline: new Date(Date.now() + 86400 * 1000).toISOString(),
    slaSecondsTotal: 86400,
    created: "12 Aug 2026",
    createdAtIso: new Date(Date.now() - 86400 * 2 * 1000).toISOString(),
    description: "The small irrigation culvert collapsed after flood water runoff, leaving a 3-foot deep crater across the main village connection road. Two-wheelers were skidding daily.",
    aiSummary: "Collapsed road culvert and 3ft crater on Rajampet village link road.",
    citizenName: "Chandra Mohan",
    phone: "9885098765",
    imageUrl: "/images/issues/village_pothole_mud_road.jpg",
    resolutionProof: {
      photoUrl: "/images/issues/village_pothole_mud_road.jpg",
      note: "Panchayat engineering squad rebuilt the stone slab culvert, backfilled with gravel aggregate and leveled the approach road.",
      resolvedBy: "A. Singh (Panchayat Raj Road Inspector)",
      resolvedAt: "Today, 09:15 AM",
    },
    escalationLog: [],
    statusHistory: [
      {
        id: "SH-5",
        status: "Submitted",
        comment: "Citizen filed grievance.",
        actorRole: "citizen",
        actorName: "Chandra Mohan",
        createdAt: "12 Aug 2026",
      },
      {
        id: "SH-6",
        status: "Resolved by Official",
        comment: "Panchayat squad completed culvert repair. Evidence photo attached. Moved to Awaiting Citizen Confirmation.",
        actorRole: "official",
        actorName: "A. Singh",
        createdAt: "Today, 09:15 AM",
        proofUrl: "/images/issues/village_pothole_mud_road.jpg",
      }
    ],
    comments: [
      { id: "CMT-4", author: "A. Singh (Official)", role: "Official", text: "Masonry work completed. Please inspect and click confirm on your portal.", created: "Today, 09:16 AM" }
    ],
    reactions: 18,
    confirmed: false,
  },
  {
    id: "NVR-26-01815",
    title: "Broken drinking water handpump mechanism in Dalitwada lane",
    category: "Water & sanitation",
    district: "Markapuram District, Andhra Pradesh",
    address: "Dalitwada Lane, Ward 2, Near Panchayat Office, Markapuram",
    location: "Dalitwada Lane, Ward 2, Near Panchayat Office, Markapuram, Markapuram District, Andhra Pradesh",
    lat: 15.7333,
    lng: 79.2833,
    status: "Submitted",
    priority: "High",
    currentLevel: 1,
    levelTitle: "Level 1 · Ward Junior Engineer & Field Officer",
    owner: "RWS Department · M. Prasad",
    due: "SLA in 85s",
    slaDeadline: new Date(Date.now() + 85 * 1000).toISOString(),
    slaSecondsTotal: 90,
    isDemoSpeed: true,
    created: "Today, 11:30 AM",
    createdAtIso: new Date(Date.now() - 5 * 1000).toISOString(),
    description: "The village borewell handpump platform is cracked and the internal cylinder chain is detached. Women are waiting hours at distant farm bores for water.",
    aiSummary: "Handpump cylinder detached and platform cracked in Markapuram.",
    citizenName: "Subba Rao",
    phone: "9849123456",
    imageUrl: "/images/issues/village_broken_handpump.jpg",
    escalationLog: [],
    statusHistory: [
      {
        id: "SH-7",
        status: "Submitted",
        comment: "Citizen submitted issue with live handpump photo. AI routed to RWS Junior Engineer Prasad.",
        actorRole: "citizen",
        actorName: "Subba Rao",
        createdAt: "Today, 11:30 AM",
      }
    ],
    comments: [],
    reactions: 12,
    confirmed: false,
  },
  {
    id: "NVR-26-01804",
    title: "Flooded muddy farm road with deep crater ruts",
    category: "Roads & transport",
    district: "West Godavari District, Andhra Pradesh",
    address: "Village Canal Bank Road, Near RCM Church, Palakollu",
    location: "Village Canal Bank Road, Near RCM Church, Palakollu, West Godavari District, Andhra Pradesh",
    lat: 16.5333,
    lng: 81.7333,
    status: "Escalated",
    priority: "Critical",
    currentLevel: 3,
    levelTitle: "Level 3 · District Collector & Magistrate",
    owner: "Chief Minister Grievance Cell · Dr. K. Venkata Ramana, IAS",
    due: "Level 3 Collector Oversight",
    slaDeadline: new Date(Date.now() + 300 * 1000).toISOString(),
    slaSecondsTotal: 90,
    isDemoSpeed: true,
    created: "3 Days ago",
    createdAtIso: new Date(Date.now() - 86400 * 3 * 1000).toISOString(),
    description: "The main village mud connector road is inundated with knee-deep water and crater potholes. Ambulances and milk vans cannot reach the village.",
    aiSummary: "Inundated muddy link road with crater potholes blocking transport in Palakollu.",
    citizenName: "Sujatha Reddy",
    phone: "9490123987",
    imageUrl: "/images/issues/village_pothole_mud_road.jpg",
    escalationLog: [
      {
        id: "ESC-2",
        fromLevel: 1,
        toLevel: 2,
        fromTitle: "Level 1: Roads Inspector",
        toTitle: "Level 2: Municipal Commissioner",
        escalatedAt: "2 Days ago",
        reason: "Level 1 team failed to deploy gravel repair within statutory 48h timeline.",
      },
      {
        id: "ESC-3",
        fromLevel: 2,
        toLevel: 3,
        fromTitle: "Level 2: Municipal Commissioner",
        toTitle: "Level 3: District Collector & Grievance Cell",
        escalatedAt: "Yesterday, 5:00 PM",
        reason: "Level 2 Commissioner failed to deploy grader earthmover. Auto-escalated to District Collector apex tier.",
      }
    ],
    statusHistory: [
      {
        id: "SH-8",
        status: "Submitted",
        comment: "Citizen filed complaint.",
        actorRole: "citizen",
        actorName: "Sujatha Reddy",
        createdAt: "3 Days ago",
      },
      {
        id: "SH-9",
        status: "Escalated to Level 2",
        comment: "SLA breached at Roads Inspector tier. Auto-escalated.",
        actorRole: "system",
        actorName: "Nivaran SLA Engine",
        createdAt: "2 Days ago",
      },
      {
        id: "SH-10",
        status: "Escalated to Level 3 (District Collector)",
        comment: "Level 2 SLA breached. Forwarded to District Collector and CM Grievance cell.",
        actorRole: "system",
        actorName: "Nivaran SLA Engine",
        createdAt: "Yesterday, 5:00 PM",
      }
    ],
    comments: [
      { id: "CMT-5", author: "Dr. K. Venkata Ramana, IAS (Collector)", role: "Official", text: "Heavy gravel filling sanctioned under emergency rural road funds. Grader deployed today.", created: "Today, 08:30 AM" }
    ],
    reactions: 54,
    confirmed: false,
  },
  {
    id: "NVR-26-01798",
    title: "Tilted transformer power pole beside village school",
    category: "Electricity",
    district: "Alluri Sitharama Raju District, Andhra Pradesh",
    address: "Beside Ashram Tribal Welfare High School, Paderu",
    location: "Beside Ashram Tribal Welfare High School, Paderu, Alluri Sitharama Raju District, Andhra Pradesh",
    lat: 18.0667,
    lng: 82.5500,
    status: "Resolved",
    priority: "Normal",
    currentLevel: 1,
    levelTitle: "Level 1 · Tribal Welfare Electrical Assistant",
    owner: "APSPDCL · K. Somulu",
    due: "Closed & Confirmed",
    slaDeadline: new Date(Date.now() - 86400 * 1000).toISOString(),
    slaSecondsTotal: 86400,
    created: "10 Aug 2026",
    createdAtIso: new Date(Date.now() - 86400 * 5 * 1000).toISOString(),
    description: "The transformer distribution pole was tilting towards the village lane with dangerous low wires.",
    aiSummary: "Tilted transformer pole aligned and tightened in Alluri Sitharama Raju.",
    citizenName: "M. Gangadhar",
    phone: "9440987123",
    imageUrl: "/images/issues/village_transformer_wires.jpg",
    resolutionProof: {
      photoUrl: "/images/issues/village_transformer_wires.jpg",
      note: "Installed new guy-wire stay set, straightened the pole and tightened all sagging conductors with safety guards.",
      resolvedBy: "K. Somulu (Electrical Assistant)",
      resolvedAt: "11 Aug 2026",
    },
    escalationLog: [],
    statusHistory: [
      {
        id: "SH-11",
        status: "Submitted",
        comment: "Citizen filed grievance.",
        actorRole: "citizen",
        actorName: "M. Gangadhar",
        createdAt: "10 Aug 2026",
      },
      {
        id: "SH-12",
        status: "Resolved by Official",
        comment: "Pole straightened and wires secured.",
        actorRole: "official",
        actorName: "K. Somulu",
        createdAt: "11 Aug 2026",
      },
      {
        id: "SH-13",
        status: "Closed & Confirmed",
        comment: "Citizen M. Gangadhar verified the wire clearance and confirmed 5-star resolution.",
        actorRole: "citizen",
        actorName: "M. Gangadhar",
        createdAt: "11 Aug 2026, 4:00 PM",
      }
    ],
    comments: [],
    reactions: 31,
    confirmed: true,
  },
];

export const apLocations = [
  "Alluri Sitharama Raju District, Andhra Pradesh",
  "Anakapalli District, Andhra Pradesh",
  "Anantapuramu District, Andhra Pradesh",
  "Annamayya District, Andhra Pradesh",
  "Bapatla District, Andhra Pradesh",
  "Chittoor District, Andhra Pradesh",
  "Dr. B. R. Ambedkar Konaseema District, Andhra Pradesh",
  "East Godavari District, Andhra Pradesh",
  "Eluru District, Andhra Pradesh",
  "Guntur District, Andhra Pradesh",
  "Kakinada District, Andhra Pradesh",
  "Krishna District, Andhra Pradesh",
  "Kurnool District, Andhra Pradesh",
  "Markapuram District, Andhra Pradesh",
  "Nandyal District, Andhra Pradesh",
  "NTR District, Andhra Pradesh",
  "Palnadu District, Andhra Pradesh",
  "Parvathipuram Manyam District, Andhra Pradesh",
  "Polavaram District, Andhra Pradesh",
  "Prakasam District, Andhra Pradesh",
  "Sri Potti Sriramulu Nellore District, Andhra Pradesh",
  "Sri Sathya Sai District, Andhra Pradesh",
  "Srikakulam District, Andhra Pradesh",
  "Tirupati District, Andhra Pradesh",
  "Visakhapatnam District, Andhra Pradesh",
  "Vizianagaram District, Andhra Pradesh",
  "West Godavari District, Andhra Pradesh",
  "YSR Kadapa District, Andhra Pradesh"
];
