import React, { useState, useRef, useEffect, useCallback } from 'react';
import { EditorSlide, SlideElement, SlideElementStyle } from '../../types';
import {
  Sparkles,
  Move,
  RotateCw,
  Maximize2,
  ExternalLink,
  Magnet,
  Grid,
  Grid3X3,
  Lock,
} from 'lucide-react';

export interface AlignmentGuideV {
  x: number;
  label?: string;
  type: 'canvas-center' | 'canvas-margin' | 'element-edge' | 'element-center';
  alignedElementId?: string;
}

export interface AlignmentGuideH {
  y: number;
  label?: string;
  type: 'canvas-center' | 'canvas-margin' | 'element-edge' | 'element-center';
  alignedElementId?: string;
}

interface Props {
  slide: EditorSlide;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<SlideElement>) => void;
  onCommitTransform?: (
    id: string,
    prevRect: { x: number; y: number; width: number; height: number; rotation: number },
    newRect: { x: number; y: number; width: number; height: number; rotation: number },
    actionType: 'move' | 'resize' | 'rotate'
  ) => void;
  onCommitTextEdit?: (id: string, prevText: string, newText: string) => void;
  onCommitNudge?: (
    id: string,
    prevRect: { x: number; y: number; width: number; height: number; rotation: number },
    newRect: { x: number; y: number; width: number; height: number; rotation: number }
  ) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onImageDrop?: (imageUrl: string) => void;
}

type DragAction = 'move' | 'resize' | 'rotate' | null;

export const EditorCanvas: React.FC<Props> = ({
  slide,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onCommitTransform,
  onCommitTextEdit,
  onCommitNudge,
  onDeleteElement,
  onDuplicateElement,
  onImageDrop,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  // Dragging & Resizing interaction state
  const [activeAction, setActiveAction] = useState<DragAction>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const initialTextRef = useRef<string>('');
  const hasMovedRef = useRef<boolean>(false);

  // Alignment Guides & Snap to Grid state
  const [activeVerticalGuides, setActiveVerticalGuides] = useState<AlignmentGuideV[]>([]);
  const [activeHorizontalGuides, setActiveHorizontalGuides] = useState<AlignmentGuideH[]>([]);
  const [alignedElementIds, setAlignedElementIds] = useState<string[]>([]);

  // Toggles for snapping and grid
  const [snapToGuides, setSnapToGuides] = useState<boolean>(true);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(false);

  // References to track drag gesture data
  const dragStartPos = useRef<{ clientX: number; clientY: number }>({ clientX: 0, clientY: 0 });
  const elementStartRect = useRef<{ x: number; y: number; width: number; height: number; rotation: number }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
  });

  const selectedElement = slide.elements.find((el) => el.id === selectedElementId) || null;

  // Handle pointer down on element to initiate move
  const handleElementPointerDown = (e: React.PointerEvent, el: SlideElement) => {
    e.stopPropagation();
    onSelectElement(el.id);

    if (el.locked) return; // Prevent move if element is locked
    if (editingTextId === el.id) return; // Allow normal cursor movement if actively editing text

    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    setActiveAction('move');
    hasMovedRef.current = false;
    dragStartPos.current = { clientX: e.clientX, clientY: e.clientY };
    elementStartRect.current = {
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      rotation: el.rotation || 0,
    };
  };

  // Handle pointer down on resize handles
  const handleResizePointerDown = (e: React.PointerEvent, handle: string) => {
    e.stopPropagation();
    if (!selectedElement) return;

    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    setActiveAction('resize');
    setResizeHandle(handle);
    hasMovedRef.current = false;
    dragStartPos.current = { clientX: e.clientX, clientY: e.clientY };
    elementStartRect.current = {
      x: selectedElement.x,
      y: selectedElement.y,
      width: selectedElement.width,
      height: selectedElement.height,
      rotation: selectedElement.rotation || 0,
    };
  };

  // Handle pointer down on rotate handle
  const handleRotatePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (!selectedElement) return;

    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    setActiveAction('rotate');
    hasMovedRef.current = false;
    dragStartPos.current = { clientX: e.clientX, clientY: e.clientY };
    elementStartRect.current = {
      x: selectedElement.x,
      y: selectedElement.y,
      width: selectedElement.width,
      height: selectedElement.height,
      rotation: selectedElement.rotation || 0,
    };
  };

  // Global Pointer Move
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!activeAction || !selectedElement || !canvasRef.current) return;
      hasMovedRef.current = true;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const deltaXPercent = ((e.clientX - dragStartPos.current.clientX) / canvasRect.width) * 100;
      const deltaYPercent = ((e.clientY - dragStartPos.current.clientY) / canvasRect.height) * 100;

      const vGuides: AlignmentGuideV[] = [];
      const hGuides: AlignmentGuideH[] = [];
      const targetElementIds: string[] = [];
      const SNAP_THRESHOLD = 0.9; // % of canvas width/height

      if (activeAction === 'move') {
        let newX = elementStartRect.current.x + deltaXPercent;
        let newY = elementStartRect.current.y + deltaYPercent;

        const currentW = elementStartRect.current.width;
        const currentH = elementStartRect.current.height;

        if (snapToGuides) {
          // 1. VERTICAL CANDIDATES (X positions)
          interface CandidateX {
            targetX: number;
            guideX: number;
            label: string;
            type: 'canvas-center' | 'canvas-margin' | 'element-edge' | 'element-center';
            otherId?: string;
          }

          const candidatesX: CandidateX[] = [
            // Canvas Center
            {
              targetX: 50 - currentW / 2,
              guideX: 50,
              label: 'Centro',
              type: 'canvas-center',
            },
            // Left Margin (5%)
            {
              targetX: 5,
              guideX: 5,
              label: 'Margem Esquerda',
              type: 'canvas-margin',
            },
            // Right Margin (95%)
            {
              targetX: 95 - currentW,
              guideX: 95,
              label: 'Margem Direita',
              type: 'canvas-margin',
            },
          ];

          // Check against all other elements on the slide
          slide.elements.forEach((other) => {
            if (other.id === selectedElement.id) return;
            const oLeft = other.x;
            const oRight = other.x + other.width;
            const oCenter = other.x + other.width / 2;
            const oName = other.name || 'Elemento';

            // Left edge aligns with other left edge
            candidatesX.push({
              targetX: oLeft,
              guideX: oLeft,
              label: `Alinhado à Esquerda (${oName})`,
              type: 'element-edge',
              otherId: other.id,
            });
            // Right edge aligns with other right edge
            candidatesX.push({
              targetX: oRight - currentW,
              guideX: oRight,
              label: `Alinhado à Direita (${oName})`,
              type: 'element-edge',
              otherId: other.id,
            });
            // Centers align horizontally
            candidatesX.push({
              targetX: oCenter - currentW / 2,
              guideX: oCenter,
              label: `Centro com (${oName})`,
              type: 'element-center',
              otherId: other.id,
            });
            // Left edge touches other right edge
            candidatesX.push({
              targetX: oRight,
              guideX: oRight,
              label: `Adjacente (${oName})`,
              type: 'element-edge',
              otherId: other.id,
            });
            // Right edge touches other left edge
            candidatesX.push({
              targetX: oLeft - currentW,
              guideX: oLeft,
              label: `Adjacente (${oName})`,
              type: 'element-edge',
              otherId: other.id,
            });
          });

          // Find closest candidate on X
          let bestCandidateX: CandidateX | null = null;
          let minDiffX = SNAP_THRESHOLD;
          for (const c of candidatesX) {
            const diff = Math.abs(newX - c.targetX);
            if (diff < minDiffX) {
              minDiffX = diff;
              bestCandidateX = c;
            }
          }

          if (bestCandidateX) {
            newX = bestCandidateX.targetX;
            vGuides.push({
              x: Math.round(bestCandidateX.guideX * 10) / 10,
              label: bestCandidateX.label,
              type: bestCandidateX.type,
              alignedElementId: bestCandidateX.otherId,
            });
            if (bestCandidateX.otherId && !targetElementIds.includes(bestCandidateX.otherId)) {
              targetElementIds.push(bestCandidateX.otherId);
            }
          }

          // 2. HORIZONTAL CANDIDATES (Y positions)
          interface CandidateY {
            targetY: number;
            guideY: number;
            label: string;
            type: 'canvas-center' | 'canvas-margin' | 'element-edge' | 'element-center';
            otherId?: string;
          }

          const candidatesY: CandidateY[] = [
            // Canvas Center
            {
              targetY: 50 - currentH / 2,
              guideY: 50,
              label: 'Centro',
              type: 'canvas-center',
            },
            // Top Margin (5%)
            {
              targetY: 5,
              guideY: 5,
              label: 'Margem Superior',
              type: 'canvas-margin',
            },
            // Bottom Margin (95%)
            {
              targetY: 95 - currentH,
              guideY: 95,
              label: 'Margem Inferior',
              type: 'canvas-margin',
            },
          ];

          slide.elements.forEach((other) => {
            if (other.id === selectedElement.id) return;
            const oTop = other.y;
            const oBottom = other.y + other.height;
            const oCenter = other.y + other.height / 2;
            const oName = other.name || 'Elemento';

            // Top edge aligns with other top edge
            candidatesY.push({
              targetY: oTop,
              guideY: oTop,
              label: `Alinhado ao Topo (${oName})`,
              type: 'element-edge',
              otherId: other.id,
            });
            // Bottom edge aligns with other bottom edge
            candidatesY.push({
              targetY: oBottom - currentH,
              guideY: oBottom,
              label: `Alinhado à Base (${oName})`,
              type: 'element-edge',
              otherId: other.id,
            });
            // Centers align vertically
            candidatesY.push({
              targetY: oCenter - currentH / 2,
              guideY: oCenter,
              label: `Centro com (${oName})`,
              type: 'element-center',
              otherId: other.id,
            });
            // Top edge touches other bottom edge
            candidatesY.push({
              targetY: oBottom,
              guideY: oBottom,
              label: `Adjacente (${oName})`,
              type: 'element-edge',
              otherId: other.id,
            });
            // Bottom edge touches other top edge
            candidatesY.push({
              targetY: oTop - currentH,
              guideY: oTop,
              label: `Adjacente (${oName})`,
              type: 'element-edge',
              otherId: other.id,
            });
          });

          // Find closest candidate on Y
          let bestCandidateY: CandidateY | null = null;
          let minDiffY = SNAP_THRESHOLD;
          for (const c of candidatesY) {
            const diff = Math.abs(newY - c.targetY);
            if (diff < minDiffY) {
              minDiffY = diff;
              bestCandidateY = c;
            }
          }

          if (bestCandidateY) {
            newY = bestCandidateY.targetY;
            hGuides.push({
              y: Math.round(bestCandidateY.guideY * 10) / 10,
              label: bestCandidateY.label,
              type: bestCandidateY.type,
              alignedElementId: bestCandidateY.otherId,
            });
            if (bestCandidateY.otherId && !targetElementIds.includes(bestCandidateY.otherId)) {
              targetElementIds.push(bestCandidateY.otherId);
            }
          }
        }

        // Snap to Grid (if enabled and didn't already snap on that axis)
        if (snapToGrid) {
          const GRID_STEP_X = 2.5; // 40 divisions
          const GRID_STEP_Y = 4.444; // 22.5 divisions for square cells on 16:9 canvas
          if (vGuides.length === 0) {
            newX = Math.round(newX / GRID_STEP_X) * GRID_STEP_X;
          }
          if (hGuides.length === 0) {
            newY = Math.round(newY / GRID_STEP_Y) * GRID_STEP_Y;
          }
        }

        setActiveVerticalGuides(vGuides);
        setActiveHorizontalGuides(hGuides);
        setAlignedElementIds(targetElementIds);

        // Bound to visible canvas with small leeway
        newX = Math.max(-10, Math.min(100, newX));
        newY = Math.max(-10, Math.min(100, newY));

        onUpdateElement(selectedElement.id, {
          x: Math.round(newX * 10) / 10,
          y: Math.round(newY * 10) / 10,
        });
      } else if (activeAction === 'resize' && resizeHandle) {
        let { x, y, width, height } = elementStartRect.current;

        if (resizeHandle.includes('r')) {
          let proposedW = Math.max(5, elementStartRect.current.width + deltaXPercent);
          const rightEdge = elementStartRect.current.x + proposedW;

          if (snapToGuides) {
            const rCandidates = [
              { targetRight: 50, label: 'Centro' },
              { targetRight: 95, label: 'Margem Direita' },
            ];
            slide.elements.forEach((o) => {
              if (o.id === selectedElement.id) return;
              const oName = o.name || 'Elemento';
              rCandidates.push(
                { targetRight: o.x, label: `Alinhado (${oName})` },
                { targetRight: o.x + o.width, label: `Alinhado (${oName})` },
                { targetRight: o.x + o.width / 2, label: `Centro (${oName})` }
              );
            });

            let bestR: { targetRight: number; label: string } | null = null;
            let minDiffR = SNAP_THRESHOLD;
            for (const c of rCandidates) {
              const diff = Math.abs(rightEdge - c.targetRight);
              if (diff < minDiffR) {
                minDiffR = diff;
                bestR = c;
              }
            }

            if (bestR) {
              proposedW = Math.max(5, bestR.targetRight - elementStartRect.current.x);
              vGuides.push({
                x: Math.round(bestR.targetRight * 10) / 10,
                label: bestR.label,
                type: 'element-edge',
              });
            }
          } else if (snapToGrid) {
            proposedW = Math.round(proposedW / 2.5) * 2.5;
          }
          width = proposedW;
        }

        if (resizeHandle.includes('l')) {
          let newW = Math.max(5, elementStartRect.current.width - deltaXPercent);
          let proposedX = elementStartRect.current.x + (elementStartRect.current.width - newW);

          if (snapToGuides) {
            const lCandidates = [
              { targetX: 5, label: 'Margem Esquerda' },
              { targetX: 50, label: 'Centro' },
            ];
            slide.elements.forEach((o) => {
              if (o.id === selectedElement.id) return;
              const oName = o.name || 'Elemento';
              lCandidates.push(
                { targetX: o.x, label: `Alinhado (${oName})` },
                { targetX: o.x + o.width, label: `Alinhado (${oName})` },
                { targetX: o.x + o.width / 2, label: `Centro (${oName})` }
              );
            });

            let bestL: { targetX: number; label: string } | null = null;
            let minDiffL = SNAP_THRESHOLD;
            for (const c of lCandidates) {
              const diff = Math.abs(proposedX - c.targetX);
              if (diff < minDiffL) {
                minDiffL = diff;
                bestL = c;
              }
            }

            if (bestL) {
              const diffX = bestL.targetX - elementStartRect.current.x;
              newW = Math.max(5, elementStartRect.current.width - diffX);
              proposedX = bestL.targetX;
              vGuides.push({
                x: Math.round(bestL.targetX * 10) / 10,
                label: bestL.label,
                type: 'element-edge',
              });
            }
          }
          x = proposedX;
          width = newW;
        }

        if (resizeHandle.includes('b')) {
          let proposedH = Math.max(3, elementStartRect.current.height + deltaYPercent);
          const bottomEdge = elementStartRect.current.y + proposedH;

          if (snapToGuides) {
            const bCandidates = [
              { targetBottom: 50, label: 'Centro' },
              { targetBottom: 95, label: 'Margem Inferior' },
            ];
            slide.elements.forEach((o) => {
              if (o.id === selectedElement.id) return;
              const oName = o.name || 'Elemento';
              bCandidates.push(
                { targetBottom: o.y, label: `Alinhado (${oName})` },
                { targetBottom: o.y + o.height, label: `Alinhado (${oName})` },
                { targetBottom: o.y + o.height / 2, label: `Centro (${oName})` }
              );
            });

            let bestB: { targetBottom: number; label: string } | null = null;
            let minDiffB = SNAP_THRESHOLD;
            for (const c of bCandidates) {
              const diff = Math.abs(bottomEdge - c.targetBottom);
              if (diff < minDiffB) {
                minDiffB = diff;
                bestB = c;
              }
            }

            if (bestB) {
              proposedH = Math.max(3, bestB.targetBottom - elementStartRect.current.y);
              hGuides.push({
                y: Math.round(bestB.targetBottom * 10) / 10,
                label: bestB.label,
                type: 'element-edge',
              });
            }
          } else if (snapToGrid) {
            proposedH = Math.round(proposedH / 4.444) * 4.444;
          }
          height = proposedH;
        }

        if (resizeHandle.includes('t')) {
          let newH = Math.max(3, elementStartRect.current.height - deltaYPercent);
          let proposedY = elementStartRect.current.y + (elementStartRect.current.height - newH);

          if (snapToGuides) {
            const tCandidates = [
              { targetY: 5, label: 'Margem Superior' },
              { targetY: 50, label: 'Centro' },
            ];
            slide.elements.forEach((o) => {
              if (o.id === selectedElement.id) return;
              const oName = o.name || 'Elemento';
              tCandidates.push(
                { targetY: o.y, label: `Alinhado (${oName})` },
                { targetY: o.y + o.height, label: `Alinhado (${oName})` },
                { targetY: o.y + o.height / 2, label: `Centro (${oName})` }
              );
            });

            let bestT: { targetY: number; label: string } | null = null;
            let minDiffT = SNAP_THRESHOLD;
            for (const c of tCandidates) {
              const diff = Math.abs(proposedY - c.targetY);
              if (diff < minDiffT) {
                minDiffT = diff;
                bestT = c;
              }
            }

            if (bestT) {
              const diffY = bestT.targetY - elementStartRect.current.y;
              newH = Math.max(3, elementStartRect.current.height - diffY);
              proposedY = bestT.targetY;
              hGuides.push({
                y: Math.round(bestT.targetY * 10) / 10,
                label: bestT.label,
                type: 'element-edge',
              });
            }
          }
          y = proposedY;
          height = newH;
        }

        setActiveVerticalGuides(vGuides);
        setActiveHorizontalGuides(hGuides);

        // Maintain aspect ratio for images if corner handle is dragged
        if (selectedElement.type === 'image' && resizeHandle.length === 2) {
          const ratio = elementStartRect.current.width / elementStartRect.current.height;
          height = width / ratio;
        }

        onUpdateElement(selectedElement.id, {
          x: Math.round(x * 10) / 10,
          y: Math.round(y * 10) / 10,
          width: Math.round(width * 10) / 10,
          height: Math.round(height * 10) / 10,
        });
      } else if (activeAction === 'rotate') {
        const elemCenterPx = {
          x:
            canvasRect.left +
            (elementStartRect.current.x + elementStartRect.current.width / 2) *
              (canvasRect.width / 100),
          y:
            canvasRect.top +
            (elementStartRect.current.y + elementStartRect.current.height / 2) *
              (canvasRect.height / 100),
        };
        const angleRad = Math.atan2(e.clientY - elemCenterPx.y, e.clientX - elemCenterPx.x);
        let angleDeg = Math.round(angleRad * (180 / Math.PI) + 90);
        if (angleDeg < 0) angleDeg += 360;

        // Snap near 0, 90, 180, 270
        if (Math.abs(angleDeg - 0) < 4 || Math.abs(angleDeg - 360) < 4) angleDeg = 0;
        if (Math.abs(angleDeg - 90) < 4) angleDeg = 90;
        if (Math.abs(angleDeg - 180) < 4) angleDeg = 180;
        if (Math.abs(angleDeg - 270) < 4) angleDeg = 270;

        onUpdateElement(selectedElement.id, { rotation: angleDeg });
      }
    },
    [
      activeAction,
      selectedElement,
      resizeHandle,
      onUpdateElement,
      slide.elements,
      snapToGuides,
      snapToGrid,
    ]
  );

  const handlePointerUp = () => {
    if (hasMovedRef.current && selectedElement && onCommitTransform && activeAction) {
      const prev = elementStartRect.current;
      const current = {
        x: selectedElement.x,
        y: selectedElement.y,
        width: selectedElement.width,
        height: selectedElement.height,
        rotation: selectedElement.rotation || 0,
      };

      const hasChanged =
        Math.abs(prev.x - current.x) > 0.05 ||
        Math.abs(prev.y - current.y) > 0.05 ||
        Math.abs(prev.width - current.width) > 0.05 ||
        Math.abs(prev.height - current.height) > 0.05 ||
        Math.abs(prev.rotation - current.rotation) > 0.5;

      if (hasChanged) {
        onCommitTransform(selectedElement.id, prev, current, activeAction);
      }
    }

    setActiveAction(null);
    setResizeHandle(null);
    setActiveVerticalGuides([]);
    setActiveHorizontalGuides([]);
    setAlignedElementIds([]);
    hasMovedRef.current = false;
  };

  // Keyboard navigation & deletion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in a textarea or input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (!selectedElement) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDeleteElement(selectedElement.id);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        onDuplicateElement(selectedElement.id);
      } else if (
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight'
      ) {
        e.preventDefault();
        const step = e.shiftKey ? 2 : 0.5;
        const prevRect = {
          x: selectedElement.x,
          y: selectedElement.y,
          width: selectedElement.width,
          height: selectedElement.height,
          rotation: selectedElement.rotation || 0,
        };

        let newX = selectedElement.x;
        let newY = selectedElement.y;

        if (e.key === 'ArrowUp') newY = Math.max(0, newY - step);
        if (e.key === 'ArrowDown') newY = Math.min(100, newY + step);
        if (e.key === 'ArrowLeft') newX = Math.max(0, newX - step);
        if (e.key === 'ArrowRight') newX = Math.min(100, newX + step);

        newX = Math.round(newX * 10) / 10;
        newY = Math.round(newY * 10) / 10;

        const newRect = { ...prevRect, x: newX, y: newY };
        onUpdateElement(selectedElement.id, { x: newX, y: newY });
        if (onCommitNudge) {
          onCommitNudge(selectedElement.id, prevRect, newRect);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, onDeleteElement, onDuplicateElement, onUpdateElement, onCommitNudge]);

  // Support Drag-and-Drop image from external files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const dataUrl = loadEvent.target?.result as string;
        if (dataUrl && onImageDrop) {
          onImageDrop(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to render individual elements based on their type
  const renderElementContent = (el: SlideElement) => {
    const isEditing = editingTextId === el.id;

    switch (el.type) {
      case 'text':
        if (isEditing) {
          return (
            <textarea
              autoFocus
              value={el.content}
              onChange={(e) => onUpdateElement(el.id, { content: e.target.value })}
              onBlur={() => {
                setEditingTextId(null);
                if (initialTextRef.current !== el.content && onCommitTextEdit) {
                  onCommitTextEdit(el.id, initialTextRef.current, el.content);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  (e.target as HTMLElement).blur();
                }
              }}
              className="w-full h-full p-0 bg-transparent border-none resize-none focus:outline-none focus:ring-1 focus:ring-[#3A6351]/40"
              style={{
                fontFamily: el.style.fontFamily === 'serif' ? 'Playfair Display, serif' : 'Montserrat, sans-serif',
                fontSize: `${el.style.fontSize || 16}px`,
                fontWeight: el.style.fontWeight || 'normal',
                fontStyle: el.style.fontStyle || 'normal',
                textDecoration: el.style.textDecoration || 'none',
                color: el.style.color || '#2C2C2C',
                textAlign: el.style.textAlign || 'left',
                lineHeight: el.style.lineHeight || 1.3,
                letterSpacing: el.style.letterSpacing ? `${el.style.letterSpacing}px` : undefined,
                textTransform: el.style.textTransform || 'none',
              }}
            />
          );
        }
        return (
          <div
            onDoubleClick={(e) => {
              e.stopPropagation();
              initialTextRef.current = el.content;
              setEditingTextId(el.id);
            }}
            className="w-full h-full whitespace-pre-wrap select-none overflow-hidden"
            style={{
              fontFamily: el.style.fontFamily === 'serif' ? 'Playfair Display, serif' : 'Montserrat, sans-serif',
              fontSize: `${el.style.fontSize || 16}px`,
              fontWeight: el.style.fontWeight || 'normal',
              fontStyle: el.style.fontStyle || 'normal',
              textDecoration: el.style.textDecoration || 'none',
              color: el.style.color || '#2C2C2C',
              textAlign: el.style.textAlign || 'left',
              lineHeight: el.style.lineHeight || 1.3,
              letterSpacing: el.style.letterSpacing ? `${el.style.letterSpacing}px` : undefined,
              textTransform: el.style.textTransform || 'none',
            }}
          >
            {el.content || 'Texto'}
          </div>
        );

      case 'image':
        return (
          <img
            src={el.content}
            alt={el.name || 'Imagem'}
            className="w-full h-full pointer-events-none select-none"
            style={{
              objectFit: el.style.objectFit || 'cover',
              borderRadius: el.style.borderRadius ? `${el.style.borderRadius}px` : '0px',
              borderWidth: el.style.borderWidth ? `${el.style.borderWidth}px` : '0px',
              borderColor: el.style.borderColor || 'transparent',
              boxShadow: el.style.shadow ? '0 10px 25px -5px rgba(0, 0, 0, 0.1)' : 'none',
            }}
          />
        );

      case 'shape':
        if (el.style.shapeType === 'circle') {
          return (
            <div
              className="w-full h-full rounded-full"
              style={{
                backgroundColor: el.style.backgroundColor || '#3A6351',
                borderColor: el.style.borderColor || 'transparent',
                borderWidth: el.style.borderWidth ? `${el.style.borderWidth}px` : '0px',
              }}
            />
          );
        }
        if (el.style.shapeType === 'line' || el.style.shapeType === 'divider') {
          return (
            <div
              className="w-full h-full flex items-center justify-center"
            >
              <div
                className="w-full"
                style={{
                  height: el.style.borderWidth ? `${el.style.borderWidth}px` : '3px',
                  backgroundColor: el.style.backgroundColor || '#3A6351',
                  borderRadius: el.style.borderRadius ? `${el.style.borderRadius}px` : '2px',
                }}
              />
            </div>
          );
        }
        return (
          <div
            className="w-full h-full"
            style={{
              backgroundColor: el.style.backgroundColor || '#F4F7F5',
              borderRadius: el.style.borderRadius !== undefined ? `${el.style.borderRadius}px` : '16px',
              borderColor: el.style.borderColor || 'transparent',
              borderWidth: el.style.borderWidth ? `${el.style.borderWidth}px` : '0px',
            }}
          />
        );

      case 'number':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center select-none">
            <span
              className="font-bold font-serif leading-none tracking-tight"
              style={{
                fontSize: `${el.style.fontSize || 56}px`,
                color: el.style.color || '#3A6351',
              }}
            >
              {el.content}
            </span>
            {el.secondaryContent && (
              <p className="text-xs text-gray-500 font-sans mt-2 max-w-[85%] leading-snug">
                {el.secondaryContent}
              </p>
            )}
          </div>
        );

      case 'quote':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center select-none">
            <p
              className="font-serif italic leading-relaxed"
              style={{
                fontSize: `${el.style.fontSize || 28}px`,
                color: el.style.color || '#2C2C2C',
              }}
            >
              {el.content}
            </p>
            {el.secondaryContent && (
              <span className="text-xs uppercase tracking-widest text-[#3A6351] font-bold font-sans mt-3">
                {el.secondaryContent}
              </span>
            )}
          </div>
        );

      default:
        return <div>{el.content}</div>;
    }
  };

  return (
    <div
      className="flex-1 bg-gray-100 flex items-center justify-center p-4 sm:p-8 overflow-hidden relative select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => onSelectElement(null)}
    >
      {/* 16:9 Canvas Container */}
      <div
        ref={canvasRef}
        id="slide-canvas-viewport"
        className="w-full max-w-5xl aspect-video bg-white rounded-2xl shadow-2xl relative overflow-hidden transition-all"
        style={{
          backgroundColor: slide.background?.value?.startsWith('#') || slide.background?.value?.startsWith('rgb')
            ? slide.background.value
            : '#FFFFFF',
          backgroundImage: slide.background?.type === 'gradient'
            ? slide.background.value
            : slide.background?.type === 'image'
            ? `url(${slide.background.value})`
            : undefined,
          backgroundSize: slide.background?.fit || 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* If Native Slide from Original Keynote, show decorative preview tag */}
        {slide.nativeSlideId && (
          <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-xs border border-[#3A6351]/30 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3 h-3 text-[#3A6351]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#3A6351]">
              Slide da Palestra Interativa #{slide.nativeSlideId}
            </span>
          </div>
        )}

        {/* Grid Overlay (when enabled) */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none z-10 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle, #3A6351 1.2px, transparent 1.2px)`,
              backgroundSize: '2.5% 4.444%', // 40 cols x 22.5 rows = perfect squares on 16:9 canvas
            }}
          />
        )}

        {/* Dynamic Alignment Guidelines (Dashed Lines for Centers, Margins, and Elements) */}
        {activeVerticalGuides.map((guide, idx) => (
          <div
            key={`v-guide-${guide.x}-${idx}`}
            className="absolute top-0 bottom-0 pointer-events-none z-50 flex flex-col items-center justify-start"
            style={{ left: `${guide.x}%` }}
          >
            <div className="w-0 h-full border-l-2 border-dashed border-[#3A6351] drop-shadow-[0_0_1px_rgba(255,255,255,0.9)]" />
            {guide.label && (
              <span className="bg-[#3A6351] text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-md absolute top-2 -translate-x-1/2 whitespace-nowrap select-none">
                {guide.label}
              </span>
            )}
          </div>
        ))}

        {activeHorizontalGuides.map((guide, idx) => (
          <div
            key={`h-guide-${guide.y}-${idx}`}
            className="absolute left-0 right-0 pointer-events-none z-50 flex items-center justify-start"
            style={{ top: `${guide.y}%` }}
          >
            <div className="w-full h-0 border-t-2 border-dashed border-[#3A6351] drop-shadow-[0_0_1px_rgba(255,255,255,0.9)]" />
            {guide.label && (
              <span className="bg-[#3A6351] text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-md absolute left-2 -translate-y-1/2 whitespace-nowrap select-none">
                {guide.label}
              </span>
            )}
          </div>
        ))}

        {/* Render Elements List */}
        {slide.elements.map((el) => {
          const isSelected = selectedElementId === el.id;
          const isSnapTarget = alignedElementIds.includes(el.id);

          return (
            <div
              key={el.id}
              id={`elem-${el.id}`}
              onPointerDown={(e) => handleElementPointerDown(e, el)}
              className={`absolute transition-shadow ${
                el.locked ? 'cursor-default' : 'cursor-move'
              } ${
                isSelected
                  ? 'ring-2 ring-[#3A6351] ring-offset-1 z-40'
                  : isSnapTarget
                  ? 'ring-2 ring-dashed ring-[#3A6351] bg-[#3A6351]/5 z-30 shadow-sm'
                  : 'hover:ring-1 hover:ring-[#3A6351]/50'
              }`}
              style={{
                left: `${el.x}%`,
                top: `${el.y}%`,
                width: `${el.width}%`,
                height: `${el.height}%`,
                transform: `rotate(${el.rotation || 0}deg)`,
                zIndex: el.zIndex,
                opacity: el.opacity !== undefined ? el.opacity : 1,
              }}
            >
              {/* Element Visual Content */}
              {renderElementContent(el)}

              {/* Lock Badge if Locked */}
              {el.locked && (
                <div
                  className="absolute -top-2 -right-2 z-50 bg-amber-500 text-white p-0.5 rounded-full shadow-xs pointer-events-none"
                  title="Elemento bloqueado (protegido contra edições da IA e fixo no canvas)"
                >
                  <Lock className="w-2.5 h-2.5 stroke-[2.5]" />
                </div>
              )}

              {/* Selection Handles (Visible only when selected and NOT locked) */}
              {isSelected && !el.locked && (
                <>
                  {/* Rotation handle above top center */}
                  <div
                    onPointerDown={handleRotatePointerDown}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#3A6351] flex items-center justify-center cursor-grab active:cursor-grabbing shadow-sm z-50 hover:scale-125 transition-transform"
                    title="Rotacionar elemento"
                  >
                    <div className="w-1 h-1 bg-[#3A6351] rounded-full" />
                  </div>
                  {/* Stem line connecting rotation handle */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-[#3A6351]" />

                  {/* 4 Corner Handles */}
                  <div
                    onPointerDown={(e) => handleResizePointerDown(e, 'tl')}
                    className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#3A6351] rounded-sm cursor-nwse-resize shadow-xs z-50"
                  />
                  <div
                    onPointerDown={(e) => handleResizePointerDown(e, 'tr')}
                    className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#3A6351] rounded-sm cursor-nesw-resize shadow-xs z-50"
                  />
                  <div
                    onPointerDown={(e) => handleResizePointerDown(e, 'bl')}
                    className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#3A6351] rounded-sm cursor-nesw-resize shadow-xs z-50"
                  />
                  <div
                    onPointerDown={(e) => handleResizePointerDown(e, 'br')}
                    className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#3A6351] rounded-sm cursor-nwse-resize shadow-xs z-50"
                  />

                  {/* 4 Edge Handles */}
                  <div
                    onPointerDown={(e) => handleResizePointerDown(e, 't')}
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-2 bg-white border border-[#3A6351] rounded-xs cursor-ns-resize shadow-xs z-50"
                  />
                  <div
                    onPointerDown={(e) => handleResizePointerDown(e, 'b')}
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-2 bg-white border border-[#3A6351] rounded-xs cursor-ns-resize shadow-xs z-50"
                  />
                  <div
                    onPointerDown={(e) => handleResizePointerDown(e, 'l')}
                    className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2 h-3 bg-white border border-[#3A6351] rounded-xs cursor-ew-resize shadow-xs z-50"
                  />
                  <div
                    onPointerDown={(e) => handleResizePointerDown(e, 'r')}
                    className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2 h-3 bg-white border border-[#3A6351] rounded-xs cursor-ew-resize shadow-xs z-50"
                  />
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Precision Snapping & Grid Floating Controls */}
      <div
        className="absolute bottom-4 left-4 z-40 bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-xl px-2.5 py-1.5 shadow-md flex items-center gap-1.5 text-xs select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setSnapToGuides(!snapToGuides)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
            snapToGuides
              ? 'bg-[#3A6351] text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
          title={snapToGuides ? 'Guias Inteligentes Ativas (Clique para desativar)' : 'Ativar Guias de Alinhamento Inteligentes'}
        >
          <Magnet className="w-3.5 h-3.5" />
          <span>Guias Inteligentes</span>
        </button>

        <div className="w-px h-4 bg-gray-200" />

        <button
          type="button"
          onClick={() => setSnapToGrid(!snapToGrid)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
            snapToGrid
              ? 'bg-[#3A6351] text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
          title={snapToGrid ? 'Alinhar à Grade Ativo (Clique para desativar)' : 'Ativar Alinhamento Automático à Grade Magnética'}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Alinhar à Grade</span>
        </button>

        <div className="w-px h-4 bg-gray-200" />

        <button
          type="button"
          onClick={() => setShowGrid(!showGrid)}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
            showGrid
              ? 'bg-[#3A6351]/10 text-[#3A6351] font-semibold'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
          title={showGrid ? 'Ocultar Grade Visual' : 'Exibir Grade de Pontos (40×22)'}
        >
          <Grid3X3 className="w-3.5 h-3.5" />
          <span>Visualizar Grade</span>
        </button>

        {selectedElement && (
          <>
            <div className="w-px h-4 bg-gray-200 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-gray-500 font-mono px-2">
              <span>X: {Math.round(selectedElement.x)}%</span>
              <span>Y: {Math.round(selectedElement.y)}%</span>
              <span>({Math.round(selectedElement.width)}% × {Math.round(selectedElement.height)}%)</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
