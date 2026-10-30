export type RoomType = 'Lecture Hall' | 'Laboratory' | 'Smart Classroom' | 'Seminar Hall' | 'Computer Lab' | 'Electronics Lab' | 'Workshop' | 'Conference Room';

export type RoomStatus = 'available' | 'booked' | 'maintenance' | 'temporarily_unavailable';

export interface Classroom {
  id: string;
  buildingId: string;
  floorId: string;
  name: string;
  roomNumber: string;
  capacity: number;
  type: RoomType;
  status: RoomStatus;
  equipment: string[];
  equipmentCondition: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  lastMaintenanceDate: string;
  gridPosition: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  features: string[];
  notes?: string;
}

export interface Floor {
  id: string;
  buildingId: string;
  floorNumber: number;
  name: string;
  levelLabel: string; // e.g. "Ground Floor", "1st Floor", "2nd Floor"
  classroomCount: number;
  activeIssuesCount: number;
  occupancyRate: number; // percentage
  svgLayoutDimensions?: { width: number; height: number };
}

export interface CampusCoordinates {
  x: number;
  z: number;
  width: number;
  depth: number;
  rotation?: number;
  heightPerFloor?: number;
}

export interface Building {
  id: string;
  name: string;
  code: string;
  floorsCount: number;
  classroomsCount: number;
  equipmentCount: number;
  openMaintenanceCount: number;
  status: 'Operational' | 'Maintenance Required' | 'Partial Closure' | 'Inspection Scheduled';
  address: string;
  description: string;
  builtYear: number;
  totalAreaSqFt: number;
  currentEnergyKw: number;
  floors: Floor[];
  campusPosition?: CampusCoordinates;
}

export type TicketSeverity = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';

export interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  buildingId: string;
  buildingName: string;
  floorId: string;
  roomId?: string;
  roomNumber?: string;
  category: 'Electrical' | 'HVAC' | 'Plumbing' | 'Audio/Visual' | 'Furniture' | 'Structural' | 'Network';
  severity: TicketSeverity;
  status: TicketStatus;
  reportedBy: string;
  reportedAt: string;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
}

export interface RoomBooking {
  id: string;
  roomId: string;
  roomNumber: string;
  roomName: string;
  buildingName: string;
  title: string;
  organizer: string;
  department: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  attendeesCount: number;
  purpose: string;
  status: 'confirmed' | 'pending_approval' | 'cancelled';
  requiresAV: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Projectors & Displays' | 'Computing & IT' | 'Lab Instruments' | 'HVAC & Electrical' | 'Tools & Maintenance';
  quantityInStock: number;
  minimumThreshold: number;
  location: string;
  buildingId: string;
  condition: 'New' | 'Good' | 'Fair' | 'Under Repair';
  unitCost: number;
  lastAudited: string;
}

export interface StaffTechnician {
  id: string;
  name: string;
  role: string;
  specialties: ('Electrical' | 'HVAC' | 'Plumbing' | 'Audio/Visual' | 'Network' | 'Carpentry')[];
  phone: string;
  email: string;
  shift: 'Morning (07:00 - 15:00)' | 'Evening (14:00 - 22:00)' | 'Night (22:00 - 06:00)' | 'General (09:00 - 17:00)';
  status: 'available' | 'on_task' | 'off_duty';
  activeTicketsCount: number;
  rating: number;
}

export interface CampusIncident {
  id: string;
  title: string;
  description: string;
  category: 'Facility' | 'Utility' | 'Network' | 'Safety' | 'Weather';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'investigating' | 'mitigating' | 'resolved';
  affectedBuildings: string[];
  affectedRooms?: string[];
  reportedAt: string;
  estimatedResolution?: string;
  actionTaken: string;
}

export interface DashboardMetrics {
  totalBuildings: number;
  totalClassrooms: number;
  operationalRate: number;
  openMaintenanceTickets: number;
  activeBookingsToday: number;
  averageUtilizationPercent: number;
  activeIncidentsCount: number;
  lowStockItemsCount: number;
  availableStaffCount: number;
  dailyEnergyKwh: number;
}

export interface AiConfig {
  provider: 'openai' | 'gemini';
  hasApiKey: boolean;
  maskedKey: string;
  model: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  toolsUsed?: string[];
  actionSuggestion?: {
    type: 'navigate' | 'create_ticket' | 'create_booking' | 'view_room';
    label: string;
    payload: any;
  };
  cards?: {
    type: 'room' | 'ticket' | 'booking' | 'technician' | 'incident' | 'inventory';
    data: any;
  }[];
}
