import { useMemo, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import HotelIcon from '@mui/icons-material/Hotel';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import {
  DndContext,
  closestCenter,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragOverlay,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { insertPlanChip, updatePlanChip, deletePlanChip, resetWeekPlan } from '../utils/supabase';

const CHIP_TYPES = [
  { type: 'cardio', label: 'Cardio', count: 3, icon: DirectionsRunIcon, color: '#e8a33d' },
  { type: 'strength', label: 'Strength', count: 2, icon: FitnessCenterIcon, color: '#5c7a68' },
  { type: 'stability', label: 'Stability', count: 1, icon: SelfImprovementIcon, color: '#e8e6de' },
  { type: 'rest', label: 'Rest', count: 2, icon: HotelIcon, color: '#8b9198' },
  { type: 'interval', label: 'Interval (VO2)', count: 1, icon: MonitorHeartIcon, color: '#c1523a' },
];
const CHIP_META = Object.fromEntries(CHIP_TYPES.map((c) => [c.type, c]));

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

function buildPool(planChips) {
  const placedCounts = {};
  planChips.forEach((c) => { placedCounts[c.chipType] = (placedCounts[c.chipType] || 0) + 1; });
  const pool = [];
  CHIP_TYPES.forEach((ct) => {
    const remaining = ct.count - (placedCounts[ct.type] || 0);
    for (let i = 0; i < remaining; i++) pool.push({ id: `pool-${ct.type}-${i}`, chipType: ct.type });
  });
  return pool;
}

function ChipVisual({ chipType, dragging }) {
  const meta = CHIP_META[chipType];
  const Icon = meta.icon;
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.6,
        px: 1.25,
        py: 0.6,
        borderRadius: 14,
        border: '1px solid',
        borderColor: meta.color,
        color: meta.color,
        backgroundColor: 'background.paper',
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize: 12,
        whiteSpace: 'nowrap',
        boxShadow: dragging ? '0 4px 12px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      <Icon sx={{ fontSize: 15 }} />
      {meta.label}
    </Box>
  );
}

function PlanChip({ id, chipType }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    touchAction: 'none',
    cursor: 'grab',
  };
  return (
    <Box ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ChipVisual chipType={chipType} />
    </Box>
  );
}

function DroppableRow({ id, minHeight, empty, column, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <Box
      ref={setNodeRef}
      sx={{
        display: 'flex',
        flexDirection: column ? 'column' : 'row',
        flexWrap: column ? 'nowrap' : 'wrap',
        alignItems: column ? 'stretch' : 'center',
        gap: 1,
        minHeight,
        p: 1,
        borderRadius: 0.75,
        border: '1px dashed',
        borderColor: isOver ? 'primary.main' : 'divider',
        backgroundColor: isOver ? 'rgba(232,163,61,0.06)' : 'transparent',
        transition: 'border-color 0.15s, background-color 0.15s',
      }}
    >
      {children}
      {empty && (
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{empty}</Typography>
      )}
    </Box>
  );
}

export default function PlanTab({ planChips, setPlanChips }) {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const containers = useMemo(() => {
    const c = { pool: buildPool(planChips) };
    DAYS.forEach((d) => {
      c[d.key] = planChips.filter((x) => x.day === d.key).sort((a, b) => a.position - b.position);
    });
    return c;
  }, [planChips]);

  function findChip(id) {
    for (const key of Object.keys(containers)) {
      const found = containers[key].find((c) => c.id === id);
      if (found) return { chip: found, container: key };
    }
    return null;
  }

  // Resolve which container the pointer is actually within first (pointerWithin, falling
  // back to rectIntersection), then - if that resolves to a container rather than a specific
  // chip - refine to the closest chip inside that container. Plain closestCenter alone measures
  // raw distance to every droppable's center regardless of containment, which mis-highlights
  // and mis-drops onto unrelated rows once a container is mostly empty.
  function collisionDetectionStrategy(args) {
    const pointerIntersections = pointerWithin(args);
    const intersections = pointerIntersections.length > 0 ? pointerIntersections : rectIntersection(args);
    let overId = getFirstCollision(intersections, 'id');

    if (overId != null) {
      const containerItems = containers[overId];
      if (containerItems && containerItems.length > 0) {
        const itemIds = new Set(containerItems.map((c) => c.id));
        const closest = closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter((dc) => itemIds.has(dc.id)),
        });
        overId = closest[0]?.id ?? overId;
      }
      return [{ id: overId }];
    }
    return [];
  }

  async function handleDragEnd({ active, over }) {
    setActiveId(null);
    if (!over) return;
    const found = findChip(active.id);
    if (!found) return;
    const { chip: activeItem, container: sourceContainer } = found;
    const destContainer = containers[over.id] ? over.id : findChip(over.id)?.container;
    if (!destContainer) return;

    const destItems = containers[destContainer];
    let newIndex = destItems.findIndex((c) => c.id === over.id);
    if (newIndex === -1) newIndex = destItems.length;

    try {
      if (sourceContainer === destContainer) {
        if (sourceContainer === 'pool') return; // pool chips are interchangeable, nothing to persist
        const oldIndex = destItems.findIndex((c) => c.id === active.id);
        if (oldIndex === newIndex) return;
        const reordered = arrayMove(destItems, oldIndex, newIndex);
        await Promise.all(reordered.map((c, i) => (c.position === i ? null : updatePlanChip(c.id, sourceContainer, i))));
        setPlanChips((prev) =>
          prev.map((c) => {
            const idx = reordered.findIndex((r) => r.id === c.id);
            return idx === -1 ? c : { ...c, position: idx };
          })
        );
      } else if (sourceContainer === 'pool') {
        const newRow = await insertPlanChip(destContainer, activeItem.chipType, newIndex);
        setPlanChips((prev) => [...prev, newRow]);
      } else if (destContainer === 'pool') {
        await deletePlanChip(activeItem.id);
        setPlanChips((prev) => prev.filter((c) => c.id !== activeItem.id));
      } else {
        await updatePlanChip(activeItem.id, destContainer, newIndex);
        setPlanChips((prev) => prev.map((c) => (c.id === activeItem.id ? { ...c, day: destContainer, position: newIndex } : c)));
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleReset() {
    if (!window.confirm('Reset your week plan? This clears every placed chip back to the pool.')) return;
    try {
      await resetWeekPlan();
      setPlanChips([]);
    } catch (err) {
      console.error(err);
    }
  }

  const activeChip = activeId ? findChip(activeId)?.chip : null;

  return (
    <Box>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={({ active }) => setActiveId(active.id)}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={handleDragEnd}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: { xs: 3, md: 4 }, alignItems: 'start' }}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.75 }}>
              <Typography sx={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                Week
              </Typography>
              <Button size="small" variant="outlined" color="inherit" onClick={handleReset} sx={{ color: 'text.secondary', borderColor: 'divider' }}>
                Reset Plan
              </Button>
            </Box>

            {DAYS.map((day) => (
              <Box key={day.key} sx={{ mb: 1.5 }}>
                <Typography sx={{ fontSize: 11, letterSpacing: 1, color: 'text.secondary', textTransform: 'uppercase', mb: 0.5 }}>
                  {day.label}
                </Typography>
                <SortableContext items={containers[day.key].map((c) => c.id)} strategy={rectSortingStrategy}>
                  <DroppableRow id={day.key} minHeight={48}>
                    {containers[day.key].map((chip) => (
                      <PlanChip key={chip.id} id={chip.id} chipType={chip.chipType} />
                    ))}
                  </DroppableRow>
                </SortableContext>
              </Box>
            ))}
          </Box>

          <Box>
            <Typography sx={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, letterSpacing: 1.5, textTransform: 'uppercase', mb: 1.75 }}>
              Available
            </Typography>
            <SortableContext items={containers.pool.map((c) => c.id)} strategy={rectSortingStrategy}>
              <DroppableRow id="pool" minHeight={56} column empty={containers.pool.length === 0 ? 'All chips placed.' : null}>
                {containers.pool.map((chip) => (
                  <PlanChip key={chip.id} id={chip.id} chipType={chip.chipType} />
                ))}
              </DroppableRow>
            </SortableContext>
          </Box>
        </Box>

        <DragOverlay>{activeChip ? <ChipVisual chipType={activeChip.chipType} dragging /> : null}</DragOverlay>
      </DndContext>
    </Box>
  );
}
