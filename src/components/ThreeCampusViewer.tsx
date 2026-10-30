import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Building, Floor } from '../types/campus';
import { 
  Compass, 
  Maximize2, 
  Minimize2, 
  RotateCw, 
  Layers, 
  ChevronRight, 
  X, 
  Sparkles,
  Zap,
  Wrench,
  DoorOpen,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Info
} from 'lucide-react';

interface ThreeCampusViewerProps {
  buildings: Building[];
  selectedBuilding: Building | null;
  onSelectBuilding: (building: Building) => void;
  onDeselectBuilding: () => void;
  onSelectFloor?: (floor: Floor) => void;
  onOpenFloorPlan?: (building: Building) => void;
}

interface BuildingUserData {
  type: 'building';
  buildingId: string;
}

export const ThreeCampusViewer: React.FC<ThreeCampusViewerProps> = ({
  buildings,
  selectedBuilding,
  onSelectBuilding,
  onDeselectBuilding,
  onSelectFloor,
  onOpenFloorPlan
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredBuilding, setHoveredBuilding] = useState<Building | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(false);
  const [selectedFloorIndex, setSelectedFloorIndex] = useState<number | null>(null);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const reqIdRef = useRef<number | null>(null);

  // Interactive meshes map for raycasting
  const buildingMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const interactiveHitBoxesRef = useRef<THREE.Mesh[]>([]);

  // Camera animation target state
  const cameraTargetRef = useRef<{
    pos: THREE.Vector3;
    look: THREE.Vector3;
    currentLook: THREE.Vector3;
    isAnimating: boolean;
  }>({
    pos: new THREE.Vector3(0, 80, 110),
    look: new THREE.Vector3(0, 4, 0),
    currentLook: new THREE.Vector3(0, 4, 0),
    isAnimating: false
  });

  // Orbit controls state
  const orbitRef = useRef<{
    isDragging: boolean;
    dragType: 'rotate' | 'pan';
    startX: number;
    startY: number;
    hasDragged: boolean;
    theta: number; // horizontal angle
    phi: number;   // vertical angle
    radius: number;
    center: THREE.Vector3;
  }>({
    isDragging: false,
    dragType: 'rotate',
    startX: 0,
    startY: 0,
    hasDragged: false,
    theta: Math.PI * 0.25,
    phi: Math.PI * 0.32,
    radius: 135,
    center: new THREE.Vector3(0, 4, 0)
  });

  // Default campus overview camera config
  const DEFAULT_CAM_POS = new THREE.Vector3(0, 85, 115);
  const DEFAULT_LOOK_AT = new THREE.Vector3(0, 4, 0);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0a0c);
    scene.fog = new THREE.FogExp2(0x0a0a0c, 0.0035);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 1000);
    camera.position.copy(DEFAULT_CAM_POS);
    camera.lookAt(DEFAULT_LOOK_AT);
    cameraRef.current = camera;
    cameraTargetRef.current.pos.copy(DEFAULT_CAM_POS);
    cameraTargetRef.current.look.copy(DEFAULT_LOOK_AT);
    cameraTargetRef.current.currentLook.copy(DEFAULT_LOOK_AT);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting System
    const ambientLight = new THREE.AmbientLight(0x1a243b, 1.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xd9ebff, 2.4);
    dirLight.position.set(70, 110, 60);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 350;
    dirLight.shadow.camera.left = -90;
    dirLight.shadow.camera.right = 90;
    dirLight.shadow.camera.top = 90;
    dirLight.shadow.camera.bottom = -90;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // Secondary fill light with neon rose tint
    const fillLight = new THREE.DirectionalLight(0xff2e88, 0.45);
    fillLight.position.set(-80, 40, -50);
    scene.add(fillLight);

    // Cyan underglow / ground bounce
    const bounceLight = new THREE.DirectionalLight(0x007ba7, 0.6);
    bounceLight.position.set(0, -30, 20);
    scene.add(bounceLight);

    // 5. Environment & Campus Terrain
    createCampusEnvironment(scene);

    // 6. Build the 3D Campus Buildings
    createCampusBuildings(scene, buildings);

    // 7. Render Loop with smooth lerping
    const clock = new THREE.Clock();

    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Handle auto rotation when not dragging & overview mode
      if (autoRotate && !orbitRef.current.isDragging && !selectedBuilding) {
        orbitRef.current.theta += delta * 0.12;
        updateCameraFromOrbit();
      }

      // Smooth camera position & lookAt lerping
      const ct = cameraTargetRef.current;
      if (cameraRef.current) {
        cameraRef.current.position.lerp(ct.pos, 0.075);
        ct.currentLook.lerp(ct.look, 0.08);
        cameraRef.current.lookAt(ct.currentLook);
      }

      // Animate subtle pulsing features (e.g. cyber obelisk, beacon lines)
      const time = clock.getElapsedTime();
      const pulseGroup = scene.getObjectByName('cyber-beacon');
      if (pulseGroup) {
        pulseGroup.rotation.y = time * 0.5;
        const beaconLight = scene.getObjectByName('beacon-point-light') as THREE.PointLight;
        if (beaconLight) {
          beaconLight.intensity = 2.5 + Math.sin(time * 3) * 0.8;
        }
      }

      renderer.render(scene, cameraRef.current!);
    };

    animate();

    // 8. Resize listener
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update buildings if list changes
  useEffect(() => {
    if (sceneRef.current) {
      createCampusBuildings(sceneRef.current, buildings);
    }
  }, [buildings]);

  // Handle selectedBuilding prop changes: animate camera to target building or reset to campus
  useEffect(() => {
    if (!cameraRef.current) return;

    if (selectedBuilding && selectedBuilding.campusPosition) {
      const pos = selectedBuilding.campusPosition;
      // Focus on selected building
      cameraTargetRef.current.pos.set(pos.x + 24, 25, pos.z + 32);
      cameraTargetRef.current.look.set(pos.x, 6, pos.z);
      cameraTargetRef.current.isAnimating = true;

      // Update orbit controls center
      orbitRef.current.center.set(pos.x, 6, pos.z);
      orbitRef.current.radius = 45;
    } else {
      // Return to campus overview
      cameraTargetRef.current.pos.copy(DEFAULT_CAM_POS);
      cameraTargetRef.current.look.copy(DEFAULT_LOOK_AT);
      cameraTargetRef.current.isAnimating = true;

      orbitRef.current.center.copy(DEFAULT_LOOK_AT);
      orbitRef.current.radius = 135;
      setSelectedFloorIndex(null);
    }
  }, [selectedBuilding]);

  // Update building highlights when hovered or selected changes
  useEffect(() => {
    buildingMeshesRef.current.forEach((group, id) => {
      const isSelected = selectedBuilding?.id === id;
      const isHovered = hoveredBuilding?.id === id;

      group.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const role = mesh.userData.role;

          if (role === 'outline') {
            const mat = mesh.material as THREE.LineBasicMaterial;
            if (isSelected) {
              mat.color.setHex(0xff2e88); // Neon Rose
              mat.linewidth = 2;
            } else if (isHovered) {
              mat.color.setHex(0x00d2ff); // Bright Cyan
            } else {
              mat.color.setHex(0x007ba7); // Cerulean Blue
            }
          }

          if (role === 'wall') {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            if (isSelected) {
              mat.emissive.setHex(0x3a0d24);
              mat.emissiveIntensity = 0.55;
            } else if (isHovered) {
              mat.emissive.setHex(0x042436);
              mat.emissiveIntensity = 0.35;
            } else {
              mat.emissive.setHex(0x000000);
              mat.emissiveIntensity = 0;
            }
          }

          if (role === 'window') {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            if (isSelected) {
              mat.color.setHex(0xff5599);
              mat.emissive.setHex(0xff2e88);
              mat.emissiveIntensity = 0.8;
            } else if (isHovered) {
              mat.color.setHex(0x38bdf8);
              mat.emissive.setHex(0x007ba7);
              mat.emissiveIntensity = 0.7;
            } else {
              mat.color.setHex(0x00a3cc);
              mat.emissive.setHex(0x005577);
              mat.emissiveIntensity = 0.45;
            }
          }
        }
      });
    });
  }, [hoveredBuilding, selectedBuilding]);

  // Helper to recompute camera position based on spherical coordinates
  const updateCameraFromOrbit = useCallback(() => {
    const o = orbitRef.current;
    const x = o.center.x + o.radius * Math.sin(o.phi) * Math.sin(o.theta);
    const y = o.center.y + o.radius * Math.cos(o.phi);
    const z = o.center.z + o.radius * Math.sin(o.phi) * Math.cos(o.theta);

    cameraTargetRef.current.pos.set(x, y, z);
    cameraTargetRef.current.look.copy(o.center);
  }, []);

  // Raycast helper to find which building was hovered/clicked
  const performRaycast = (clientX: number, clientY: number): Building | null => {
    if (!containerRef.current || !cameraRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const intersects = raycaster.intersectObjects(interactiveHitBoxesRef.current, false);
    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const bId = hit.userData.buildingId;
      return buildings.find((b) => b.id === bId) || null;
    }
    return null;
  };

  // Mouse interaction handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.button !== 2) return;
    const o = orbitRef.current;
    o.isDragging = true;
    o.dragType = e.button === 2 || e.shiftKey ? 'pan' : 'rotate';
    o.startX = e.clientX;
    o.startY = e.clientY;
    o.hasDragged = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const o = orbitRef.current;
    setMousePos({ x: e.clientX, y: e.clientY });

    if (o.isDragging) {
      const dx = e.clientX - o.startX;
      const dy = e.clientY - o.startY;

      if (Math.hypot(dx, dy) > 4) {
        o.hasDragged = true;
      }

      if (o.dragType === 'rotate') {
        o.theta -= dx * 0.007;
        o.phi = Math.max(0.12, Math.min(Math.PI / 2 - 0.05, o.phi - dy * 0.007));
        updateCameraFromOrbit();
      } else {
        // Pan
        const panSpeed = 0.08 * (o.radius / 100);
        o.center.x -= dx * panSpeed;
        o.center.z -= dy * panSpeed;
        updateCameraFromOrbit();
      }

      o.startX = e.clientX;
      o.startY = e.clientY;
    } else {
      // Hover detection
      const hitBuilding = performRaycast(e.clientX, e.clientY);
      if (hitBuilding !== hoveredBuilding) {
        setHoveredBuilding(hitBuilding);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const o = orbitRef.current;
    if (o.isDragging && !o.hasDragged) {
      // Considered a click!
      const hit = performRaycast(e.clientX, e.clientY);
      if (hit) {
        onSelectBuilding(hit);
      } else {
        // Clicked ground outside any building
        if (selectedBuilding) {
          onDeselectBuilding();
        }
      }
    }
    o.isDragging = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const o = orbitRef.current;
    const zoomFactor = e.deltaY > 0 ? 1.08 : 0.92;
    o.radius = Math.max(22, Math.min(220, o.radius * zoomFactor));
    updateCameraFromOrbit();
  };

  // Reset to full campus overview
  const handleResetOverview = () => {
    onDeselectBuilding();
    orbitRef.current.center.copy(DEFAULT_LOOK_AT);
    orbitRef.current.radius = 135;
    orbitRef.current.theta = Math.PI * 0.25;
    orbitRef.current.phi = Math.PI * 0.32;
    cameraTargetRef.current.pos.copy(DEFAULT_CAM_POS);
    cameraTargetRef.current.look.copy(DEFAULT_LOOK_AT);
  };

  const handleZoomIn = () => {
    const o = orbitRef.current;
    o.radius = Math.max(22, o.radius * 0.85);
    updateCameraFromOrbit();
  };

  const handleZoomOut = () => {
    const o = orbitRef.current;
    o.radius = Math.min(220, o.radius * 1.15);
    updateCameraFromOrbit();
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-[#0A0A0C]">
      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        className={`w-full h-full cursor-grab ${orbitRef.current.isDragging ? 'cursor-grabbing' : hoveredBuilding ? 'cursor-pointer' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Top Floating Breadcrumb & Control Bar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="flex items-center bg-[#0A0A0C]/85 backdrop-blur-md border border-[#252630] rounded-xl px-4 py-2 shadow-2xl text-xs font-medium text-[#F5F7FA]">
          <button
            onClick={handleResetOverview}
            className="flex items-center gap-1.5 text-slate-400 hover:text-[#007BA7] transition-colors cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-[#007BA7]" />
            <span>Campus Overview</span>
          </button>

          {selectedBuilding && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 mx-1" />
              <span className="text-[#FF2E88] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF2E88] animate-pulse" />
                {selectedBuilding.name} ({selectedBuilding.code})
              </span>
            </>
          )}

          {selectedFloorIndex !== null && selectedBuilding && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 mx-1" />
              <span className="text-[#007BA7] font-semibold">
                Floor {selectedFloorIndex}
              </span>
            </>
          )}
        </div>

        {selectedBuilding && (
          <button
            onClick={handleResetOverview}
            className="p-2 rounded-xl bg-[#0A0A0C]/85 backdrop-blur-md border border-[#252630] text-slate-400 hover:text-white hover:border-[#FF2E88]/50 transition-all cursor-pointer shadow-lg"
            title="Return to campus overview"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Top Right Quick Actions & Camera Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 bg-[#0A0A0C]/85 backdrop-blur-md border border-[#252630] rounded-xl p-1.5 shadow-2xl">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1.5 ${
              autoRotate ? 'bg-[#FF2E88]/20 text-[#FF2E88] border border-[#FF2E88]/40' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
            title="Toggle Campus Orbit"
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Orbit</span>
          </button>

          <div className="w-[1px] h-4 bg-slate-800" />

          <button
            onClick={handleZoomIn}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer"
            title="Zoom In"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleZoomOut}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleResetOverview}
            className="p-2 text-slate-400 hover:text-[#007BA7] hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer"
            title="Reset to Full Campus"
          >
            <Compass className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating Hover Tooltip (When hovering buildings in overview) */}
      {hoveredBuilding && !selectedBuilding && (
        <div
          className="fixed pointer-events-none z-30 transform -translate-x-1/2 -translate-y-full mb-3 px-3.5 py-2.5 rounded-xl bg-[#0A0A0C]/95 backdrop-blur-md border border-[#007BA7]/50 shadow-2xl shadow-[#007BA7]/20 text-xs text-white"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y - 12}px`
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#007BA7] shadow-[0_0_8px_#007BA7]" />
            <span className="font-bold text-white">{hoveredBuilding.name}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#252630] text-[#007BA7] font-mono">
              {hoveredBuilding.code}
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 text-[11px] mt-1">
            <span>{hoveredBuilding.floorsCount} Floors</span>
            <span>•</span>
            <span>{hoveredBuilding.classroomsCount} Classrooms</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">{hoveredBuilding.status}</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500 italic">
            Click to zoom in and inspect building
          </div>
        </div>
      )}

      {/* Floating Building Detail Card (When a building is selected) */}
      {selectedBuilding && (
        <div className="absolute left-4 bottom-20 z-20 w-84 sm:w-96 max-w-[calc(100vw-2rem)] rounded-2xl bg-[#0A0A0C]/95 backdrop-blur-xl border border-[#252630] shadow-[0_12px_40px_rgba(0,0,0,0.85)] p-5 text-[#F5F7FA] transition-all">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider font-semibold bg-[#FF2E88]/15 text-[#FF2E88] border border-[#FF2E88]/30">
                  {selectedBuilding.code}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  selectedBuilding.status === 'Operational' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}>
                  <ShieldCheck className="w-3 h-3" />
                  {selectedBuilding.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white leading-tight">
                {selectedBuilding.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                {selectedBuilding.description}
              </p>
            </div>
            <button
              onClick={handleResetOverview}
              className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800/50 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Metric Grid */}
          <div className="grid grid-cols-4 gap-2 mb-4 py-2 border-y border-[#252630]/60 text-center">
            <div className="bg-[#121318] p-2 rounded-lg border border-[#252630]/40">
              <span className="text-[10px] text-slate-400 block">Floors</span>
              <span className="text-sm font-bold text-white font-mono">{selectedBuilding.floorsCount}</span>
            </div>
            <div className="bg-[#121318] p-2 rounded-lg border border-[#252630]/40">
              <span className="text-[10px] text-slate-400 block">Rooms</span>
              <span className="text-sm font-bold text-white font-mono">{selectedBuilding.classroomsCount}</span>
            </div>
            <div className="bg-[#121318] p-2 rounded-lg border border-[#252630]/40">
              <span className="text-[10px] text-slate-400 block">Assets</span>
              <span className="text-sm font-bold text-[#007BA7] font-mono">{selectedBuilding.equipmentCount}</span>
            </div>
            <div className="bg-[#121318] p-2 rounded-lg border border-[#252630]/40">
              <span className="text-[10px] text-slate-400 block">Issues</span>
              <span className={`text-sm font-bold font-mono ${
                selectedBuilding.openMaintenanceCount > 0 ? 'text-[#FF2E88]' : 'text-emerald-400'
              }`}>
                {selectedBuilding.openMaintenanceCount}
              </span>
            </div>
          </div>

          {/* Floor Quick Switcher */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#007BA7]" />
                Building Floors
              </span>
              <span className="text-[11px] text-slate-500">{selectedBuilding.floors.length} levels available</span>
            </div>
            <div className="flex items-center gap-1.5">
              {selectedBuilding.floors.map((fl, idx) => (
                <button
                  key={fl.id}
                  onClick={() => {
                    setSelectedFloorIndex(idx);
                    if (onSelectFloor) onSelectFloor(fl);
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                    selectedFloorIndex === idx
                      ? 'bg-[#FF2E88]/20 border-[#FF2E88] text-white shadow-[0_0_12px_rgba(255,46,136,0.25)]'
                      : 'bg-[#161720] border-[#252630] text-slate-300 hover:border-slate-500 hover:bg-[#1f202c]'
                  }`}
                >
                  <div className="text-[10px] text-slate-400">L{fl.floorNumber}</div>
                  <div className="truncate font-semibold">{fl.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Primary Action Button: Explore Floors (Triggers 2D Architectural Explorer) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onOpenFloorPlan) {
                  onOpenFloorPlan(selectedBuilding);
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#d8196e] text-white text-xs font-semibold hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,46,136,0.35)] cursor-pointer"
            >
              <DoorOpen className="w-4 h-4" />
              <span>Explore Floor Plans & Rooms</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Buildings Quick Selector Dock */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-2 bg-[#0A0A0C]/90 backdrop-blur-md border border-[#252630] rounded-2xl p-2 shadow-2xl">
        <button
          onClick={handleResetOverview}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            !selectedBuilding
              ? 'bg-[#007BA7] text-white shadow-[0_0_15px_rgba(0,123,167,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Full Campus</span>
        </button>

        <div className="w-[1px] h-4 bg-slate-800" />

        {buildings.map((b) => {
          const isSelected = selectedBuilding?.id === b.id;
          return (
            <button
              key={b.id}
              onClick={() => onSelectBuilding(b)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#FF2E88] text-white shadow-[0_0_15px_rgba(255,46,136,0.4)] font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-[#007BA7]'}`} />
              <span className="hidden md:inline">{b.name}</span>
              <span className="md:hidden font-mono">{b.code}</span>
            </button>
          );
        })}
      </div>

      {/* Cyber Grid Overlay / Compass Indicator */}
      <div className="absolute right-4 bottom-4 z-10 pointer-events-none hidden lg:flex flex-col items-end text-[10px] text-slate-500 font-mono">
        <div className="flex items-center gap-1 text-[#007BA7]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#007BA7] animate-ping" />
          <span>3D UNIFIED SYSTEM • ACTIVE</span>
        </div>
        <span>COORD: 34.0522° N, 118.2437° W</span>
        <span>RENDERER: WEBGL2 / ACES FILMIC</span>
      </div>
    </div>
  );

  // -------------------------------------------------------------
  // THREE.JS SCENE PROCEDURAL BUILDERS
  // -------------------------------------------------------------

  function createCampusEnvironment(scene: THREE.Scene) {
    // Ground plane with custom dark cyberpunk aesthetic
    const groundGeo = new THREE.PlaneGeometry(280, 240, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0c0d12,
      roughness: 0.85,
      metalness: 0.15
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.name = 'campus-terrain';
    scene.add(ground);

    // Subtle technological grid lines across terrain
    const gridHelper = new THREE.GridHelper(260, 52, 0x007ba7, 0x171926);
    gridHelper.position.y = 0.05;
    (gridHelper.material as THREE.Material).opacity = 0.35;
    (gridHelper.material as THREE.Material).transparent = true;
    scene.add(gridHelper);

    // Main Campus Ring Road & Central Boulevard
    createRoads(scene);

    // Central Innovation Plaza with digital monument & holographic beacon
    createCentralPlaza(scene);

    // Green grass plots & cyber foliage
    createGreenSpacesAndTrees(scene);

    // Turing Parking Bay with parked cyber cars
    createParkingArea(scene);
  }

  function createRoads(scene: THREE.Scene) {
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x14151c,
      roughness: 0.9,
      metalness: 0.1
    });

    const roadLineMat = new THREE.MeshBasicMaterial({
      color: 0x007ba7,
      transparent: true,
      opacity: 0.6
    });

    // 1. Central Boulevard (North - South)
    const northSouthRoad = new THREE.Mesh(new THREE.PlaneGeometry(16, 190), roadMat);
    northSouthRoad.rotation.x = -Math.PI / 2;
    northSouthRoad.position.set(0, 0.08, 0);
    northSouthRoad.receiveShadow = true;
    scene.add(northSouthRoad);

    // Glowing boulevard center strips
    const centerStrip = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 180), roadLineMat);
    centerStrip.rotation.x = -Math.PI / 2;
    centerStrip.position.set(0, 0.09, 0);
    scene.add(centerStrip);

    // 2. East-West Connecting Highway
    const eastWestRoad = new THREE.Mesh(new THREE.PlaneGeometry(220, 14), roadMat);
    eastWestRoad.rotation.x = -Math.PI / 2;
    eastWestRoad.position.set(0, 0.07, 14);
    eastWestRoad.receiveShadow = true;
    scene.add(eastWestRoad);

    // 3. Curved Pathway to Orion Academic Block
    const orionPath = new THREE.Mesh(new THREE.PlaneGeometry(12, 40), roadMat);
    orionPath.rotation.x = -Math.PI / 2;
    orionPath.position.set(0, 0.08, -35);
    scene.add(orionPath);
  }

  function createCentralPlaza(scene: THREE.Scene) {
    const plazaGroup = new THREE.Group();
    plazaGroup.name = 'cyber-beacon';

    // Circular paved plaza
    const plazaGeo = new THREE.CylinderGeometry(18, 19, 0.4, 32);
    const plazaMat = new THREE.MeshStandardMaterial({
      color: 0x181924,
      roughness: 0.6,
      metalness: 0.3
    });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.position.set(0, 0.2, 0);
    plaza.receiveShadow = true;
    scene.add(plaza);

    // Illuminated concentric ring
    const ringGeo = new THREE.RingGeometry(15, 15.6, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x007ba7,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(0, 0.42, 0);
    scene.add(ring);

    // Futuristic Central Digital Obelisk / Beacon
    const obeliskGeo = new THREE.CylinderGeometry(0.8, 2.2, 16, 6);
    const obeliskMat = new THREE.MeshStandardMaterial({
      color: 0x0f1016,
      roughness: 0.2,
      metalness: 0.8
    });
    const obelisk = new THREE.Mesh(obeliskGeo, obeliskMat);
    obelisk.position.set(0, 8, 0);
    obelisk.castShadow = true;
    plazaGroup.add(obelisk);

    // Neon accent ribs on the obelisk
    const ribGeo = new THREE.CylinderGeometry(0.9, 2.3, 15.8, 6, 1, true);
    const ribMat = new THREE.MeshBasicMaterial({
      color: 0xff2e88,
      wireframe: true
    });
    const rib = new THREE.Mesh(ribGeo, ribMat);
    rib.position.set(0, 8, 0);
    plazaGroup.add(rib);

    // Point Light atop the obelisk
    const beaconLight = new THREE.PointLight(0xff2e88, 3.2, 60);
    beaconLight.position.set(0, 16.5, 0);
    beaconLight.name = 'beacon-point-light';
    scene.add(beaconLight);

    // Floating crystal prism at the pinnacle
    const crystalGeo = new THREE.OctahedronGeometry(1.4, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x00d2ff,
      emissiveIntensity: 1.2,
      roughness: 0.1,
      metalness: 0.9
    });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.position.set(0, 17, 0);
    plazaGroup.add(crystal);

    scene.add(plazaGroup);
  }

  function createGreenSpacesAndTrees(scene: THREE.Scene) {
    // 4 major lawn quad plots around intersections
    const lawnMat = new THREE.MeshStandardMaterial({
      color: 0x0f241a,
      roughness: 0.9,
      metalness: 0.05
    });

    const lawns = [
      { x: -26, z: -18, w: 28, d: 24 },
      { x: 26, z: -18, w: 28, d: 24 },
      { x: -26, z: 38, w: 30, d: 24 },
      { x: 26, z: 38, w: 30, d: 24 }
    ];

    lawns.forEach((l) => {
      const lawnGeo = new THREE.BoxGeometry(l.w, 0.3, l.d);
      const lawnMesh = new THREE.Mesh(lawnGeo, lawnMat);
      lawnMesh.position.set(l.x, 0.15, l.z);
      lawnMesh.receiveShadow = true;
      scene.add(lawnMesh);

      // Add cyber trees along borders of lawn
      for (let i = 0; i < 5; i++) {
        const treeX = l.x - l.w / 2 + 3 + i * (l.w / 5);
        const treeZ1 = l.z - l.d / 2 + 2;
        const treeZ2 = l.z + l.d / 2 - 2;
        createCyberTree(scene, treeX, treeZ1);
        createCyberTree(scene, treeX, treeZ2);
      }
    });
  }

  function createCyberTree(scene: THREE.Scene, x: number, z: number) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, 0, z);

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.45, 3.2, 5);
    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x1f232b,
      roughness: 0.9
    });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.6;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Low-poly faceted canopy
    const foliageGeo = new THREE.ConeGeometry(2.1, 4.5, 6);
    const foliageMat = new THREE.MeshStandardMaterial({
      color: 0x0f402c,
      emissive: 0x005533,
      emissiveIntensity: 0.25,
      roughness: 0.6,
      flatShading: true
    });
    const foliage = new THREE.Mesh(foliageGeo, foliageMat);
    foliage.position.y = 4.4;
    foliage.castShadow = true;
    treeGroup.add(foliage);

    scene.add(treeGroup);
  }

  function createParkingArea(scene: THREE.Scene) {
    // Located near Turing Engineering Hub (east quad, around x: 74, z: 14)
    const parkingMat = new THREE.MeshStandardMaterial({
      color: 0x111219,
      roughness: 0.85
    });
    const parkingLot = new THREE.Mesh(new THREE.BoxGeometry(20, 0.2, 28), parkingMat);
    parkingLot.position.set(74, 0.1, 14);
    parkingLot.receiveShadow = true;
    scene.add(parkingLot);

    // Parked cyber transport vehicles
    const carColors = [0x007ba7, 0xff2e88, 0x475569, 0x0284c7, 0x1e293b];
    for (let row = 0; row < 4; row++) {
      for (let side = -1; side <= 1; side += 2) {
        if (Math.random() > 0.25) {
          const carGroup = new THREE.Group();
          const bodyGeo = new THREE.BoxGeometry(2.4, 1.2, 4.2);
          const bodyMat = new THREE.MeshStandardMaterial({
            color: carColors[(row + side + 10) % carColors.length],
            metalness: 0.7,
            roughness: 0.3
          });
          const body = new THREE.Mesh(bodyGeo, bodyMat);
          body.position.y = 0.7;
          body.castShadow = true;
          carGroup.add(body);

          // Headlights
          const lightGeo = new THREE.BoxGeometry(1.8, 0.2, 0.2);
          const lightMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff });
          const light = new THREE.Mesh(lightGeo, lightMat);
          light.position.set(0, 0.7, side > 0 ? 2.15 : -2.15);
          carGroup.add(light);

          carGroup.position.set(74 + side * 5, 0.1, 4 + row * 6);
          scene.add(carGroup);
        }
      }
    }
  }

  function createCampusBuildings(scene: THREE.Scene, bldgs: Building[]) {
    // Clear previous building meshes
    buildingMeshesRef.current.forEach((g) => scene.remove(g));
    buildingMeshesRef.current.clear();
    interactiveHitBoxesRef.current = [];

    bldgs.forEach((b) => {
      const pos = b.campusPosition || { x: 0, z: 0, width: 28, depth: 20, heightPerFloor: 3.8 };
      const group = new THREE.Group();
      group.name = `bldg-group-${b.id}`;
      group.position.set(pos.x, 0, pos.z);
      if (pos.rotation) {
        group.rotation.y = pos.rotation;
      }

      const floorsCount = b.floorsCount || 3;
      const floorH = pos.heightPerFloor || 3.8;
      const totalH = floorsCount * floorH;

      // 1. Building Base Foundation Slab
      const baseGeo = new THREE.BoxGeometry(pos.width + 2, 0.8, pos.depth + 2);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x12141c,
        roughness: 0.6,
        metalness: 0.4
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = 0.4;
      baseMesh.receiveShadow = true;
      group.add(baseMesh);

      // 2. Individual Architectural Floors
      for (let f = 0; f < floorsCount; f++) {
        const floorY = f * floorH + 0.8;

        // Concrete Floor Slab
        const slabGeo = new THREE.BoxGeometry(pos.width + 0.6, 0.5, pos.depth + 0.6);
        const slabMat = new THREE.MeshStandardMaterial({
          color: 0x1e202c,
          roughness: 0.5,
          metalness: 0.5
        });
        const slab = new THREE.Mesh(slabGeo, slabMat);
        slab.position.y = floorY + 0.25;
        slab.castShadow = true;
        slab.receiveShadow = true;
        group.add(slab);

        // Core building structure for this floor
        const wallGeo = new THREE.BoxGeometry(pos.width - 1.2, floorH - 0.5, pos.depth - 1.2);
        const wallMat = new THREE.MeshStandardMaterial({
          color: 0x0d0e14,
          roughness: 0.4,
          metalness: 0.6
        });
        const wall = new THREE.Mesh(wallGeo, wallMat);
        wall.position.y = floorY + 0.5 + (floorH - 0.5) / 2;
        wall.castShadow = true;
        wall.receiveShadow = true;
        wall.userData = { role: 'wall', floorIndex: f, buildingId: b.id };
        group.add(wall);

        // Glass curtain facade bands (Front & Back)
        const windowGeoFB = new THREE.BoxGeometry(pos.width, floorH * 0.55, 0.4);
        const windowMat = new THREE.MeshStandardMaterial({
          color: 0x00a3cc,
          emissive: 0x005577,
          emissiveIntensity: 0.45,
          roughness: 0.1,
          metalness: 0.8,
          transparent: true,
          opacity: 0.85
        });

        const windowFront = new THREE.Mesh(windowGeoFB, windowMat);
        windowFront.position.set(0, floorY + floorH * 0.55, pos.depth / 2);
        windowFront.userData = { role: 'window' };
        group.add(windowFront);

        const windowBack = new THREE.Mesh(windowGeoFB, windowMat);
        windowBack.position.set(0, floorY + floorH * 0.55, -pos.depth / 2);
        windowBack.userData = { role: 'window' };
        group.add(windowBack);

        // Glass curtain bands (Sides)
        const windowGeoSides = new THREE.BoxGeometry(0.4, floorH * 0.55, pos.depth - 1.5);
        const windowLeft = new THREE.Mesh(windowGeoSides, windowMat);
        windowLeft.position.set(-pos.width / 2, floorY + floorH * 0.55, 0);
        windowLeft.userData = { role: 'window' };
        group.add(windowLeft);

        const windowRight = new THREE.Mesh(windowGeoSides, windowMat);
        windowRight.position.set(pos.width / 2, floorY + floorH * 0.55, 0);
        windowRight.userData = { role: 'window' };
        group.add(windowRight);
      }

      // 3. Rooftop Architectural Details (Solar Array, HVAC, Helipad/Antenna)
      const roofY = totalH + 0.8;
      createRooftopFeatures(group, b, pos, roofY);

      // 4. Outer Wireframe Outline (Cerulean blue by default)
      const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(pos.width + 0.2, totalH + 0.5, pos.depth + 0.2));
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x007ba7,
        linewidth: 1.5
      });
      const outline = new THREE.LineSegments(edges, lineMat);
      outline.position.y = (totalH + 0.5) / 2 + 0.4;
      outline.userData = { role: 'outline' };
      group.add(outline);

      // 5. Grand Architectural Entrance Canopy at Ground
      const canopyGeo = new THREE.BoxGeometry(10, 0.4, 4);
      const canopyMat = new THREE.MeshStandardMaterial({
        color: 0x007ba7,
        emissive: 0x007ba7,
        emissiveIntensity: 0.3,
        roughness: 0.3
      });
      const canopy = new THREE.Mesh(canopyGeo, canopyMat);
      canopy.position.set(0, 3.2, pos.depth / 2 + 2);
      group.add(canopy);

      // Entrance light
      const entranceLight = new THREE.PointLight(0x00d2ff, 1.8, 18);
      entranceLight.position.set(0, 2.8, pos.depth / 2 + 2);
      group.add(entranceLight);

      // 6. Floating 3D Building Billboard Label
      createBuildingFloatingLabel(group, b, roofY + 6);

      // 7. Raycast HitBox for crisp interaction detection
      const hitBoxGeo = new THREE.BoxGeometry(pos.width + 4, totalH + 4, pos.depth + 4);
      const hitBoxMat = new THREE.MeshBasicMaterial({
        visible: false,
        wireframe: true
      });
      const hitBox = new THREE.Mesh(hitBoxGeo, hitBoxMat);
      hitBox.position.y = (totalH + 4) / 2;
      hitBox.userData = {
        type: 'building',
        buildingId: b.id
      };
      group.add(hitBox);
      interactiveHitBoxesRef.current.push(hitBox);

      scene.add(group);
      buildingMeshesRef.current.set(b.id, group);
    });
  }

  function createRooftopFeatures(group: THREE.Group, b: Building, pos: any, roofY: number) {
    // Rooftop parapet
    const parapetGeo = new THREE.BoxGeometry(pos.width + 0.4, 0.8, pos.depth + 0.4);
    const parapetMat = new THREE.MeshStandardMaterial({ color: 0x191b26 });
    const parapet = new THREE.Mesh(parapetGeo, parapetMat);
    parapet.position.y = roofY + 0.4;
    group.add(parapet);

    // HVAC cooling towers
    for (let i = 0; i < 2; i++) {
      const hvacGeo = new THREE.BoxGeometry(3.5, 2, 3.5);
      const hvacMat = new THREE.MeshStandardMaterial({ color: 0x242838, metalness: 0.8 });
      const hvac = new THREE.Mesh(hvacGeo, hvacMat);
      hvac.position.set(pos.width / 4 - i * 6, roofY + 1.4, -pos.depth / 4);
      group.add(hvac);
    }

    // Specific features by building
    if (b.id === 'bldg-turing') {
      // Antenna mast with blinking beacon
      const mastGeo = new THREE.CylinderGeometry(0.15, 0.4, 10, 8);
      const mastMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
      const mast = new THREE.Mesh(mastGeo, mastMat);
      mast.position.set(-pos.width / 3, roofY + 5.5, pos.depth / 4);
      group.add(mast);

      const beacon = new THREE.PointLight(0xff2e88, 1.8, 14);
      beacon.position.set(-pos.width / 3, roofY + 10.6, pos.depth / 4);
      group.add(beacon);
    } else if (b.id === 'bldg-lovelace') {
      // Glass observatory dome / bio-research dome
      const domeGeo = new THREE.SphereGeometry(3.8, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
      const domeMat = new THREE.MeshStandardMaterial({
        color: 0x00d2ff,
        emissive: 0x007ba7,
        emissiveIntensity: 0.4,
        roughness: 0.1,
        transparent: true,
        opacity: 0.75
      });
      const dome = new THREE.Mesh(domeGeo, domeMat);
      dome.position.set(-pos.width / 4, roofY + 0.8, pos.depth / 4);
      group.add(dome);
    } else {
      // Solar panel matrix on Orion
      const solarMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        metalness: 0.9,
        roughness: 0.2
      });
      for (let s = 0; s < 3; s++) {
        const solar = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.2, 7), solarMat);
        solar.rotation.x = 0.2;
        solar.position.set(-pos.width / 4 + s * 5.5, roofY + 1.2, 0);
        group.add(solar);
      }
    }
  }

  function createBuildingFloatingLabel(group: THREE.Group, b: Building, yPos: number) {
    // Canvas billboard texture with building name & code
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 140;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background badge
    ctx.fillStyle = 'rgba(10, 10, 12, 0.92)';
    ctx.roundRect(10, 10, 492, 120, 24);
    ctx.fill();

    // Border
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#007BA7';
    ctx.stroke();

    // Code Pill
    ctx.fillStyle = '#FF2E88';
    ctx.roundRect(30, 32, 80, 36, 10);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(b.code, 70, 58);

    // Building Title
    ctx.fillStyle = '#F5F7FA';
    ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(b.name, 126, 60);

    // Subtitle / Stats
    ctx.fillStyle = '#94A3B8';
    ctx.font = '20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${b.floorsCount} Floors • ${b.classroomsCount} Rooms • ${b.status}`, 32, 104);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(16, 4.4, 1);
    sprite.position.set(0, yPos, 0);
    group.add(sprite);
  }
};
