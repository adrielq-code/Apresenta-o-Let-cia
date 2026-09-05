import React, { useState, useRef, useEffect, useCallback } from 'react';
import { EditorSlide, SlideElement, SlideElementStyle } from '../../types';
import {
  Sparkles,
  Move,
  RotateCw,
  Maximize2,
  ExternalLink,
} from 'lucide-react';

interface Props {
  slide: EditorSlide;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<SlideElement>) => void;
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
  onDeleteElement,
  onDuplicateElement,
  onImageDrop,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  // Dragging & Resizing interaction state
  const [activeAction, setActiveAction] = useState<DragAction>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Guide lines state
  const [showCenterH, setShowCenterH] = useState(false);
  const [showCenterV, setShowCenterV] = useState(false);

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

    if (editingTextId === el.id) return; // Allow normal cursor movement if actively editing text

    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    setActiveAction('move');
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

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const deltaXPercent = ((e.clientX - dragStartPos.current.clientX) / canvasRect.width) * 100;
      const deltaYPercent = ((e.clientY - dragStartPos.current.clientY) / canvasRect.height) * 100;

      if (activeAction === 'move') {
        let newX = elementStartRect.current.x + deltaXPercent;
        let newY = elementStartRect.current.y + deltaYPercent;

        // Alignment guide snapping (snaps when within 1% of center 50%)
        const elementCenterX = newX + elementStartRect.current.width / 2;
        const elementCenterY = newY + elementStartRect.current.height / 2;

        if (Math.abs(elementCenterX - 50) < 1.2) {
          newX = 50 - elementStartRect.current.width / 2;
          setShowCenterV(true);
        } else {
          setShowCenterV(false);
        }

        if (Math.abs(elementCenterY - 50) < 1.2) {
          newY = 50 - elementStartRect.current.height / 2;
          setShowCenterH(true);
        } else {
          setShowCenterH(false);
        }

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
          width = Math.max(5, elementStartRect.current.width + deltaXPercent);
        }
        if (resizeHandle.includes('l')) {
          const newW = Math.max(5, elementStartRect.current.width - deltaXPercent);
          x = elementStartRect.current.x + (elementStartRect.current.width - newW);
          width = newW;
        }
        if (resizeHandle.includes('b')) {
          height = Math.max(3, elementStartRect.current.height + deltaYPercent);
        }
        if (resizeHandle.includes('t')) {
          const newH = Math.max(3, elementStartRect.current.height - deltaYPercent);
          y = elementStartRect.current.y + (elementStartRect.current.height - newH);
          height = newH;
        }

        // Maintain aspect ratio for images if corner handle is dragged
        if (selectedElement.type === 'image' && (resizeHandle.length === 2)) {
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
          x: canvasRect.left + (elementStartRect.current.x + elementStartRect.current.width / 2) * (canvasRect.width / 100),
          y: canvasRect.top + (elementStartRect.current.y + elementStartRect.current.height / 2) * (canvasRect.height / 100),
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
    [activeAction, selectedElement, resizeHandle, onUpdateElement]
  );

  const handlePointerUp = () => {
    setActiveAction(null);
    setResizeHandle(null);
    setShowCenterH(false);
    setShowCenterV(false);
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
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const step = e.shiftKey ? 2 : 0.5;
        onUpdateElement(selectedElement.id, { y: Math.max(0, selectedElement.y - step) });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const step = e.shiftKey ? 2 : 0.5;
        onUpdateElement(selectedElement.id, { y: Math.min(100, selectedElement.y + step) });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const step = e.shiftKey ? 2 : 0.5;
        onUpdateElement(selectedElement.id, { x: Math.max(0, selectedElement.x - step) });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const step = e.shiftKey ? 2 : 0.5;
        onUpdateElement(selectedElement.id, { x: Math.min(100, selectedElement.x + step) });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, onDeleteElement, onDuplicateElement, onUpdateElement]);

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
              onBlur={() => setEditingTextId(null)}
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

        {/* Dynamic Center Alignment Guidelines */}
        {showCenterV && (
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-[#3A6351] z-50 pointer-events-none flex items-center justify-center">
            <span className="bg-[#3A6351] text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm absolute top-3">
              CENTRO
            </span>
          </div>
        )}

        {showCenterH && (
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-[#3A6351] z-50 pointer-events-none flex items-center justify-center">
            <span className="bg-[#3A6351] text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm absolute left-3">
              CENTRO
            </span>
          </div>
        )}

        {/* Render Elements List */}
        {slide.elements.map((el) => {
          const isSelected = selectedElementId === el.id;

          return (
            <div
              key={el.id}
              id={`elem-${el.id}`}
              onPointerDown={(e) => handleElementPointerDown(e, el)}
              className={`absolute cursor-move transition-shadow ${
                isSelected ? 'ring-2 ring-[#3A6351] ring-offset-1 z-40' : 'hover:ring-1 hover:ring-[#3A6351]/50'
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

              {/* Selection Handles (Visible only when selected) */}
              {isSelected && (
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
    </div>
  );
};
