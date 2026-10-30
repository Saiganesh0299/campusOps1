import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Classroom, 
  Floor, 
  MaintenanceTicket, 
  RoomBooking, 
  InventoryItem, 
  StaffTechnician, 
  CampusIncident, 
  DashboardMetrics 
} from './types/campus';
import { 
  initialBuildings, 
  initialClassrooms, 
  initialTickets, 
  initialBookings, 
  initialInventory, 
  initialStaff, 
  initialIncidents, 
  initialMetrics 
} from './data/seedData';

// Component Views
import { ThreeCampusViewer } from './components/ThreeCampusViewer';
import { FloorPlanView } from './components/FloorPlanView';
import { DashboardView } from './components/DashboardView';
import { MaintenanceView } from './components/MaintenanceView';
import { BookingsView } from './components/BookingsView';
import { InventoryView } from './components/InventoryView';
import { StaffView } from './components/StaffView';
import { IncidentsView } from './components/IncidentsView';
import { AnalyticsView } from './components/AnalyticsView';
import { AiChatView } from './components/AiChatView';
import { AiSettingsView } from './components/AiSettingsView';
import { AiCopilotWidget } from './components/AiCopilotWidget';
import { BookRoomModal } from './components/BookRoomModal';
import { ReportIssueModal } from './components/ReportIssueModal';

// Icons
import { 
  Compass, 
  LayoutDashboard, 
  Layers, 
  Wrench, 
  Calendar, 
  Boxes, 
  Users, 
  AlertTriangle, 
  BarChart3, 
  Sparkles, 
  Settings, 
  Menu, 
  X, 
  Building2, 
  ShieldCheck, 
  Bell 
} from 'lucide-react';

export default function App() {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState<string>('3d-campus');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Campus Data State
  const [buildings, setBuildings] = useState<Building[]>(initialBuildings);
  const [classrooms, setClassrooms] = useState<Classroom[]>(initialClassrooms);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(initialTickets);
  const [bookings, setBookings] = useState<RoomBooking[]>(initialBookings);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [staff, setStaff] = useState<StaffTechnician[]>(initialStaff);
  const [incidents, setIncidents] = useState<CampusIncident[]>(initialIncidents);
  const [metrics, setMetrics] = useState<DashboardMetrics>(initialMetrics);

  // Selected State
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);

  // Modal State
  const [roomToBook, setRoomToBook] = useState<Classroom | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportPrefill, setReportPrefill] = useState<{ buildingId?: string; roomId?: string; roomNumber?: string }>({});

  // Sync from backend REST API if available
  useEffect(() => {
    fetch('/api/buildings')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data && data.length) setBuildings(data); })
      .catch(() => {});

    fetch('/api/classrooms')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data && data.length) setClassrooms(data); })
      .catch(() => {});

    fetch('/api/maintenance')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data && data.length) setTickets(data); })
      .catch(() => {});

    fetch('/api/bookings')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data && data.length) setBookings(data); })
      .catch(() => {});

    fetch('/api/inventory')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data && data.length) setInventory(data); })
      .catch(() => {});

    fetch('/api/staff')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data && data.length) setStaff(data); })
      .catch(() => {});

    fetch('/api/incidents')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data && data.length) setIncidents(data); })
      .catch(() => {});
  }, []);

  // Handlers
  const handleSelectBuilding = (b: Building) => {
    setSelectedBuilding(b);
    if (b.floors && b.floors.length > 0) {
      setSelectedFloor(b.floors[0]);
    }
  };

  const handleDeselectBuilding = () => {
    setSelectedBuilding(null);
    setSelectedFloor(null);
  };

  const handleOpenFloorPlan = (b: Building, floor?: Floor) => {
    setSelectedBuilding(b);
    setSelectedFloor(floor || b.floors[0]);
    setActiveTab('floor-plan');
  };

  const handleNavigateTo3D = (b?: Building) => {
    if (b) {
      setSelectedBuilding(b);
      if (b.floors && b.floors.length > 0) setSelectedFloor(b.floors[0]);
    } else {
      setSelectedBuilding(null);
    }
    setActiveTab('3d-campus');
  };

  // Ticket actions
  const handleUpdateTicketStatus = async (ticketId: string, newStatus: any, notes?: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus, resolutionNotes: notes || t.resolutionNotes } : t));
    try {
      await fetch(`/api/maintenance/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, resolutionNotes: notes })
      });
    } catch (err) {}
  };

  const handleCreateTicketSuccess = (newTicket: MaintenanceTicket) => {
    setTickets(prev => [newTicket, ...prev]);
    setShowReportModal(false);
  };

  // Booking actions
  const handleCreateBookingSuccess = (newBooking: RoomBooking) => {
    setBookings(prev => [newBooking, ...prev]);
    setClassrooms(prev => prev.map(r => r.id === newBooking.roomId ? { ...r, status: 'booked' } : r));
    setRoomToBook(null);
  };

  const handleCancelBooking = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    setBookings(prev => prev.filter(b => b.id !== bookingId));
    if (booking) {
      setClassrooms(prev => prev.map(r => r.id === booking.roomId ? { ...r, status: 'available' } : r));
    }
    try {
      await fetch(`/api/bookings/${bookingId}`, { method: 'DELETE' });
    } catch (err) {}
  };

  // Inventory actions
  const handleRestock = async (itemId: string, addQuantity: number) => {
    setInventory(prev => prev.map(item => item.id === itemId ? { ...item, quantityInStock: item.quantityInStock + addQuantity } : item));
    try {
      await fetch(`/api/inventory/${itemId}/restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: addQuantity })
      });
    } catch (err) {}
  };

  // Incident actions
  const handleAddIncident = async (incidentData: any) => {
    const newInc: CampusIncident = {
      id: `inc-${Date.now()}`,
      ...incidentData,
      status: 'investigating',
      reportedAt: new Date().toISOString()
    };
    setIncidents(prev => [newInc, ...prev]);
    try {
      await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInc)
      });
    } catch (err) {}
  };

  const handleUpdateIncidentStatus = async (id: string, status: any) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  };

  const navItems = [
    { id: '3d-campus', label: '3D Unified Campus', icon: Compass, badge: 'Unified' },
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'floor-plan', label: 'Floor Plan Explorer', icon: Layers },
    { id: 'maintenance', label: 'Maintenance & Complaints', icon: Wrench, count: tickets.filter(t => t.status !== 'resolved').length },
    { id: 'bookings', label: 'Room Bookings', icon: Calendar, count: bookings.length },
    { id: 'inventory', label: 'Inventory & Assets', icon: Boxes },
    { id: 'staff', label: 'Staff & Technicians', icon: Users },
    { id: 'incidents', label: 'Campus Incidents', icon: AlertTriangle, count: incidents.filter(i => i.status !== 'resolved').length },
    { id: 'analytics', label: 'Operations Analytics', icon: BarChart3 },
    { id: 'ai-chat', label: 'AI Operations Copilot', icon: Sparkles, glow: true },
    { id: 'settings', label: 'System & AI Policies', icon: Settings }
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0A0A0C] text-[#F5F7FA]">
      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-[#0A0A0C]/95 backdrop-blur-xl border-r border-[#252630] transition-all duration-300 md:relative ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[#252630]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF2E88] to-[#007BA7] flex items-center justify-center text-white shadow-lg shadow-[#FF2E88]/20 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  CampusOps
                </span>
                <span className="text-[10px] block font-mono text-[#007BA7] font-semibold -mt-0.5">
                  INTELLIGENT COMMAND
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FF2E88]/20 to-[#FF2E88]/5 text-white border border-[#FF2E88]/40 shadow-[0_0_15px_rgba(255,46,136,0.25)]'
                    : 'text-slate-400 hover:text-white hover:bg-[#161722]'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-[#FF2E88]' : item.glow ? 'text-[#007BA7]' : 'text-slate-400'
                }`} />

                {!sidebarCollapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}

                {!sidebarCollapsed && item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#007BA7]/20 text-[#007BA7] border border-[#007BA7]/30">
                    {item.badge}
                  </span>
                )}

                {!sidebarCollapsed && item.count !== undefined && item.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    item.id === 'incidents' ? 'bg-amber-500/20 text-amber-400' :
                    item.id === 'maintenance' ? 'bg-[#FF2E88]/20 text-[#FF2E88]' :
                    'bg-[#252630] text-slate-300'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer info */}
        <div className="p-3 border-t border-[#252630] text-xs">
          {!sidebarCollapsed ? (
            <div className="p-3 rounded-xl bg-[#121318] border border-[#252630]/60 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Campus Status</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Nominal
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Active Nodes: 3 Complexes
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 px-4 sm:px-6 bg-[#0A0A0C]/90 backdrop-blur-md border-b border-[#252630] flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/50 cursor-pointer"
              title="Toggle Sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">View:</span>
              <span className="text-xs font-bold text-white bg-[#1a1b26] px-2.5 py-1 rounded-lg border border-[#252630]">
                {navItems.find(i => i.id === activeTab)?.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setReportPrefill({ buildingId: selectedBuilding?.id });
                setShowReportModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#252630] hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5 text-[#FF2E88]" />
              <span className="hidden sm:inline">Report Complaint</span>
            </button>

            <button
              onClick={() => setRoomToBook(classrooms[0] || null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#d8196e] text-white text-xs font-semibold hover:brightness-110 transition-all shadow-[0_0_12px_rgba(255,46,136,0.3)] cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Book Space</span>
            </button>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 relative overflow-y-auto">
          {activeTab === '3d-campus' && (
            <div className="w-full h-full">
              <ThreeCampusViewer
                buildings={buildings}
                selectedBuilding={selectedBuilding}
                onSelectBuilding={handleSelectBuilding}
                onDeselectBuilding={handleDeselectBuilding}
                onSelectFloor={(fl) => {
                  setSelectedFloor(fl);
                }}
                onOpenFloorPlan={(b) => handleOpenFloorPlan(b)}
              />
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
              <DashboardView
                buildings={buildings}
                classrooms={classrooms}
                tickets={tickets}
                bookings={bookings}
                incidents={incidents}
                metrics={metrics}
                onNavigateTo3D={handleNavigateTo3D}
                onNavigateToFloorPlan={handleOpenFloorPlan}
                onOpenReportModal={() => setShowReportModal(true)}
                onOpenBookingModal={(room) => setRoomToBook(room || classrooms[0])}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            </div>
          )}

          {activeTab === 'floor-plan' && (
            <div className="w-full h-full p-2 sm:p-4">
              <FloorPlanView
                building={selectedBuilding || buildings[0]}
                floor={selectedFloor || buildings[0].floors[0]}
                classrooms={classrooms}
                onBackTo3D={() => handleNavigateTo3D()}
                onSelectRoom={() => {}}
                onBookRoom={(room: Classroom) => setRoomToBook(room)}
                onReportIssue={(room: Classroom) => {
                  setReportPrefill({
                    buildingId: room.buildingId,
                    roomId: room.id,
                    roomNumber: room.roomNumber
                  });
                  setShowReportModal(true);
                }}
              />
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
              <MaintenanceView
                tickets={tickets}
                technicians={staff}
                onOpenReportModal={() => setShowReportModal(true)}
                onUpdateTicketStatus={handleUpdateTicketStatus}
              />
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
              <BookingsView
                bookings={bookings}
                classrooms={classrooms}
                buildings={buildings}
                onOpenBookingModal={(room) => setRoomToBook(room || classrooms[0])}
                onCancelBooking={handleCancelBooking}
              />
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
              <InventoryView
                inventory={inventory}
                onRestockItem={handleRestock}
              />
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
              <StaffView technicians={staff} />
            </div>
          )}

          {activeTab === 'incidents' && (
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
              <IncidentsView
                incidents={incidents}
                buildings={buildings}
                onAddIncident={handleAddIncident}
                onUpdateStatus={handleUpdateIncidentStatus}
              />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
              <AnalyticsView
                buildings={buildings}
                classrooms={classrooms}
                tickets={tickets}
                bookings={bookings}
              />
            </div>
          )}

          {activeTab === 'ai-chat' && (
            <div className="p-4 sm:p-6 max-w-5xl mx-auto h-full">
              <AiChatView
                onOpenBookingModal={(room) => setRoomToBook(room)}
                onOpenReportModal={(prefill) => {
                  setReportPrefill(prefill || {});
                  setShowReportModal(true);
                }}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
              <AiSettingsView />
            </div>
          )}
        </main>
      </div>

      {/* Floating AI Copilot Widget (Present across all views including 3D) */}
      {activeTab !== 'ai-chat' && (
        <AiCopilotWidget
          onOpenBookingModal={(room) => setRoomToBook(room)}
          onOpenReportModal={() => setShowReportModal(true)}
        />
      )}

      {/* Modals */}
      {roomToBook && (
        <BookRoomModal
          room={roomToBook}
          onClose={() => setRoomToBook(null)}
          onSuccess={handleCreateBookingSuccess}
        />
      )}

      {showReportModal && (
        <ReportIssueModal
          building={selectedBuilding || buildings.find(b => b.id === reportPrefill.buildingId) || buildings[0]}
          room={reportPrefill.roomId ? classrooms.find(r => r.id === reportPrefill.roomId) : undefined}
          onClose={() => setShowReportModal(false)}
          onSuccess={handleCreateTicketSuccess}
        />
      )}
    </div>
  );
}
