import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

import {
  initialBuildings,
  initialClassrooms,
  initialTickets,
  initialBookings,
  initialInventory,
  initialStaff,
  initialIncidents,
  initialMetrics
} from './src/data/seedData.ts';

import { 
  Building, 
  Classroom, 
  MaintenanceTicket, 
  RoomBooking, 
  InventoryItem, 
  StaffTechnician, 
  CampusIncident, 
  DashboardMetrics 
} from './src/types/campus.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// In-Memory Database Store
let buildings: Building[] = [...initialBuildings];
let classrooms: Classroom[] = [...initialClassrooms];
let tickets: MaintenanceTicket[] = [...initialTickets];
let bookings: RoomBooking[] = [...initialBookings];
let inventory: InventoryItem[] = [...initialInventory];
let staff: StaffTechnician[] = [...initialStaff];
let incidents: CampusIncident[] = [...initialIncidents];
let metrics: DashboardMetrics = { ...initialMetrics };

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// Buildings
app.get('/api/buildings', (req, res) => {
  res.json(buildings);
});

app.get('/api/buildings/:id', (req, res) => {
  const b = buildings.find(item => item.id === req.params.id);
  if (!b) return res.status(404).json({ error: 'Building not found' });
  res.json(b);
});

app.get('/api/buildings/:id/rooms', (req, res) => {
  const rooms = classrooms.filter(r => r.buildingId === req.params.id);
  res.json(rooms);
});

// Classrooms
app.get('/api/classrooms', (req, res) => {
  res.json(classrooms);
});

app.get('/api/classrooms/:id', (req, res) => {
  const room = classrooms.find(r => r.id === req.params.id);
  if (!room) return res.status(404).json({ error: 'Classroom not found' });
  res.json(room);
});

// Maintenance Tickets
app.get('/api/maintenance', (req, res) => {
  res.json(tickets);
});

app.post('/api/maintenance', (req, res) => {
  const { title, description, buildingId, roomId, category, severity, reportedBy } = req.body;
  const bldg = buildings.find(b => b.id === buildingId);
  const rm = roomId ? classrooms.find(r => r.id === roomId) : undefined;

  // Auto assign technician based on category
  const suitableTech = staff.find(s => 
    s.status === 'available' && 
    s.specialties.some(spec => spec.toLowerCase().includes((category || '').toLowerCase()))
  ) || staff[0];

  const newTicket: MaintenanceTicket = {
    id: `tic-${Date.now()}`,
    title: title || 'Reported Maintenance Issue',
    description: description || 'No details provided.',
    buildingId: buildingId || (bldg ? bldg.id : 'bldg-orion'),
    buildingName: bldg ? bldg.name : 'Orion Academic Block',
    floorId: rm ? rm.floorId : 'fl-orion-0',
    roomId: rm ? rm.id : undefined,
    roomNumber: rm ? rm.roomNumber : undefined,
    category: category || 'Electrical',
    severity: severity || 'medium',
    status: 'assigned',
    reportedBy: reportedBy || 'Staff Member',
    reportedAt: new Date().toISOString(),
    assignedTechnicianId: suitableTech ? suitableTech.id : undefined,
    assignedTechnicianName: suitableTech ? suitableTech.name : undefined
  };

  tickets.unshift(newTicket);

  if (rm) {
    rm.status = 'maintenance';
  }

  // Update building count
  if (bldg) {
    bldg.openMaintenanceCount += 1;
  }

  res.status(201).json(newTicket);
});

app.patch('/api/maintenance/:id', (req, res) => {
  const { status, resolutionNotes } = req.body;
  const ticket = tickets.find(t => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  if (status) ticket.status = status;
  if (resolutionNotes) ticket.resolutionNotes = resolutionNotes;
  if (status === 'resolved') {
    ticket.resolvedAt = new Date().toISOString();
    if (ticket.roomId) {
      const rm = classrooms.find(r => r.id === ticket.roomId);
      if (rm) rm.status = 'available';
    }
  }

  res.json(ticket);
});

// Bookings
app.get('/api/bookings', (req, res) => {
  res.json(bookings);
});

app.post('/api/bookings', (req, res) => {
  const { roomId, title, organizer, department, date, startTime, endTime, attendeesCount } = req.body;
  const room = classrooms.find(r => r.id === roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });

  const bldg = buildings.find(b => b.id === room.buildingId);

  const newBooking: RoomBooking = {
    id: `book-${Date.now()}`,
    roomId: room.id,
    roomNumber: room.roomNumber,
    roomName: room.name,
    buildingName: bldg ? bldg.name : 'Academic Complex',
    title: title || 'Scheduled Session',
    organizer: organizer || 'Campus Faculty',
    department: department || 'General Studies',
    date: date || new Date().toISOString().split('T')[0],
    startTime: startTime || '14:00',
    endTime: endTime || '15:30',
    attendeesCount: attendeesCount || 25,
    purpose: req.body.purpose || 'Academic session',
    status: 'confirmed',
    requiresAV: req.body.requiresAV ?? true
  };

  bookings.unshift(newBooking);
  room.status = 'booked';

  res.status(201).json(newBooking);
});

app.delete('/api/bookings/:id', (req, res) => {
  const idx = bookings.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Booking not found' });

  const booking = bookings[idx];
  bookings.splice(idx, 1);

  const room = classrooms.find(r => r.id === booking.roomId);
  if (room) {
    room.status = 'available';
  }

  res.json({ success: true, message: 'Booking canceled successfully' });
});

// Inventory
app.get('/api/inventory', (req, res) => {
  res.json(inventory);
});

app.post('/api/inventory/:id/restock', (req, res) => {
  const { quantity } = req.body;
  const item = inventory.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  item.quantityInStock += (parseInt(quantity, 10) || 5);
  res.json(item);
});

// Staff
app.get('/api/staff', (req, res) => {
  res.json(staff);
});

// Incidents
app.get('/api/incidents', (req, res) => {
  res.json(incidents);
});

app.post('/api/incidents', (req, res) => {
  const newInc: CampusIncident = {
    id: `inc-${Date.now()}`,
    ...req.body,
    reportedAt: new Date().toISOString()
  };
  incidents.unshift(newInc);
  res.status(201).json(newInc);
});

// Metrics
app.get('/api/metrics', (req, res) => {
  res.json(metrics);
});

// -------------------------------------------------------------
// AI COPILOT ENDPOINT (GEMINI WITH TOOL CALLING & FALLBACK)
// -------------------------------------------------------------

app.post('/api/ai/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // If Gemini API Key is available, use GoogleGenAI
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI();
      const prompt = `You are CampusOps Copilot, the AI assistant for an intelligent futuristic college campus.
Current Campus Data:
- Buildings: ${buildings.map(b => `${b.name} (${b.code}, ${b.floorsCount} floors, status: ${b.status}, energy: ${b.currentEnergyKw}kW)`).join('; ')}
- Available Rooms: ${classrooms.filter(r => r.status === 'available').length} of ${classrooms.length} total
- Open Tickets: ${tickets.filter(t => t.status !== 'resolved').length}
- Today's Bookings: ${bookings.length}
- On-Duty Staff: ${staff.filter(s => s.status === 'available').map(s => `${s.name} (${s.role})`).join(', ')}

User Request: "${message}"

Answer helpfully, concisely, and accurately in character as the Campus Operations Copilot. If the user asks to find rooms, recommend specific rooms from the campus.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });

      return res.json({
        reply: response.text || 'I processed your campus request.',
        actionType: 'chat'
      });
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to local reasoning:', err?.message);
    }
  }

  // Local Intelligent Fallback
  const lower = message.toLowerCase();

  if (lower.includes('room') || lower.includes('class') || lower.includes('lab') || lower.includes('find') || lower.includes('available')) {
    const available = classrooms.filter(r => r.status === 'available').slice(0, 3);
    return res.json({
      reply: `I analyzed the campus schedule. Currently, there are ${classrooms.filter(r => r.status === 'available').length} rooms available across Orion, Turing, and Lovelace. Here are top recommended spaces ready for reservation:`,
      actionType: 'room_recommendations',
      actionPayload: available
    });
  }

  if (lower.includes('ticket') || lower.includes('maintenance') || lower.includes('repair') || lower.includes('complaint')) {
    const open = tickets.filter(t => t.status !== 'resolved');
    return res.json({
      reply: `There are currently ${open.length} active maintenance tickets in queue. The highest priority is "${open[0]?.title || 'None'}" in ${open[0]?.buildingName || 'campus'}. Technician ${open[0]?.assignedTechnicianName || 'Dennis'} has been dispatched.`,
      actionType: 'ticket_summary',
      actionPayload: open.slice(0, 3)
    });
  }

  if (lower.includes('energy') || lower.includes('power') || lower.includes('kw')) {
    const totalKw = buildings.reduce((s, b) => s + (b.currentEnergyKw || 0), 0).toFixed(1);
    return res.json({
      reply: `Current total campus energy demand is ${totalKw} kW. Orion Academic Block is drawing 142.8 kW, Turing Engineering Hub is drawing 118.4 kW, and Ada Lovelace Science Center is drawing 96.2 kW. All consumption parameters are within optimal green thresholds.`,
      actionType: 'energy_telemetry'
    });
  }

  if (lower.includes('staff') || lower.includes('technician') || lower.includes('who is')) {
    const avail = staff.filter(s => s.status === 'available');
    return res.json({
      reply: `There are ${avail.length} certified technicians on active duty: ${avail.map(s => `${s.name} (${s.specialties.join('/')})`).join(', ')}.`,
      actionType: 'staff_directory'
    });
  }

  return res.json({
    reply: `CampusOps Copilot here. All 3 campus complexes (Orion Academic Block, Turing Hub, and Lovelace Science Center) are operating normally at 92.6% facility efficiency. You can ask me to book a room, report maintenance issues, or check real-time telemetry.`,
    actionType: 'status_nominal'
  });
});

// -------------------------------------------------------------
// VITE DEV SERVER INTEGRATION
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CampusOps server listening on http://localhost:${PORT}`);
  });
}

startServer();
