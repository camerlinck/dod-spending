export type PscType = "Product" | "Service" | "Research and Development";

export interface ObjectClassConfig {
  slug: string;
  label: string;
  description: string;
  drillable: true;
  pscType: PscType;
  pscGroupFilter?: string; // If set, filter to only this 2-char PSC group
  pscGroupLabel?: string;
}

export interface ObjectClassNonDrillable {
  slug: string;
  label: string;
  description: string;
  drillable: false;
  explanation: string;
}

export type ObjectClassDef = ObjectClassConfig | ObjectClassNonDrillable;

export const OBJECT_CLASS_CONFIGS: ObjectClassDef[] = [
  {
    slug: "equipment",
    label: "Equipment",
    description: "Procurement of hardware: aircraft, ships, missiles, vehicles, electronics, and more",
    drillable: true,
    pscType: "Product",
  },
  {
    slug: "supplies-and-materials",
    label: "Supplies and Materials",
    description: "Consumable goods: fuel, ammunition, food, clothing, medical supplies",
    drillable: true,
    pscType: "Product",
  },
  {
    slug: "research-and-development",
    label: "Research and Development Contracts",
    description: "R&D contracts for weapons systems, technology, and science programs",
    drillable: true,
    pscType: "Research and Development",
  },
  {
    slug: "operation-and-maintenance",
    label: "Operation and Maintenance of Equipment",
    description: "Repair, overhaul, and upkeep of military equipment",
    drillable: true,
    pscType: "Service",
    pscGroupFilter: "J",
    pscGroupLabel: "Maintenance, Repair, and Rebuild of Equipment",
  },
  {
    slug: "other-services",
    label: "Other Services from Non-Federal Sources",
    description: "Professional services, IT, healthcare, construction, and logistics",
    drillable: true,
    pscType: "Service",
  },
  {
    slug: "benefits-for-former-personnel",
    label: "Benefits for Former Personnel",
    description: "Military retirement, survivor benefits, TRICARE healthcare for retirees",
    drillable: false,
    explanation:
      "This is mandatory entitlement spending paid directly to retired service members and their families — not contracts. There are no PSC codes or vendor breakdowns available. The data is managed by the Defense Finance and Accounting Service (DFAS) and the Military Retirement Fund.",
  },
  {
    slug: "military-personnel",
    label: "Military Personnel",
    description: "Active duty pay and allowances for uniformed service members",
    drillable: false,
    explanation:
      "Military personnel pay is a direct appropriation — not a contract. Soldiers, sailors, airmen, and Marines receive pay directly from the government. The DoD Comptroller publishes annual personnel strength and pay grade tables, but this data is not available through USASpending.gov contract APIs.",
  },
  {
    slug: "full-time-permanent",
    label: "Full-Time Permanent (Civilian Pay)",
    description: "Salaries for permanent civilian DoD employees",
    drillable: false,
    explanation:
      "Civilian personnel compensation is a direct payroll appropriation, not a contract. No PSC or vendor breakdown is available via USASpending.gov. OPM's FedScope database provides civilian workforce statistics by agency, grade, and occupation.",
  },
  {
    slug: "military-personnel-benefits",
    label: "Military Personnel Benefits",
    description: "Housing allowances, subsistence, and other in-service benefits",
    drillable: false,
    explanation:
      "Benefits such as Basic Allowance for Housing (BAH) and Basic Allowance for Subsistence (BAS) are direct payments to service members — not contracts. These are calculated by pay grade and duty location and managed by DFAS.",
  },
  {
    slug: "other-goods-federal-sources",
    label: "Other Goods and Services from Federal Sources",
    description: "Inter-agency transfers and reimbursable work with other federal agencies",
    drillable: true,
    pscType: "Service",
  },
];

export function getConfig(slug: string): ObjectClassDef | undefined {
  return OBJECT_CLASS_CONFIGS.find((c) => c.slug === slug);
}

// Infer PSC hierarchy path from a 4-char PSC code for use in API filters
export function pscFilterPath(code: string): [string, string, string] {
  const first = code[0].toUpperCase();
  if (first === "A") {
    // R&D codes: AA, AB, AC... followed by 2 digits
    return ["Research and Development", code.slice(0, 2).toUpperCase(), code.toUpperCase()];
  }
  if (first >= "B" && first <= "Z") {
    // Service codes: single letter group + 3 chars
    return ["Service", first, code.toUpperCase()];
  }
  // Product codes: 2-digit group + 2 digits
  return ["Product", code.slice(0, 2), code.toUpperCase()];
}

// PSC group names for display
export const PSC_GROUP_LABELS: Record<string, string> = {
  // Products — Federal Supply Group (FSG) numbers
  "10": "Weapons",
  "11": "Nuclear Ordnance",
  "12": "Fire Control Equipment",
  "13": "Ammunition and Explosives",
  "14": "Guided Missiles",
  "15": "Aerospace Craft",
  "16": "Aerospace Craft Components and Accessories",
  "17": "Aerospace Ground Handling and Servicing Equipment",
  "18": "Space Vehicles",
  "19": "Ships, Small Craft, and Docks",
  "20": "Ship and Marine Equipment",
  "22": "Railway Equipment",
  "23": "Motor Vehicles, Cycles, and Trailers",
  "24": "Tractors",
  "25": "Vehicular Equipment Components",
  "26": "Tires and Tubes",
  "28": "Engines and Turbines",
  "29": "Engine Accessories",
  "30": "Mechanical Power Transmission Equipment",
  "31": "Bearings",
  "32": "Woodworking Machinery and Equipment",
  "34": "Metalworking Machinery",
  "35": "Service and Trade Equipment",
  "36": "Special Industry Machinery",
  "37": "Agricultural Machinery and Equipment",
  "38": "Construction, Mining, and Excavating Equipment",
  "39": "Materials Handling Equipment",
  "40": "Rope, Cable, Chain, and Fittings",
  "41": "Refrigeration, Air Conditioning, and Circulating Equipment",
  "42": "Fire, Rescue, Safety, and Environmental Protection Equipment",
  "43": "Pumps and Compressors",
  "44": "Furnaces, Steam, Drying Equipment, and Nuclear Reactors",
  "45": "Plumbing, Heating, and Waste Disposal Equipment",
  "46": "Water Purification and Sewage Treatment Equipment",
  "47": "Pipe, Tubing, Hose, and Fittings",
  "48": "Valves",
  "49": "Maintenance and Repair Shop Equipment",
  "51": "Hand Tools",
  "52": "Measuring Tools",
  "53": "Hardware and Abrasives",
  "54": "Prefabricated Structures and Scaffolding",
  "55": "Lumber, Millwork, Plywood, and Veneer",
  "56": "Construction and Building Materials",
  "58": "Communication, Detection, and Coherent Radiation Equipment",
  "59": "Electrical and Electronic Equipment Components",
  "60": "Fiber Optics",
  "61": "Electric Wire and Power Distribution Equipment",
  "62": "Lighting Fixtures and Lamps",
  "63": "Alarm, Signal, and Security Detection Systems",
  "65": "Medical, Dental, and Veterinary Equipment and Supplies",
  "66": "Instruments and Laboratory Equipment",
  "67": "Photographic Equipment",
  "68": "Chemicals and Chemical Products",
  "69": "Training Aids and Devices",
  "70": "Information Technology Equipment, Software, and Supplies",
  "71": "Furniture",
  "72": "Household and Commercial Furnishings and Appliances",
  "73": "Food Preparation and Serving Equipment",
  "74": "Office Machines and Visible Record Equipment",
  "75": "Office Supplies and Devices",
  "76": "Books, Maps, and Other Publications",
  "77": "Musical Instruments, Phonographs, and Home Radios",
  "78": "Recreational and Athletic Equipment",
  "79": "Cleaning Equipment and Supplies",
  "80": "Brushes, Paints, Sealers, and Adhesives",
  "81": "Containers, Packaging, and Packing Supplies",
  "83": "Textiles, Leather, Furs, Tents, and Flags",
  "84": "Clothing, Individual Equipment, and Insignia",
  "85": "Toiletries",
  "87": "Agricultural Supplies",
  "88": "Live Animals",
  "89": "Subsistence (Food)",
  "91": "Fuels, Lubricants, Oils, and Waxes",
  "93": "Nonmetallic Fabricated Materials",
  "94": "Nonmetallic Crude Materials",
  "95": "Metal Bars, Sheets, and Shapes",
  "96": "Ores, Minerals, and Primary Products",
  "99": "Miscellaneous Products",
  // Services
  "7A": "IT and Telecom — Applications",
  "7B": "IT and Telecom — Compute",
  "7C": "IT and Telecom — Data Center",
  "7D": "IT and Telecom — Delivery",
  "7E": "IT and Telecom — End User",
  "7F": "IT and Telecom — Financial Management",
  "7G": "IT and Telecom — Health IT",
  "7J": "IT and Telecom — IT Management Support",
  "7K": "IT and Telecom — Knowledge Management",
  "7L": "IT and Telecom — Modeling and Simulation",
  "7M": "IT and Telecom — Network Support",
  "7N": "IT and Telecom — Satellite",
  "7P": "IT and Telecom — Platform IT",
  "7Q": "IT and Telecom — Quality Assurance",
  "7R": "IT and Telecom — Radio Frequency",
  "7S": "IT and Telecom — Security and Compliance",
  "7T": "IT and Telecom — Telecommunications",
  B: "Special Studies and Analysis (not R&D)",
  C: "Architect and Engineer Services",
  D: "IT and Telecommunications",
  E: "Purchase of Structures and Facilities",
  F: "Natural Resources Management",
  G: "Social Services",
  H: "Quality Control, Test, and Inspection",
  J: "Maintenance, Repair, and Rebuild of Equipment",
  K: "Modification of Equipment",
  L: "Technical Representative Services",
  M: "Operation of Government-Owned Facilities",
  N: "Installation of Equipment",
  P: "Salvage Services",
  Q: "Medical Services",
  R: "Professional, Administrative, and Management Support",
  S: "Utilities and Housekeeping Services",
  T: "Photography, Mapping, Printing, and Publications",
  U: "Education and Training",
  V: "Transportation, Travel, and Relocation",
  W: "Lease or Rental of Equipment",
  X: "Lease or Rental of Facilities",
  Y: "Construction of Structures and Facilities",
  Z: "Maintenance, Repair, and Alteration of Real Property",
  // R&D
  AA: "Agriculture R&D",
  AB: "Community and Regional Development R&D",
  AC: "National Defense R&D",
  AD: "Defense (Other) R&D",
  AE: "Economic Growth/Productivity R&D",
  AG: "Energy R&D",
  AJ: "General Science and Technology R&D",
  AN: "Health R&D",
  AR: "Space R&D",
  AS: "Transportation R&D",
};
