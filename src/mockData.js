// Initial data for AssetFlow ERP System

export const INITIAL_DEPARTMENTS = [
  { id: 'd1', name: 'Engineering', head: 'John Doe', assetCount: 14 },
  { id: 'd2', name: 'Design & UX', head: 'Sarah Connor', assetCount: 6 },
  { id: 'd3', name: 'Operations', head: 'Robert Vance', assetCount: 8 },
  { id: 'd4', name: 'Human Resources', head: 'Emma Watson', assetCount: 4 },
  { id: 'd5', name: 'Finance & Legal', head: 'Harvey Specter', assetCount: 5 }
];

export const INITIAL_CATEGORIES = [
  { id: 'c1', name: 'Laptops & Workstations', icon: 'Laptop', assetCount: 18, description: 'High-performance laptops, desktops, and developer rigs' },
  { id: 'c2', name: 'Conference Rooms', icon: 'Video', assetCount: 4, description: 'Shared meeting rooms with AV equipment' },
  { id: 'c3', name: 'Office Furniture', icon: 'Armchair', assetCount: 12, description: 'Ergonomic chairs, standing desks, and modular tables' },
  { id: 'c4', name: 'Vehicles', icon: 'Car', assetCount: 3, description: 'Company cars, vans, and utility vehicles' },
  { id: 'c5', name: 'AV & Presentation', icon: 'Projector', assetCount: 6, description: 'Projectors, display screens, microphones, and speakers' },
  { id: 'c6', name: 'Lab Equipment', icon: 'FlaskConical', assetCount: 5, description: 'Hardware testing tools, oscilloscopes, and simulators' }
];

export const INITIAL_EMPLOYEES = [
  { id: 'e1', name: 'Alex Harrison', email: 'alex.h@assetflow.com', role: 'Admin', departmentId: 'd3', phone: '+1 (555) 019-2831', joinedDate: '2023-01-15', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60' },
  { id: 'e2', name: 'Marcus Brody', email: 'marcus.b@assetflow.com', role: 'Asset Manager', departmentId: 'd3', phone: '+1 (555) 014-9922', joinedDate: '2023-03-10', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60' },
  { id: 'e3', name: 'John Doe', email: 'john.d@assetflow.com', role: 'Department Head', departmentId: 'd1', phone: '+1 (555) 012-3456', joinedDate: '2022-05-18', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60' },
  { id: 'e4', name: 'Sarah Connor', email: 'sarah.c@assetflow.com', role: 'Department Head', departmentId: 'd2', phone: '+1 (555) 019-8765', joinedDate: '2022-09-01', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60' },
  { id: 'e5', name: 'Emma Watson', email: 'emma.w@assetflow.com', role: 'Department Head', departmentId: 'd4', phone: '+1 (555) 011-2233', joinedDate: '2023-06-20', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=60' },
  { id: 'e6', name: 'David Kim', email: 'david.k@assetflow.com', role: 'Employee', departmentId: 'd1', phone: '+1 (555) 013-4455', joinedDate: '2024-01-10', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=60' },
  { id: 'e7', name: 'Elena Rostova', email: 'elena.r@assetflow.com', role: 'Employee', departmentId: 'd1', phone: '+1 (555) 015-6677', joinedDate: '2024-02-15', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60' },
  { id: 'e8', name: 'Robert Vance', email: 'robert.v@assetflow.com', role: 'Department Head', departmentId: 'd3', phone: '+1 (555) 018-9900', joinedDate: '2022-01-20', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60' },
  { id: 'e9', name: 'Harvey Specter', email: 'harvey.s@assetflow.com', role: 'Department Head', departmentId: 'd5', phone: '+1 (555) 017-7788', joinedDate: '2022-08-12', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=60' },
  { id: 'e10', name: 'Mike Ross', email: 'mike.r@assetflow.com', role: 'Employee', departmentId: 'd5', phone: '+1 (555) 016-6655', joinedDate: '2023-11-01', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=60' }
];

export const INITIAL_ASSETS = [
  {
    id: 'a1',
    name: 'MacBook Pro M3 Max 16"',
    tag: 'AF-0001',
    serialNumber: 'C02F93JKL8P1',
    category: 'Laptops & Workstations',
    purchaseDate: '2024-01-15',
    purchaseCost: 3499,
    condition: 'New',
    location: 'San Francisco - HQ Floor 3',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop&q=60',
    qrCode: 'AF-0001-C02F93JKL8P1',
    isBookable: false,
    status: 'Allocated',
    currentOwnerId: 'e6', // David Kim
    departmentId: 'd1',
    expectedReturnDate: '2026-01-15'
  },
  {
    id: 'a2',
    name: 'ThinkPad X1 Carbon Gen 11',
    tag: 'AF-0002',
    serialNumber: 'PF49B8X2',
    category: 'Laptops & Workstations',
    purchaseDate: '2023-11-10',
    purchaseCost: 1899,
    condition: 'Good',
    location: 'San Francisco - HQ Floor 3',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300&auto=format&fit=crop&q=60',
    qrCode: 'AF-0002-PF49B8X2',
    isBookable: false,
    status: 'Allocated',
    currentOwnerId: 'e7', // Elena Rostova
    departmentId: 'd1',
    expectedReturnDate: '2025-07-01' // Overdue since current date is 2026-07-12
  },
  {
    id: 'a3',
    name: 'Boardroom Delta AV Suite',
    tag: 'AF-0003',
    serialNumber: 'BR-DELTA-01',
    category: 'Conference Rooms',
    purchaseDate: '2022-06-01',
    purchaseCost: 12500,
    condition: 'Good',
    location: 'San Francisco - HQ Floor 4',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&auto=format&fit=crop&q=60',
    qrCode: 'AF-0003-BR-DELTA-01',
    isBookable: true,
    status: 'Available',
    currentOwnerId: null,
    departmentId: 'd3',
    expectedReturnDate: null
  },
  {
    id: 'a4',
    name: 'Tesla Model 3 Long Range',
    tag: 'AF-0004',
    serialNumber: '5YJ3E1EB8LF83XXXX',
    category: 'Vehicles',
    purchaseDate: '2023-04-20',
    purchaseCost: 47990,
    condition: 'Good',
    location: 'San Francisco - Parking Lot A',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=300&auto=format&fit=crop&q=60',
    qrCode: 'AF-0004-5YJ3E1EB8LF83XXXX',
    isBookable: true,
    status: 'Reserved',
    currentOwnerId: 'e3', // John Doe
    departmentId: 'd1',
    expectedReturnDate: null
  },
  {
    id: 'a5',
    name: 'Dell UltraSharp 38" Curved Monitor',
    tag: 'AF-0005',
    serialNumber: 'CN-0N86H8-74443-A1B',
    category: 'Laptops & Workstations',
    purchaseDate: '2023-08-15',
    purchaseCost: 999,
    condition: 'Good',
    location: 'San Francisco - HQ Floor 3',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&auto=format&fit=crop&q=60',
    qrCode: 'AF-0005-CN-0N86H8-74443-A1B',
    isBookable: false,
    status: 'Under Maintenance',
    currentOwnerId: null,
    departmentId: 'd1',
    expectedReturnDate: null
  },
  {
    id: 'a6',
    name: 'Herman Miller Aeron Chair',
    tag: 'AF-0006',
    serialNumber: 'HM-AERON-9921',
    category: 'Office Furniture',
    purchaseDate: '2022-09-10',
    purchaseCost: 1450,
    condition: 'Excellent',
    location: 'San Francisco - HQ Floor 2',
    image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=300&auto=format&fit=crop&q=60',
    qrCode: 'AF-0006-HM-AERON-9921',
    isBookable: false,
    status: 'Allocated',
    currentOwnerId: 'e4', // Sarah Connor
    departmentId: 'd2',
    expectedReturnDate: '2027-09-10'
  },
  {
    id: 'a7',
    name: 'Epson Pro Cinema 4K Projector',
    tag: 'AF-0007',
    serialNumber: 'EPS-PC4K-8812',
    category: 'AV & Presentation',
    purchaseDate: '2023-01-20',
    purchaseCost: 2999,
    condition: 'Fair',
    location: 'San Francisco - HQ Conference Hall',
    image: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=300&auto=format&fit=crop&q=60',
    qrCode: 'AF-0007-EPS-PC4K-8812',
    isBookable: true,
    status: 'Available',
    currentOwnerId: null,
    departmentId: 'd3',
    expectedReturnDate: null
  },
  {
    id: 'a8',
    name: 'Rigol Digital Oscilloscope',
    tag: 'AF-0008',
    serialNumber: 'RIG-DS1104Z',
    category: 'Lab Equipment',
    purchaseDate: '2024-02-05',
    purchaseCost: 799,
    condition: 'New',
    location: 'Hardware Lab Alpha',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&auto=format&fit=crop&q=60',
    qrCode: 'AF-0008-RIG-DS1104Z',
    isBookable: true,
    status: 'Available',
    currentOwnerId: null,
    departmentId: 'd1',
    expectedReturnDate: null
  },
  {
    id: 'a9',
    name: 'Meeting Room Aurora (6p)',
    tag: 'AF-0009',
    serialNumber: 'MR-AUR-06',
    category: 'Conference Rooms',
    purchaseDate: '2022-06-01',
    purchaseCost: 5000,
    condition: 'Good',
    location: 'San Francisco - HQ Floor 3',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=300&auto=format&fit=crop&q=60',
    qrCode: 'AF-0009-MR-AUR-06',
    isBookable: true,
    status: 'Available',
    currentOwnerId: null,
    departmentId: 'd3',
    expectedReturnDate: null
  },
  {
    id: 'a10',
    name: 'iPad Pro 12.9" M2',
    tag: 'AF-0010',
    serialNumber: 'IPD-M2-77221',
    category: 'Laptops & Workstations',
    purchaseDate: '2023-05-12',
    purchaseCost: 1199,
    condition: 'Good',
    location: 'Design Studio B',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&auto=format&fit=crop&q=60',
    qrCode: 'AF-0010-IPD-M2-77221',
    isBookable: false,
    status: 'Allocated',
    currentOwnerId: 'e4', // Sarah Connor
    departmentId: 'd2',
    expectedReturnDate: '2025-05-12' // Overdue since 2025-05-12
  },
  {
    id: 'a11',
    name: 'BMW i4 Corporate Edition',
    tag: 'AF-0011',
    serialNumber: 'WBA31AW03NFPXXXXX',
    category: 'Vehicles',
    purchaseDate: '2024-03-01',
    purchaseCost: 55900,
    condition: 'New',
    location: 'San Francisco - Parking Lot A',
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=300&auto=format&fit=crop&q=60',
    qrCode: 'AF-0011-WBA31AW03NFPXXXXX',
    isBookable: true,
    status: 'Available',
    currentOwnerId: null,
    departmentId: 'd3',
    expectedReturnDate: null
  },
  {
    id: 'a12',
    name: 'Focusrite Scarlett Solo Audio Interface',
    tag: 'AF-0012',
    serialNumber: 'FR-SCAR-5512',
    category: 'AV & Presentation',
    purchaseDate: '2023-07-22',
    purchaseCost: 159,
    condition: 'Fair',
    location: 'Podcast Studio',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&auto=format&fit=crop&q=60',
    qrCode: 'AF-0012-FR-SCAR-5512',
    isBookable: true,
    status: 'Lost',
    currentOwnerId: null,
    departmentId: 'd2',
    expectedReturnDate: null
  }
];

export const INITIAL_ALLOCATIONS = [
  {
    id: 'al1',
    assetId: 'a1',
    employeeId: 'e6', // David Kim
    allocatedBy: 'Marcus Brody',
    allocatedDate: '2024-01-15',
    returnDate: '2026-01-15',
    actualReturnDate: null,
    status: 'Active'
  },
  {
    id: 'al2',
    assetId: 'a2',
    employeeId: 'e7', // Elena Rostova
    allocatedBy: 'Marcus Brody',
    allocatedDate: '2023-11-10',
    returnDate: '2025-07-01',
    actualReturnDate: null,
    status: 'Active' // Overdue
  },
  {
    id: 'al3',
    assetId: 'a6',
    employeeId: 'e4', // Sarah Connor
    allocatedBy: 'Alex Harrison',
    allocatedDate: '2022-09-10',
    returnDate: '2027-09-10',
    actualReturnDate: null,
    status: 'Active'
  },
  {
    id: 'al4',
    assetId: 'a10',
    employeeId: 'e4', // Sarah Connor
    allocatedBy: 'Alex Harrison',
    allocatedDate: '2023-05-12',
    returnDate: '2025-05-12',
    actualReturnDate: null,
    status: 'Active' // Overdue
  }
];

export const INITIAL_TRANSFERS = [
  {
    id: 't1',
    assetId: 'a1',
    fromEmployeeId: 'e7',
    toEmployeeId: 'e6',
    requestedBy: 'David Kim',
    status: 'Approved',
    requestDate: '2024-01-14',
    approvedBy: 'Marcus Brody',
    approvedDate: '2024-01-15'
  },
  {
    id: 't2',
    assetId: 'a6',
    fromEmployeeId: 'e10',
    toEmployeeId: 'e4',
    requestedBy: 'Sarah Connor',
    status: 'Pending',
    requestDate: '2026-07-10',
    approvedBy: null,
    approvedDate: null
  }
];

export const INITIAL_BOOKINGS = [
  {
    id: 'b1',
    resourceId: 'a3', // Boardroom Delta
    employeeId: 'e3', // John Doe (Dept Head)
    date: '2026-07-12',
    startTime: '09:00',
    endTime: '10:30',
    purpose: 'Engineering Q3 Sync & Roadmap Planning',
    status: 'Approved'
  },
  {
    id: 'b2',
    resourceId: 'a3', // Boardroom Delta
    employeeId: 'e4', // Sarah Connor (Dept Head)
    date: '2026-07-12',
    startTime: '11:00',
    endTime: '12:00',
    purpose: 'UX Review with Clients',
    status: 'Approved'
  },
  {
    id: 'b3',
    resourceId: 'a4', // Tesla Model 3
    employeeId: 'e3', // John Doe
    date: '2026-07-12',
    startTime: '08:00',
    endTime: '18:00',
    purpose: 'Onsite Client Visit in Palo Alto',
    status: 'Approved'
  },
  {
    id: 'b4',
    resourceId: 'a9', // Meeting Room Aurora
    employeeId: 'e10', // Mike Ross
    date: '2026-07-12',
    startTime: '14:00',
    endTime: '15:00',
    purpose: 'Weekly HR Sync & Onboarding',
    status: 'Approved'
  }
];

export const INITIAL_MAINTENANCE = [
  {
    id: 'm1',
    assetId: 'a5', // Dell UltraSharp 38"
    reportedBy: 'Elena Rostova',
    reportedDate: '2026-07-10',
    issueDescription: 'Screen flickers when connected via USB-C alt mode. Power delivery drops randomly.',
    priority: 'High',
    status: 'In Progress',
    technicianName: 'Bob Jenkins (IT Support)',
    resolutionNotes: 'Replacing power cable and testing firmware upgrade.',
    resolvedDate: null
  },
  {
    id: 'm2',
    assetId: 'a2', // ThinkPad
    reportedBy: 'Elena Rostova',
    reportedDate: '2026-07-05',
    issueDescription: 'Laptop fan makes high-pitched whining noise under minimal load.',
    priority: 'Medium',
    status: 'Resolved',
    technicianName: 'Alice Vance (Tech Lab)',
    resolutionNotes: 'Cleaned dust from cooling fins, replaced thermal paste, and verified quiet fan operation under stress tests.',
    resolvedDate: '2026-07-08'
  },
  {
    id: 'm3',
    assetId: 'a7', // Epson Projector
    reportedBy: 'David Kim',
    reportedDate: '2026-07-11',
    issueDescription: 'Projection is yellowed on the right edge. May need lamp replacement or filter cleaning.',
    priority: 'Low',
    status: 'Pending',
    technicianName: null,
    resolutionNotes: null,
    resolvedDate: null
  }
];

export const INITIAL_AUDITS = [
  {
    id: 'au1',
    name: 'Q2 2026 General Asset Audit',
    startDate: '2026-05-01',
    endDate: '2026-05-15',
    status: 'Completed',
    auditorId: 'e2', // Marcus Brody
    verifiedAssetsCount: 11,
    totalAssetsCount: 12,
    results: {
      a1: 'Verified',
      a2: 'Verified',
      a3: 'Verified',
      a4: 'Verified',
      a5: 'Verified',
      a6: 'Verified',
      a7: 'Verified',
      a8: 'Verified',
      a9: 'Verified',
      a10: 'Verified',
      a11: 'Verified',
      a12: 'Missing' // became Lost
    }
  },
  {
    id: 'au2',
    name: 'High-Value Electronics Audit July 2026',
    startDate: '2026-07-01',
    endDate: '2026-07-20',
    status: 'Active',
    auditorId: 'e2', // Marcus Brody
    verifiedAssetsCount: 3,
    totalAssetsCount: 6,
    results: {
      a1: 'Verified',
      a5: 'Damaged',
      a10: 'Verified'
    }
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    employeeId: 'e6', // David Kim
    title: 'Asset Allocated',
    message: 'MacBook Pro M3 Max 16" (AF-0001) has been allocated to you by Marcus Brody. Expected return date is 2026-01-15.',
    type: 'success',
    isRead: false,
    timestamp: '2026-07-11T10:00:00Z'
  },
  {
    id: 'n2',
    employeeId: 'e7', // Elena Rostova
    title: 'Asset Overdue Reminder',
    message: 'Your allocated asset ThinkPad X1 Carbon Gen 11 (AF-0002) is overdue since 2025-07-01. Please return it or contact Marcus Brody.',
    type: 'alert',
    isRead: false,
    timestamp: '2026-07-12T08:00:00Z'
  },
  {
    id: 'n3',
    employeeId: 'e4', // Sarah Connor
    title: 'New Transfer Request',
    message: 'Sarah Connor, your request to transfer Herman Miller Aeron Chair (AF-0006) is pending approval from operations.',
    type: 'info',
    isRead: true,
    timestamp: '2026-07-10T14:30:00Z'
  },
  {
    id: 'n4',
    employeeId: 'all',
    title: 'New Audit Cycle Launched',
    message: 'Marcus Brody launched "High-Value Electronics Audit July 2026". All high-value items must be verified by July 20.',
    type: 'warning',
    isRead: false,
    timestamp: '2026-07-01T09:00:00Z'
  },
  {
    id: 'n5',
    employeeId: 'e2', // Marcus Brody (Asset Manager)
    title: 'Maintenance Request Raised',
    message: 'David Kim raised a maintenance request for Epson Pro Cinema 4K Projector (AF-0007): "Projection is yellowed on the right edge."',
    type: 'warning',
    isRead: false,
    timestamp: '2026-07-11T16:45:00Z'
  }
];
