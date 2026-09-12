import {
  BusinessSettings,
  DeviceBrand,
  DeviceModel,
  RepairIssue,
  ServiceArea,
  CustomerReview,
  FAQItem,
  Technician,
  RepairRequestLead
} from '../types';

export const INITIAL_SETTINGS: BusinessSettings = {
  businessName: 'SS Care Technology',
  tagline: "Bangalore's Doorstep Electronics Repair Service",
  phone: '+91 98801 23456',
  whatsappNumber: '919880123456',
  email: 'support@sscaretechnology.com',
  address: '#42, 80 Feet Main Road, 4th Block, Koramangala',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560034',
  googleMapsUrl: 'https://maps.google.com/?q=Koramangala+Bengaluru',
  businessHours: 'Monday – Sunday: 9:00 AM – 9:00 PM',
  defaultWarranty: 'Up to 6 Months Genuine Warranty',
  currency: '₹',
  timezone: 'Asia/Kolkata',
  heroHeadline: 'Electronics Repair at Your Doorstep in Bangalore',
  heroSubheadline: 'Cracked screen? Dead battery? Charging problem? Certified technicians visit your home or office across Bangalore.',
  trustMetrics: {
    repairsCompleted: '14,800+',
    warrantyDays: '180 Days',
    certifiedTechs: '35+ Experts',
    avgRating: '4.9 ★'
  }
};

export const INITIAL_BRANDS: DeviceBrand[] = [
  // Phones
  { id: 'b-apple-phone', name: 'Apple iPhone', category: 'phones', active: true, sortOrder: 1 },
  { id: 'b-samsung-phone', name: 'Samsung Galaxy', category: 'phones', active: true, sortOrder: 2 },
  { id: 'b-oneplus-phone', name: 'OnePlus', category: 'phones', active: true, sortOrder: 3 },
  { id: 'b-xiaomi-phone', name: 'Xiaomi / Redmi', category: 'phones', active: true, sortOrder: 4 },
  { id: 'b-pixel-phone', name: 'Google Pixel', category: 'phones', active: true, sortOrder: 5 },
  { id: 'b-realme-phone', name: 'Realme', category: 'phones', active: true, sortOrder: 6 },
  { id: 'b-vivo-phone', name: 'Vivo', category: 'phones', active: true, sortOrder: 7 },
  { id: 'b-oppo-phone', name: 'Oppo', category: 'phones', active: true, sortOrder: 8 },
  { id: 'b-nothing-phone', name: 'Nothing', category: 'phones', active: true, sortOrder: 9 },
  { id: 'b-motorola-phone', name: 'Motorola', category: 'phones', active: true, sortOrder: 10 },
  
  // Laptops
  { id: 'b-apple-mac', name: 'Apple MacBook', category: 'laptops', active: true, sortOrder: 1 },
  { id: 'b-dell-lap', name: 'Dell', category: 'laptops', active: true, sortOrder: 2 },
  { id: 'b-hp-lap', name: 'HP', category: 'laptops', active: true, sortOrder: 3 },
  { id: 'b-lenovo-lap', name: 'Lenovo', category: 'laptops', active: true, sortOrder: 4 },
  { id: 'b-asus-lap', name: 'Asus / ROG', category: 'laptops', active: true, sortOrder: 5 },
  { id: 'b-acer-lap', name: 'Acer', category: 'laptops', active: true, sortOrder: 6 },
  { id: 'b-surface-lap', name: 'Microsoft Surface', category: 'laptops', active: true, sortOrder: 7 },
  { id: 'b-msi-lap', name: 'MSI', category: 'laptops', active: true, sortOrder: 8 },

  // Tablets
  { id: 'b-apple-ipad', name: 'Apple iPad', category: 'tablets', active: true, sortOrder: 1 },
  { id: 'b-samsung-tab', name: 'Samsung Tab', category: 'tablets', active: true, sortOrder: 2 },
  { id: 'b-lenovo-tab', name: 'Lenovo Tab', category: 'tablets', active: true, sortOrder: 3 },
  { id: 'b-xiaomi-tab', name: 'Xiaomi Pad', category: 'tablets', active: true, sortOrder: 4 },

  // Desktops
  { id: 'b-custom-pc', name: 'Custom Gaming PC / Workstation', category: 'desktops', active: true, sortOrder: 1 },
  { id: 'b-apple-imac', name: 'Apple iMac / Mac Mini', category: 'desktops', active: true, sortOrder: 2 },
  { id: 'b-dell-desk', name: 'Dell Desktop / OptiPlex', category: 'desktops', active: true, sortOrder: 3 },
  { id: 'b-hp-desk', name: 'HP Pavilion / Omen', category: 'desktops', active: true, sortOrder: 4 },

  // Gaming Consoles
  { id: 'b-sony-ps', name: 'Sony PlayStation (PS5 / PS4)', category: 'consoles', active: true, sortOrder: 1 },
  { id: 'b-xbox', name: 'Microsoft Xbox (Series X / S / One)', category: 'consoles', active: true, sortOrder: 2 },
  { id: 'b-nintendo', name: 'Nintendo Switch', category: 'consoles', active: true, sortOrder: 3 }
];

export const INITIAL_MODELS: DeviceModel[] = [
  // iPhone
  { id: 'm-ip15p', brandId: 'b-apple-phone', brandName: 'Apple iPhone', name: 'iPhone 15 Pro / Pro Max', category: 'phones', active: true },
  { id: 'm-ip15', brandId: 'b-apple-phone', brandName: 'Apple iPhone', name: 'iPhone 15 / 15 Plus', category: 'phones', active: true },
  { id: 'm-ip14p', brandId: 'b-apple-phone', brandName: 'Apple iPhone', name: 'iPhone 14 Pro / Pro Max', category: 'phones', active: true },
  { id: 'm-ip14', brandId: 'b-apple-phone', brandName: 'Apple iPhone', name: 'iPhone 14 / 14 Plus', category: 'phones', active: true },
  { id: 'm-ip13p', brandId: 'b-apple-phone', brandName: 'Apple iPhone', name: 'iPhone 13 Pro / Pro Max', category: 'phones', active: true },
  { id: 'm-ip13', brandId: 'b-apple-phone', brandName: 'Apple iPhone', name: 'iPhone 13 / 13 Mini', category: 'phones', active: true },
  { id: 'm-ip12', brandId: 'b-apple-phone', brandName: 'Apple iPhone', name: 'iPhone 12 / 12 Pro', category: 'phones', active: true },
  { id: 'm-ip11', brandId: 'b-apple-phone', brandName: 'Apple iPhone', name: 'iPhone 11 / 11 Pro', category: 'phones', active: true },
  
  // Samsung
  { id: 'm-s24u', brandId: 'b-samsung-phone', brandName: 'Samsung Galaxy', name: 'Galaxy S24 Ultra / S24', category: 'phones', active: true },
  { id: 'm-s23u', brandId: 'b-samsung-phone', brandName: 'Samsung Galaxy', name: 'Galaxy S23 Ultra / S23', category: 'phones', active: true },
  { id: 'm-s22u', brandId: 'b-samsung-phone', brandName: 'Samsung Galaxy', name: 'Galaxy S22 Series', category: 'phones', active: true },
  { id: 'm-zf5', brandId: 'b-samsung-phone', brandName: 'Samsung Galaxy', name: 'Galaxy Z Fold / Flip 5', category: 'phones', active: true },
  { id: 'm-sam-a', brandId: 'b-samsung-phone', brandName: 'Samsung Galaxy', name: 'Galaxy A-Series (A54 / A34)', category: 'phones', active: true },

  // OnePlus
  { id: 'm-op12', brandId: 'b-oneplus-phone', brandName: 'OnePlus', name: 'OnePlus 12 / 12R', category: 'phones', active: true },
  { id: 'm-op11', brandId: 'b-oneplus-phone', brandName: 'OnePlus', name: 'OnePlus 11 / 11R', category: 'phones', active: true },
  { id: 'm-op-nord', brandId: 'b-oneplus-phone', brandName: 'OnePlus', name: 'OnePlus Nord 3 / CE Series', category: 'phones', active: true },

  // MacBook
  { id: 'm-mb-m3', brandId: 'b-apple-mac', brandName: 'Apple MacBook', name: 'MacBook Pro M3 / M2 (14"/16")', category: 'laptops', active: true },
  { id: 'm-mb-air-m2', brandId: 'b-apple-mac', brandName: 'Apple MacBook', name: 'MacBook Air M2 / M1 (13"/15")', category: 'laptops', active: true },
  { id: 'm-mb-intel', brandId: 'b-apple-mac', brandName: 'Apple MacBook', name: 'MacBook Pro / Air (Intel Core Series)', category: 'laptops', active: true },

  // Dell
  { id: 'm-dell-xps', brandId: 'b-dell-lap', brandName: 'Dell', name: 'Dell XPS 13 / 15 / 17', category: 'laptops', active: true },
  { id: 'm-dell-insp', brandId: 'b-dell-lap', brandName: 'Dell', name: 'Dell Inspiron 14 / 15 / 16', category: 'laptops', active: true },
  { id: 'm-dell-alien', brandId: 'b-dell-lap', brandName: 'Dell', name: 'Dell Alienware / G-Series', category: 'laptops', active: true },

  // HP
  { id: 'm-hp-spectre', brandId: 'b-hp-lap', brandName: 'HP', name: 'HP Spectre x360 / Envy', category: 'laptops', active: true },
  { id: 'm-hp-pavilion', brandId: 'b-hp-lap', brandName: 'HP', name: 'HP Pavilion / 14s / 15s', category: 'laptops', active: true },
  { id: 'm-hp-omen', brandId: 'b-hp-lap', brandName: 'HP', name: 'HP Omen / Victus Gaming', category: 'laptops', active: true },

  // iPad
  { id: 'm-ipad-pro', brandId: 'b-apple-ipad', brandName: 'Apple iPad', name: 'iPad Pro 11" / 12.9" (M1/M2)', category: 'tablets', active: true },
  { id: 'm-ipad-air', brandId: 'b-apple-ipad', brandName: 'Apple iPad', name: 'iPad Air (5th / 4th Gen)', category: 'tablets', active: true },
  { id: 'm-ipad-10', brandId: 'b-apple-ipad', brandName: 'Apple iPad', name: 'iPad 10th / 9th Gen', category: 'tablets', active: true },

  // Consoles
  { id: 'm-ps5', brandId: 'b-sony-ps', brandName: 'Sony PlayStation (PS5 / PS4)', name: 'PlayStation 5 (Disc / Digital)', category: 'consoles', active: true },
  { id: 'm-ps4', brandId: 'b-sony-ps', brandName: 'Sony PlayStation (PS5 / PS4)', name: 'PlayStation 4 / Pro / Slim', category: 'consoles', active: true },
  { id: 'm-xbox-x', brandId: 'b-xbox', brandName: 'Microsoft Xbox (Series X / S / One)', name: 'Xbox Series X / Series S', category: 'consoles', active: true }
];

export const INITIAL_REPAIRS: RepairIssue[] = [
  // Phone Issues
  { id: 'r-ph-screen', category: 'phones', name: 'Cracked Screen / Display Glass Replacement', description: 'Original Grade OLED/LCD with touch sensor calibration & true tone retention.', estimatedTime: '45 mins', startingPrice: 1799, warrantyPeriod: '6 Months', popular: true, active: true },
  { id: 'r-ph-battery', category: 'phones', name: 'Battery Drain / Replacement', description: 'OEM certified lithium-ion cells with 100% health guarantee & zero risk.', estimatedTime: '30 mins', startingPrice: 1299, warrantyPeriod: '6 Months', popular: true, active: true },
  { id: 'r-ph-charging', category: 'phones', name: 'Charging Port & Mic Flex Issue', description: 'Deep port cleaning, flex replacement or board soldering for fast charge restoration.', estimatedTime: '35 mins', startingPrice: 899, warrantyPeriod: '3 Months', active: true },
  { id: 'r-ph-camera', category: 'phones', name: 'Back / Front Camera & Glass Lens', description: 'Camera module lens replacement, blur fix or OIS stabilizer repair.', estimatedTime: '40 mins', startingPrice: 1499, warrantyPeriod: '3 Months', active: true },
  { id: 'r-ph-backglass', category: 'phones', name: 'Back Glass Housing Replacement', description: 'Laser back glass removal and precision bonding to restore factory look.', estimatedTime: '60 mins', startingPrice: 1399, warrantyPeriod: '3 Months', active: true },
  { id: 'r-ph-water', category: 'phones', name: 'Water / Liquid Damage Diagnosis', description: 'Ultrasonic chemical bath cleaning, board short-circuit repair and data recovery.', estimatedTime: '2 hours', startingPrice: 999, warrantyPeriod: '1 Month', active: true },
  { id: 'r-ph-motherboard', category: 'phones', name: 'Motherboard IC / Chip-Level Repair', description: 'Power IC, Audio IC, or network baseband soldering by master technicians.', estimatedTime: '2-4 hours', startingPrice: 2499, warrantyPeriod: '3 Months', active: true },

  // Laptop Issues
  { id: 'r-lap-screen', category: 'laptops', name: 'Broken Screen / Panel Replacement', description: 'FHD, 2K, 4K or Retina display panel replacement for all laptop brands.', estimatedTime: '60 mins', startingPrice: 3499, warrantyPeriod: '6 Months', popular: true, active: true },
  { id: 'r-lap-battery', category: 'laptops', name: 'Laptop Battery Replacement', description: 'Original high-capacity battery packs tested for maximum backup.', estimatedTime: '30 mins', startingPrice: 2199, warrantyPeriod: '6 Months', popular: true, active: true },
  { id: 'r-lap-keyboard', category: 'laptops', name: 'Keyboard / Trackpad Replacement', description: 'Individual key repair or full backlit keyboard replacement.', estimatedTime: '45 mins', startingPrice: 1499, warrantyPeriod: '3 Months', active: true },
  { id: 'r-lap-hinge', category: 'laptops', name: 'Broken Hinge & Body Fabrication', description: 'Structural hinge reconstruction, metal fabrication, and panel tightening.', estimatedTime: '90 mins', startingPrice: 1299, warrantyPeriod: '6 Months', active: true },
  { id: 'r-lap-fan', category: 'laptops', name: 'Overheating, Fan Noise & Thermal Paste', description: 'Internal deep heat sink de-dusting, fan lubrication, Arctic MX-4 thermal repaste.', estimatedTime: '45 mins', startingPrice: 899, warrantyPeriod: '3 Months', popular: true, active: true },
  { id: 'r-lap-upgrade', category: 'laptops', name: 'SSD & RAM Performance Upgrade', description: 'NVMe M.2 high-speed SSD cloning and RAM expansion for 5x speed boost.', estimatedTime: '45 mins', startingPrice: 1899, warrantyPeriod: '3 Years (Parts)', popular: true, active: true },
  { id: 'r-lap-board', category: 'laptops', name: 'No Power / Motherboard Chip-Level Repair', description: 'MOSFET, charging IC, or BIOS reprogramming for dead laptops.', estimatedTime: '2-4 hours', startingPrice: 2799, warrantyPeriod: '3 Months', active: true },

  // Tablet Issues
  { id: 'r-tab-screen', category: 'tablets', name: 'iPad / Tablet Digitizer Glass & Display', description: 'Precision glass lamination or complete LCD assembly swap.', estimatedTime: '60 mins', startingPrice: 2899, warrantyPeriod: '6 Months', popular: true, active: true },
  { id: 'r-tab-battery', category: 'tablets', name: 'Tablet Battery Replacement', description: 'High endurance battery cells replacement with safe adhesive dissolution.', estimatedTime: '50 mins', startingPrice: 2299, warrantyPeriod: '6 Months', active: true },

  // Desktop Issues
  { id: 'r-desk-power', category: 'desktops', name: 'PC Not Powering On / SMPS Failure', description: 'Power supply diagnostic, voltage testing and modular SMPS replacement.', estimatedTime: '45 mins', startingPrice: 999, warrantyPeriod: '6 Months', active: true },
  { id: 'r-desk-gpu', category: 'desktops', name: 'Graphics Card / Display Artifacts Diagnostic', description: 'PCIe slot check, GPU thermal service, or display artifact remediation.', estimatedTime: '60 mins', startingPrice: 1499, warrantyPeriod: '3 Months', active: true },
  { id: 'r-desk-os', category: 'desktops', name: 'Windows / Linux OS Reinstallation & Data Backup', description: 'Clean OS install, driver optimization, virus purge, and secure file transfer.', estimatedTime: '60 mins', startingPrice: 799, warrantyPeriod: '1 Month', active: true },

  // Console Issues
  { id: 'r-con-hdmi', category: 'consoles', name: 'PS5 / Xbox HDMI Port Replacement', description: 'Micro-soldering of torn HDMI ports supporting 4K 120Hz output.', estimatedTime: '90 mins', startingPrice: 2499, warrantyPeriod: '3 Months', popular: true, active: true },
  { id: 'r-con-drift', category: 'consoles', name: 'DualSense / Controller Stick Drift Fix', description: 'Hall-effect or ALPS analog stick replacement to permanently end drift.', estimatedTime: '45 mins', startingPrice: 999, warrantyPeriod: '3 Months', active: true },
  { id: 'r-con-thermal', category: 'consoles', name: 'Console Deep Cleaning & Liquid Metal Servicing', description: 'Complete fan teardown and liquid metal repaste to eliminate shutting down.', estimatedTime: '90 mins', startingPrice: 1899, warrantyPeriod: '3 Months', active: true }
];

export const INITIAL_BANGALORE_AREAS: ServiceArea[] = [
  { id: 'a-kor', name: 'Koramangala', pincode: '560034', zone: 'South', active: true, serviceEta: '30 – 60 Mins', serviceFee: 0 },
  { id: 'a-ind', name: 'Indiranagar', pincode: '560038', zone: 'East', active: true, serviceEta: '30 – 60 Mins', serviceFee: 0 },
  { id: 'a-hsr', name: 'HSR Layout', pincode: '560102', zone: 'South', active: true, serviceEta: '30 – 60 Mins', serviceFee: 0 },
  { id: 'a-whi', name: 'Whitefield', pincode: '560066', zone: 'East', active: true, serviceEta: '45 – 90 Mins', serviceFee: 0 },
  { id: 'a-jay', name: 'Jayanagar', pincode: '560011', zone: 'South', active: true, serviceEta: '30 – 60 Mins', serviceFee: 0 },
  { id: 'a-mar', name: 'Marathahalli', pincode: '560037', zone: 'East', active: true, serviceEta: '45 – 75 Mins', serviceFee: 0 },
  { id: 'a-bel', name: 'Bellandur', pincode: '560103', zone: 'East', active: true, serviceEta: '30 – 60 Mins', serviceFee: 0 },
  { id: 'a-sar', name: 'Sarjapur Road', pincode: '560035', zone: 'East', active: true, serviceEta: '45 – 75 Mins', serviceFee: 0 },
  { id: 'a-ele', name: 'Electronic City', pincode: '560100', zone: 'South', active: true, serviceEta: '45 – 90 Mins', serviceFee: 0 },
  { id: 'a-jpn', name: 'JP Nagar', pincode: '560078', zone: 'South', active: true, serviceEta: '30 – 60 Mins', serviceFee: 0 },
  { id: 'a-btm', name: 'BTM Layout', pincode: '560076', zone: 'South', active: true, serviceEta: '30 – 60 Mins', serviceFee: 0 },
  { id: 'a-ban', name: 'Bannerghatta Road', pincode: '560076', zone: 'South', active: true, serviceEta: '45 – 75 Mins', serviceFee: 0 },
  { id: 'a-heb', name: 'Hebbal', pincode: '560024', zone: 'North', active: true, serviceEta: '60 – 90 Mins', serviceFee: 0 },
  { id: 'a-yel', name: 'Yelahanka', pincode: '560064', zone: 'North', active: true, serviceEta: '60 – 120 Mins', serviceFee: 0 },
  { id: 'a-raj', name: 'Rajajinagar', pincode: '560010', zone: 'West', active: true, serviceEta: '45 – 75 Mins', serviceFee: 0 },
  { id: 'a-mal', name: 'Malleswaram', pincode: '560003', zone: 'West', active: true, serviceEta: '45 – 75 Mins', serviceFee: 0 }
];

export const INITIAL_TECHNICIANS: Technician[] = [
  {
    id: 'tech-01',
    name: 'Karthik Ramanathan',
    phone: '+91 98450 11223',
    skills: ['phones', 'tablets'],
    serviceAreas: ['Koramangala', 'HSR Layout', 'BTM Layout', 'Bellandur'],
    availability: 'AVAILABLE',
    rating: 4.9,
    totalJobs: 412,
    active: true
  },
  {
    id: 'tech-02',
    name: 'Syed Imran',
    phone: '+91 97420 33445',
    skills: ['laptops', 'desktops'],
    serviceAreas: ['Indiranagar', 'Whitefield', 'Marathahalli', 'Sarjapur Road'],
    availability: 'AVAILABLE',
    rating: 4.9,
    totalJobs: 520,
    active: true
  },
  {
    id: 'tech-03',
    name: 'Praveen Kumar B',
    phone: '+91 99010 55667',
    skills: ['phones', 'consoles', 'tablets'],
    serviceAreas: ['Jayanagar', 'JP Nagar', 'Bannerghatta Road'],
    availability: 'AVAILABLE',
    rating: 4.8,
    totalJobs: 330,
    active: true
  },
  {
    id: 'tech-04',
    name: 'Deepak V',
    phone: '+91 96320 77889',
    skills: ['laptops', 'desktops', 'consoles'],
    serviceAreas: ['Hebbal', 'Yelahanka', 'Malleswaram', 'Rajajinagar'],
    availability: 'AVAILABLE',
    rating: 5.0,
    totalJobs: 285,
    active: true
  }
];

export const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-01',
    customerName: 'Arjun Venkatesh',
    locality: 'Koramangala 4th Block',
    device: 'iPhone 14 Pro',
    repair: 'Screen Replacement',
    reviewText: 'Technician Karthik came to my apartment within 45 minutes of submitting the quote. He replaced the screen right in front of me on the dining table. True tone works perfectly, exactly as promised.',
    rating: 5,
    verified: true,
    source: 'Verified Google Review',
    date: '2 days ago',
    active: true
  },
  {
    id: 'rev-02',
    customerName: 'Dr. Sneha Hegde',
    locality: 'Indiranagar 100ft Road',
    device: 'MacBook Air M1',
    repair: 'Battery Drain Issue',
    reviewText: 'My MacBook battery was expanding and dying within 20 mins. SS Care came to my clinic in Indiranagar, swapped the battery with a certified replacement, and gave a 6-month warranty card right away.',
    rating: 5,
    verified: true,
    source: 'Verified Customer',
    date: '4 days ago',
    active: true
  },
  {
    id: 'rev-03',
    customerName: 'Naveen Reddy',
    locality: 'HSR Layout Sector 2',
    device: 'OnePlus 11R',
    repair: 'Display & Back Glass',
    reviewText: 'Very transparent process. The quote showed starting price ₹1,799 and the final cost was confirmed beforehand. No surprise charges. Saved me 3 hours of Bangalore traffic.',
    rating: 5,
    verified: true,
    source: 'WhatsApp Review',
    date: '1 week ago',
    active: true
  },
  {
    id: 'rev-04',
    customerName: 'Rohan Deshmukh',
    locality: 'Whitefield Outer Ring Road',
    device: 'PlayStation 5',
    repair: 'HDMI Port Micro-soldering',
    reviewText: 'My PS5 HDMI pins were destroyed after a move. Technician did the repair cleanly, showed me 4K output working on the TV, and verified the cooling fan. Outstanding doorstep service.',
    rating: 5,
    verified: true,
    source: 'Verified Google Review',
    date: '1 week ago',
    active: true
  }
];

export const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Do you repair at my home or office in Bangalore?',
    answer: 'Yes! SS Care Technology is 100% doorstep. Our certified technicians carry all professional diagnostic tools, anti-static mats, and OEM-grade parts directly to your residence or workplace in Bangalore.',
    sortOrder: 1,
    active: true
  },
  {
    id: 'faq-2',
    question: "What's the warranty on parts and labor?",
    answer: 'We provide up to 6 Months genuine warranty on display screens and batteries, and 3 months on board repairs. You receive a digital warranty certificate with instant claim support over WhatsApp.',
    sortOrder: 2,
    active: true
  },
  {
    id: 'faq-3',
    question: 'How fast can a technician visit my location?',
    answer: 'In major Bangalore hubs like Koramangala, Indiranagar, HSR Layout, and Bellandur, our technicians typically arrive within 45 to 90 minutes of appointment confirmation.',
    sortOrder: 3,
    active: true
  },
  {
    id: 'faq-4',
    question: 'Is there any call-out or doorstep visitation fee?',
    answer: 'Doorstep visit and basic inspection are completely FREE if you proceed with the repair. If you choose not to proceed after diagnosis, a minimal diagnosis fee of ₹299 applies for technician travel time.',
    sortOrder: 4,
    active: true
  },
  {
    id: 'faq-5',
    question: 'What if my device model is not listed in the quote wizard?',
    answer: 'No problem! You can select "Other / Not Listed" or message us directly via WhatsApp. Our master technician will identify the exact part availability and provide a custom quote in minutes.',
    sortOrder: 5,
    active: true
  },
  {
    id: 'faq-6',
    question: 'Is my data safe during the repair?',
    answer: 'Yes, 100%. We never ask for your device passcode unless strictly necessary for functional testing (like camera/speaker testing), and all repairs are performed transparently right in front of your eyes.',
    sortOrder: 6,
    active: true
  }
];

export const INITIAL_DEMO_LEADS: RepairRequestLead[] = [
  {
    id: 'SSC-20260911-001',
    customerName: 'Farhan Shariff',
    phone: '+91 98765 43210',
    whatsappNumber: '919876543210',
    email: 'farhan@example.com',
    address: 'Flat 302, Prestige Ferns, Bellandur',
    locality: 'Bellandur',
    pincode: '560103',
    addressType: 'Home',
    category: 'phones',
    brand: 'Apple iPhone',
    model: 'iPhone 14 Pro / Pro Max',
    repairIssue: 'Cracked Screen / Display Glass Replacement',
    notes: 'Phone dropped yesterday, touch works partially.',
    quotedStartingPrice: 1799,
    approvedFinalPrice: 2899,
    preferredDate: 'Today',
    preferredTime: '04:00 PM – 06:00 PM',
    status: 'IN_PROGRESS',
    jobStatus: 'ARRIVED',
    assignedTechnicianId: 'tech-01',
    assignedTechnicianName: 'Karthik Ramanathan',
    serviceOtp: '5824',
    diagnosisNotes: 'Original OLED intact, top touch digitizer glass cracked. Replacing with OEM laminated display assembly.',
    sourcePage: 'Homepage Quote Wizard',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    statusHistory: [
      { previousStatus: 'NEW', newStatus: 'ASSIGNED', timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(), updatedBy: 'Admin Dispatch' },
      { previousStatus: 'ASSIGNED', newStatus: 'IN_PROGRESS', timestamp: new Date(Date.now() - 3600000 * 0.5).toISOString(), updatedBy: 'Karthik Ramanathan', note: 'Customer verified OTP 5824' }
    ]
  },
  {
    id: 'SSC-20260911-002',
    customerName: 'Meera Nambiar',
    phone: '+91 98451 99887',
    whatsappNumber: '919845199887',
    email: 'meera.n@example.com',
    address: 'House #12, 5th Cross, 6th Main, Indiranagar',
    locality: 'Indiranagar',
    pincode: '560038',
    addressType: 'Office',
    category: 'laptops',
    brand: 'Apple MacBook',
    model: 'MacBook Air M2 / M1 (13"/15")',
    repairIssue: 'Overheating, Fan Noise & Thermal Paste',
    quotedStartingPrice: 899,
    preferredDate: 'Today',
    preferredTime: '06:00 PM – 08:00 PM',
    status: 'ASSIGNED',
    jobStatus: 'ON_THE_WAY',
    assignedTechnicianId: 'tech-02',
    assignedTechnicianName: 'Syed Imran',
    serviceOtp: '8932',
    sourcePage: 'Laptop Repair Landing',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
    statusHistory: [
      { previousStatus: 'NEW', newStatus: 'ASSIGNED', timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), updatedBy: 'Admin Dispatch' }
    ]
  },
  {
    id: 'SSC-20260911-003',
    customerName: 'Aditya Rao',
    phone: '+91 97312 66554',
    whatsappNumber: '919731266554',
    email: 'aditya.r@example.com',
    address: 'Tower B, Salarpuria Greenage, Hosur Rd',
    locality: 'HSR Layout',
    pincode: '560102',
    addressType: 'Home',
    category: 'phones',
    brand: 'Samsung Galaxy',
    model: 'Galaxy S23 Ultra / S23',
    repairIssue: 'Battery Drain / Replacement',
    quotedStartingPrice: 1299,
    preferredDate: 'Tomorrow',
    preferredTime: '10:00 AM – 12:00 PM',
    status: 'NEW',
    sourcePage: 'Homepage Hero',
    createdAt: new Date(Date.now() - 3600000 * 0.8).toISOString(),
    updatedAt: new Date().toISOString(),
    statusHistory: [
      { previousStatus: 'NONE', newStatus: 'NEW', timestamp: new Date(Date.now() - 3600000 * 0.8).toISOString(), updatedBy: 'Customer Online' }
    ]
  }
];
