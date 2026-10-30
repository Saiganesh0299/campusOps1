import React, { useState, useMemo, useRef } from 'react';
import { Building, Floor, Classroom, RoomStatus, RoomType } from '../types/campus';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Users, 
  Wrench, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Maximize, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Sparkles,
  Tv,
  Layers,
  Info,
  Clock,
  Radio,
  SlidersHorizontal,
  Building2
} from 'lucide-react';

interface FloorPlanViewProps {
  building: Building;
  floor: Floor;
  classrooms: Classroom[];
  onBackTo3D: () => void;
  onSelectRoom: (room: Classroom) => void;
  onBookRoom: (room: Classroom) => void;
  onReportIssue: (room: Classroom) => void;
}

export const FloorPlanView: React.FC<FloorPlanViewProps> = ({
  building,
  floor,
  classrooms,
  onBackTo3D,
  onSelectRoom,
  onBookRoom,
  onReportIssue
}) => {
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [minCapacity, setMinCapacity] = useState<number>(0);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // Pan & Zoom state
  const [scale, setScale] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Filter classrooms for this floor and building
  const floorClassrooms = useMemo(() => {
    return classrooms.filter(r => r.floorId === floor.id || (r.buildingId === building.id && r.floorId.endsWith(String(floor.floorNumber))));
  }, [classrooms, floor, building]);

  // Apply search and filter criteria
  const filteredClassrooms = useMemo(() => {
    return floorClassrooms.filter(room => {
      const matchesSearch = 
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.equipment.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
      const matchesType = typeFilter === 'all' || room.type === typeFilter;
      const matchesCapacity = room.capacity >= minCapacity;

      return matchesSearch && matchesStatus && matchesType && matchesCapacity;
    });
  }, [floorClassrooms, searchQuery, statusFilter, typeFilter, minCapacity]);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Left button
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case 'available':
        return {
          border: 'border-[#007BA7]',
          bg: 'bg-[#007BA7]/12',
          badge: 'bg-[#007BA7]/20 text-[#38BDF8] border-[#007BA7]/40',
          hex: '#007BA7',
          label: 'Available'
        };
      case 'booked':
        return {
          border: 'border-[#3E4254]',
          bg: 'bg-[#1E202B]/80',
          badge: 'bg-[#252630] text-zinc-300 border-[#3E4254]',
          hex: '#252630',
          label: 'Booked'
        };
      case 'maintenance':
        return {
          border: 'border-[#FF2E88]',
          bg: 'bg-[#FF2E88]/15',
          badge: 'bg-[#FF2E88]/20 text-[#FF2E88] border-[#FF2E88]/40',
          hex: '#FF2E88',
          label: 'Under Maintenance'
        };
      case 'temporarily_unavailable':
        return {
          border: 'border-amber-500',
          bg: 'bg-amber-500/12',
          badge: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
          hex: '#F59E0B',
          label: 'Temp Unavailable'
        };
    }
  };

  const activeRoom = floorClassrooms.find(r => r.id === selectedRoomId);

  return (
    <div className="flex flex-col h-full bg-[#0A0A0C] text-[#F5F7FA] overflow-hidden select-none">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-[#12131A] border-b border-[#252630] z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackTo3D}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1A1C26] hover:bg-[#252838] border border-[#252630] text-zinc-200 hover:text-white transition-all text-xs font-semibold shadow-md group"
          >
            <ArrowLeft className="w-4 h-4 text-[#007BA7] group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to 3D Campus</span>
          </button>

          <div className="h-6 w-px bg-[#252630]" />

          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="text-zinc-200 font-semibold">{building.name}</span>
              <span>/</span>
              <span className="text-[#007BA7] font-semibold">{floor.name}</span>
            </div>
            <h1 className="text-lg font-bold text-[#F5F7FA] flex items-center gap-2">
              <span>Top-View Architectural Plan</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#007BA7]/20 text-[#007BA7] border border-[#007BA7]/30 font-medium font-mono">
                Level {floor.floorNumber}
              </span>
            </h1>
          </div>
        </div>

        {/* Status Color Legend */}
        <div className="flex items-center gap-3 bg-[#0E0F14] border border-[#252630] px-4 py-2 rounded-xl text-xs">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mr-1">Status:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#007BA7]" />
            <span className="text-zinc-300">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#3E4254]" />
            <span className="text-zinc-300">Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#FF2E88]" />
            <span className="text-zinc-300">Maintenance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
            <span className="text-zinc-300">Unavailable</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Sub-bar */}
      <div className="px-6 py-3 bg-[#0E0F14]/90 border-b border-[#252630] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by room name, number, or equipment (e.g., A-102, Projector)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161822] border border-[#252630] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#007BA7]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#161822] border border-[#252630] rounded-lg px-2.5 py-1.5 text-zinc-300 text-xs focus:outline-none focus:border-[#007BA7]"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available Only</option>
              <option value="booked">Booked</option>
              <option value="maintenance">Under Maintenance</option>
              <option value="temporarily_unavailable">Temporarily Unavailable</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#161822] border border-[#252630] rounded-lg px-2.5 py-1.5 text-zinc-300 text-xs focus:outline-none focus:border-[#007BA7]"
            >
              <option value="all">All Room Types</option>
              <option value="Lecture Hall">Lecture Hall</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Smart Classroom">Smart Classroom</option>
              <option value="Seminar Hall">Seminar Hall</option>
              <option value="Computer Lab">Computer Lab</option>
              <option value="Electronics Lab">Electronics Lab</option>
              <option value="Workshop">Workshop</option>
            </select>
          </div>
        </div>

        {/* Floor Plan Zoom & Pan Controls */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-zinc-400">Zoom: {Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale(s => Math.min(s + 0.15, 2.0))}
            className="p-1.5 rounded-lg bg-[#181A24] border border-[#252630] hover:bg-[#222534] text-zinc-300"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setScale(s => Math.max(s - 0.15, 0.6))}
            className="p-1.5 rounded-lg bg-[#181A24] border border-[#252630] hover:bg-[#222534] text-zinc-300"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetView}
            className="p-1.5 rounded-lg bg-[#181A24] border border-[#252630] hover:bg-[#222534] text-zinc-300"
            title="Reset Pan & Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Floor Plan Canvas & Interactive Blueprint */}
      <div className="relative flex-1 flex overflow-hidden">
        <div 
          className="relative flex-1 h-full bg-[#08080A] cursor-grab active:cursor-grabbing overflow-hidden flex items-center justify-center p-8"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Blueprint Grid Background Pattern */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(#007BA7 1px, transparent 1px), linear-gradient(90deg, #007BA7 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />

          {/* Interactive Scalable Blueprint Container */}
          <div
            className="relative transition-transform duration-75 select-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              width: '940px',
              height: '560px'
            }}
          >
            {/* Architectural Outer Building Boundary Walls */}
            <div className="absolute inset-0 border-2 border-[#007BA7]/40 rounded-2xl bg-[#0D0E14]/90 shadow-2xl overflow-hidden">
              
              {/* Compass Rose / Orientation Indicator */}
              <div className="absolute top-4 right-4 text-[10px] font-mono text-zinc-400 bg-[#141620] border border-[#252630] px-2.5 py-1 rounded-md flex items-center gap-1.5">
                <span className="text-[#007BA7] font-bold">▲ N</span>
                <span>FACING CAMPUS QUAD</span>
              </div>

              {/* Central Main Corridor Layout */}
              <div className="absolute top-[230px] left-[40px] right-[40px] h-[40px] bg-[#161822] border-y border-[#252630] flex items-center justify-center">
                <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                  ◄ CENTRAL CORRIDOR & EGRESS CONCOURSE ►
                </span>
              </div>

              {/* Fire Exit & Elevator Shaft indicators */}
              <div className="absolute top-[230px] left-[10px] w-[26px] h-[40px] bg-[#1E202B] border border-[#252630] rounded flex items-center justify-center text-[9px] font-mono text-zinc-400">
                STAIR
              </div>
              <div className="absolute top-[230px] right-[10px] w-[26px] h-[40px] bg-[#1E202B] border border-[#252630] rounded flex items-center justify-center text-[9px] font-mono text-[#007BA7]">
                LIFT
              </div>

              {/* Restrooms / Utility Core */}
              <div className="absolute top-[230px] left-[415px] w-[70px] h-[40px] bg-[#12141D] border-x border-[#252630] flex items-center justify-center text-[9px] font-mono text-zinc-400">
                SERVICES
              </div>

              {/* Classrooms Polygons / Rooms rendered from live database */}
              {floorClassrooms.map((room) => {
                const statusTheme = getStatusColor(room.status);
                const isSelected = selectedRoomId === room.id;
                const isMatch = filteredClassrooms.some(r => r.id === room.id);

                return (
                  <div
                    key={room.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRoomId(room.id);
                      onSelectRoom(room);
                    }}
                    style={{
                      left: `${room.gridPosition.x}px`,
                      top: `${room.gridPosition.y}px`,
                      width: `${room.gridPosition.width}px`,
                      height: `${room.gridPosition.height}px`,
                      opacity: isMatch ? 1 : 0.28
                    }}
                    className={`absolute rounded-xl border-2 transition-all cursor-pointer p-4 flex flex-col justify-between group shadow-lg ${
                      statusTheme.border
                    } ${statusTheme.bg} ${
                      isSelected 
                        ? 'ring-2 ring-[#FF2E88] scale-[1.01] z-10 shadow-2xl' 
                        : 'hover:border-white/80 hover:scale-[1.008]'
                    }`}
                  >
                    {/* Top Row: Room Number, Type & Status Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-extrabold font-mono text-white tracking-wide">
                            {room.roomNumber}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md border font-mono uppercase tracking-wider ${statusTheme.badge}`}>
                            {statusTheme.label}
                          </span>
                        </div>
                        <h3 className="text-xs font-semibold text-zinc-200 mt-0.5 line-clamp-1 group-hover:text-white">
                          {room.name}
                        </h3>
                      </div>

                      {/* Capacity badge */}
                      <div className="flex items-center gap-1 bg-[#0A0B10]/80 border border-[#252630] px-2 py-1 rounded-md text-[11px] font-mono text-zinc-300">
                        <Users className="w-3 h-3 text-[#007BA7]" />
                        <span>{room.capacity}</span>
                      </div>
                    </div>

                    {/* Middle: Equipment Indicators */}
                    <div className="flex flex-wrap gap-1.5 my-2">
                      {room.equipment.slice(0, 3).map((eq, i) => (
                        <span 
                          key={i} 
                          className="text-[10px] px-2 py-0.5 rounded bg-[#10121A] border border-[#252630] text-zinc-400 font-mono flex items-center gap-1"
                        >
                          <Tv className="w-2.5 h-2.5 text-[#007BA7]" />
                          <span className="truncate max-w-[130px]">{eq}</span>
                        </span>
                      ))}
                      {room.equipment.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#10121A] border border-[#252630] text-zinc-400 font-mono">
                          +{room.equipment.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Bottom Row: Door Indicator & Quick Details */}
                    <div className="flex items-center justify-between border-t border-[#252630]/60 pt-2 text-[10px] text-zinc-400 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Door 1 • {room.type}</span>
                      </div>
                      
                      {room.status === 'maintenance' ? (
                        <span className="text-[#FF2E88] font-semibold flex items-center gap-1">
                          <Wrench className="w-3 h-3" /> Issue Reported
                        </span>
                      ) : (
                        <span className="text-[#007BA7] group-hover:underline">Click for details →</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Room Detail Slide-Over Side Panel (When a room is clicked) */}
        {activeRoom && (
          <div className="w-[360px] bg-[#12131A] border-l border-[#252630] flex flex-col h-full shadow-2xl z-20 overflow-y-auto">
            {/* Header */}
            <div className="p-5 border-b border-[#252630] flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#007BA7]">{activeRoom.roomNumber}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md border font-mono ${getStatusColor(activeRoom.status).badge}`}>
                    {getStatusColor(activeRoom.status).label}
                  </span>
                </div>
                <h2 className="text-base font-bold text-[#F5F7FA] mt-1">{activeRoom.name}</h2>
                <p className="text-xs text-zinc-400">{building.name} • {floor.name}</p>
              </div>
              <button
                onClick={() => setSelectedRoomId(null)}
                className="p-1 rounded-lg hover:bg-[#252630] text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Room Specifications */}
            <div className="p-5 space-y-4 flex-1">
              {/* Key Specs Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#181A24] p-3 rounded-xl border border-[#252630]">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase">Capacity</div>
                  <div className="text-base font-bold text-[#F5F7FA] mt-0.5">{activeRoom.capacity} Seats</div>
                </div>
                <div className="bg-[#181A24] p-3 rounded-xl border border-[#252630]">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase">Room Type</div>
                  <div className="text-xs font-semibold text-[#F5F7FA] mt-1 truncate">{activeRoom.type}</div>
                </div>
                <div className="bg-[#181A24] p-3 rounded-xl border border-[#252630]">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase">Equipment Condition</div>
                  <div className={`text-xs font-semibold mt-1 ${
                    activeRoom.equipmentCondition === 'Needs Attention' ? 'text-[#FF2E88]' : 'text-emerald-400'
                  }`}>
                    {activeRoom.equipmentCondition}
                  </div>
                </div>
                <div className="bg-[#181A24] p-3 rounded-xl border border-[#252630]">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase">Last Maintained</div>
                  <div className="text-xs font-mono text-zinc-300 mt-1">{activeRoom.lastMaintenanceDate}</div>
                </div>
              </div>

              {/* Installed Equipment List */}
              <div>
                <h4 className="text-xs font-mono uppercase text-zinc-400 mb-2 flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5 text-[#007BA7]" />
                  <span>Installed Equipment & Tech</span>
                </h4>
                <div className="space-y-1.5">
                  {activeRoom.equipment.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#181A24] border border-[#252630] text-xs">
                      <span className="text-zinc-200">{item}</span>
                      <span className="text-[10px] font-mono text-emerald-400">Verified</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Architectural Features */}
              <div>
                <h4 className="text-xs font-mono uppercase text-zinc-400 mb-2">Features & Amenities</h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeRoom.features.map((feat, idx) => (
                    <span key={idx} className="text-[11px] px-2.5 py-1 rounded-md bg-[#161822] border border-[#252630] text-zinc-300">
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Maintenance Alert if applicable */}
              {activeRoom.notes && (
                <div className="p-3 rounded-xl bg-[#FF2E88]/10 border border-[#FF2E88]/30 text-xs">
                  <div className="font-semibold text-[#FF2E88] flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Operational Note</span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">{activeRoom.notes}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-5 border-t border-[#252630] space-y-2 bg-[#12131A]">
              <button
                onClick={() => onBookRoom(activeRoom)}
                disabled={activeRoom.status === 'maintenance'}
                className="w-full py-2.5 px-4 rounded-xl bg-[#007BA7] hover:bg-[#0091C6] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-lg shadow-[#007BA7]/20 flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book This Classroom</span>
              </button>

              <button
                onClick={() => onReportIssue(activeRoom)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1E202B] hover:bg-[#282B3A] border border-[#FF2E88]/40 hover:border-[#FF2E88] text-[#FF2E88] text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Wrench className="w-4 h-4" />
                <span>Report Maintenance Issue</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
