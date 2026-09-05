import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Presentation,
  EditorSlide,
  SlideElement,
  SlideBackground,
  PresenterNote,
} from '../../types';
import { EditorTopBar } from './EditorTopBar';
import { SlideListSidebar } from './SlideListSidebar';
import { EditorCanvas } from './EditorCanvas';
import { PropertiesSidebar } from './PropertiesSidebar';
import { AddElementDropdown } from './AddElementDropdown';
import { CodeModal } from '../dashboard/CodeModal';
import { savePresentation, saveAsTemplate } from '../../services/storage';

interface VisualEditorProps {
  presentation: Presentation;
  onBackToDashboard: () => void;
  onPresent: (presentation: Presentation, startSlideIndex: number) => void;
  onPresentationUpdated: (updated: Presentation) => void;
}

export const VisualEditor: React.FC<VisualEditorProps> = ({
  presentation: initialPresentation,
  onBackToDashboard,
  onPresent,
  onPresentationUpdated,
}) => {
  const [currentPres, setCurrentPres] = useState<Presentation>(initialPresentation);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // History stack for Undo / Redo
  const historyRef = useRef<Presentation[]>([initialPresentation]);
  const historyIndexRef = useRef<number>(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Autosave status
  const [autosaveStatus, setAutosaveStatus] = useState<'saving' | 'saved' | 'idle'>('saved');
  const autosaveTimerRef = useRef<any>(null);

  // Code Modal
  const [showCodeModal, setShowCodeModal] = useState(false);

  // Safe active slide
  const activeSlide: EditorSlide =
    currentPres.slides[activeSlideIndex] ||
    currentPres.slides[0] || {
      id: 'slide-fallback',
      title: 'Slide 1',
      elements: [],
      background: { type: 'color', value: '#FFFFFF' },
    };

  // Helper to push history
  const pushHistory = (newPres: Presentation) => {
    const nextHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    nextHistory.push(newPres);
    // Limit history to 30 states
    if (nextHistory.length > 30) nextHistory.shift();

    historyRef.current = nextHistory;
    historyIndexRef.current = nextHistory.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  };

  // State update wrapper with debounce autosave
  const updatePresentation = useCallback(
    (updater: (prev: Presentation) => Presentation, recordHistory = true) => {
      setCurrentPres((prev) => {
        const next = updater(prev);
        if (recordHistory) {
          pushHistory(next);
        }

        // Trigger autosave with debounce
        setAutosaveStatus('saving');
        if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = setTimeout(() => {
          savePresentation(next);
          onPresentationUpdated(next);
          setAutosaveStatus('saved');
        }, 600);

        return next;
      });
    },
    [onPresentationUpdated]
  );

  // Undo / Redo handlers
  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const target = historyRef.current[historyIndexRef.current];
      setCurrentPres(target);
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(true);
      savePresentation(target);
      onPresentationUpdated(target);
    }
  };

  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const target = historyRef.current[historyIndexRef.current];
      setCurrentPres(target);
      setCanUndo(true);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
      savePresentation(target);
      onPresentationUpdated(target);
    }
  };

  // Title edit
  const handleTitleChange = (newTitle: string) => {
    updatePresentation((prev) => ({
      ...prev,
      title: newTitle,
      updatedAt: new Date().toISOString(),
    }));
  };

  // =========================================================
  // SLIDE MANAGEMENT
  // =========================================================
  const handleAddSlide = () => {
    const newSlideId = `slide-${Date.now()}`;
    const newSlide: EditorSlide = {
      id: newSlideId,
      title: `Slide ${currentPres.slides.length + 1}`,
      elements: [
        {
          id: `elem-title-${Date.now()}`,
          type: 'text',
          name: 'Título',
          content: 'Clique duas vezes para editar o título',
          x: 10,
          y: 25,
          width: 80,
          height: 20,
          zIndex: 1,
          style: {
            fontFamily: 'serif',
            fontSize: 48,
            fontWeight: 'bold',
            color: '#1E293B',
            textAlign: 'center',
          },
        },
        {
          id: `elem-sub-${Date.now()}`,
          type: 'text',
          name: 'Subtítulo',
          content: 'Adicione seu subtítulo ou pontos principais aqui',
          x: 15,
          y: 52,
          width: 70,
          height: 15,
          zIndex: 2,
          style: {
            fontFamily: 'sans',
            fontSize: 20,
            fontWeight: 'normal',
            color: '#64748B',
            textAlign: 'center',
          },
        },
      ],
      background: { type: 'color', value: '#FFFFFF' },
      notes: {
        script: '',
        question: '',
        suggestedTime: '2 minutos',
        objective: '',
      },
    };

    updatePresentation((prev) => ({
      ...prev,
      slides: [...prev.slides, newSlide],
      updatedAt: new Date().toISOString(),
    }));
    setActiveSlideIndex(currentPres.slides.length);
    setSelectedElementId(null);
  };

  const handleDuplicateSlide = (index: number) => {
    const targetSlide = currentPres.slides[index];
    if (!targetSlide) return;

    const duplicatedSlide: EditorSlide = {
      ...targetSlide,
      id: `slide-${Date.now()}`,
      title: `${targetSlide.title} (Cópia)`,
      elements: targetSlide.elements.map((el) => ({
        ...el,
        id: `elem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      })),
    };

    const nextSlides = [...currentPres.slides];
    nextSlides.splice(index + 1, 0, duplicatedSlide);

    updatePresentation((prev) => ({
      ...prev,
      slides: nextSlides,
      updatedAt: new Date().toISOString(),
    }));
    setActiveSlideIndex(index + 1);
  };

  const handleDeleteSlide = (index: number) => {
    if (currentPres.slides.length <= 1) return;
    const nextSlides = currentPres.slides.filter((_, i) => i !== index);
    const nextActive = Math.max(0, Math.min(nextSlides.length - 1, index === activeSlideIndex ? index - 1 : activeSlideIndex));

    updatePresentation((prev) => ({
      ...prev,
      slides: nextSlides,
      updatedAt: new Date().toISOString(),
    }));
    setActiveSlideIndex(nextActive);
    setSelectedElementId(null);
  };

  const handleMoveSlideUp = (index: number) => {
    if (index === 0) return;
    const nextSlides = [...currentPres.slides];
    const temp = nextSlides[index];
    nextSlides[index] = nextSlides[index - 1];
    nextSlides[index - 1] = temp;

    updatePresentation((prev) => ({
      ...prev,
      slides: nextSlides,
      updatedAt: new Date().toISOString(),
    }));
    setActiveSlideIndex(index - 1);
  };

  const handleMoveSlideDown = (index: number) => {
    if (index === currentPres.slides.length - 1) return;
    const nextSlides = [...currentPres.slides];
    const temp = nextSlides[index];
    nextSlides[index] = nextSlides[index + 1];
    nextSlides[index + 1] = temp;

    updatePresentation((prev) => ({
      ...prev,
      slides: nextSlides,
      updatedAt: new Date().toISOString(),
    }));
    setActiveSlideIndex(index + 1);
  };

  // =========================================================
  // ELEMENT MANAGEMENT
  // =========================================================
  const handleUpdateElement = (id: string, updates: Partial<SlideElement>) => {
    updatePresentation((prev) => {
      const nextSlides = [...prev.slides];
      const slide = nextSlides[activeSlideIndex];
      if (!slide) return prev;

      nextSlides[activeSlideIndex] = {
        ...slide,
        elements: slide.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
      };
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });
  };

  const handleDeleteElement = (id: string) => {
    updatePresentation((prev) => {
      const nextSlides = [...prev.slides];
      const slide = nextSlides[activeSlideIndex];
      if (!slide) return prev;

      nextSlides[activeSlideIndex] = {
        ...slide,
        elements: slide.elements.filter((el) => el.id !== id),
      };
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });
    setSelectedElementId(null);
  };

  const handleDuplicateElement = (id: string) => {
    const slide = currentPres.slides[activeSlideIndex];
    const target = slide?.elements.find((el) => el.id === id);
    if (!target) return;

    const newId = `elem-${Date.now()}`;
    const duplicated: SlideElement = {
      ...target,
      id: newId,
      name: `${target.name || 'Elemento'} Cópia`,
      x: Math.min(90, target.x + 4),
      y: Math.min(90, target.y + 4),
      zIndex: (target.zIndex || 1) + 1,
    };

    updatePresentation((prev) => {
      const nextSlides = [...prev.slides];
      const cur = nextSlides[activeSlideIndex];
      nextSlides[activeSlideIndex] = {
        ...cur,
        elements: [...cur.elements, duplicated],
      };
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });
    setSelectedElementId(newId);
  };

  const handleBringForward = (id: string) => {
    updatePresentation((prev) => {
      const nextSlides = [...prev.slides];
      const slide = nextSlides[activeSlideIndex];
      if (!slide) return prev;

      const elements = [...slide.elements];
      const maxZ = Math.max(...elements.map((e) => e.zIndex || 0), 1);
      nextSlides[activeSlideIndex] = {
        ...slide,
        elements: elements.map((el) => (el.id === id ? { ...el, zIndex: maxZ + 1 } : el)),
      };
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });
  };

  const handleSendBackward = (id: string) => {
    updatePresentation((prev) => {
      const nextSlides = [...prev.slides];
      const slide = nextSlides[activeSlideIndex];
      if (!slide) return prev;

      const elements = [...slide.elements];
      const minZ = Math.min(...elements.map((e) => e.zIndex || 0), 1);
      nextSlides[activeSlideIndex] = {
        ...slide,
        elements: elements.map((el) => (el.id === id ? { ...el, zIndex: Math.max(0, minZ - 1) } : el)),
      };
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });
  };

  const handleAlignElement = (id: string, alignment: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') => {
    const slide = currentPres.slides[activeSlideIndex];
    const target = slide?.elements.find((el) => el.id === id);
    if (!target) return;

    let updates: Partial<SlideElement> = {};
    switch (alignment) {
      case 'left':
        updates = { x: 5 };
        break;
      case 'center-h':
        updates = { x: Math.round((50 - target.width / 2) * 10) / 10 };
        break;
      case 'right':
        updates = { x: Math.round((95 - target.width) * 10) / 10 };
        break;
      case 'top':
        updates = { y: 5 };
        break;
      case 'center-v':
        updates = { y: Math.round((50 - target.height / 2) * 10) / 10 };
        break;
      case 'bottom':
        updates = { y: Math.round((95 - target.height) * 10) / 10 };
        break;
    }
    handleUpdateElement(id, updates);
  };

  // Add Elements
  const handleAddText = (type: 'title' | 'subtitle' | 'body' | 'free') => {
    const id = `elem-txt-${Date.now()}`;
    let newElem: SlideElement;

    if (type === 'title') {
      newElem = {
        id,
        type: 'text',
        name: 'Título',
        content: 'Novo Título do Slide',
        x: 10,
        y: 20,
        width: 80,
        height: 18,
        zIndex: 10,
        style: {
          fontFamily: 'serif',
          fontSize: 48,
          fontWeight: 'bold',
          color: '#1E293B',
          textAlign: 'center',
        },
      };
    } else if (type === 'subtitle') {
      newElem = {
        id,
        type: 'text',
        name: 'Subtítulo',
        content: 'Subtítulo complementar',
        x: 15,
        y: 45,
        width: 70,
        height: 12,
        zIndex: 10,
        style: {
          fontFamily: 'sans',
          fontSize: 24,
          fontWeight: 'medium',
          color: '#475569',
          textAlign: 'center',
        },
      };
    } else if (type === 'body') {
      newElem = {
        id,
        type: 'text',
        name: 'Texto',
        content: 'Digite seu texto aqui. Explique sua ideia com clareza.',
        x: 15,
        y: 40,
        width: 70,
        height: 25,
        zIndex: 10,
        style: {
          fontFamily: 'sans',
          fontSize: 18,
          fontWeight: 'normal',
          color: '#334155',
          textAlign: 'left',
          lineHeight: 1.5,
        },
      };
    } else {
      newElem = {
        id,
        type: 'text',
        name: 'Texto Livre',
        content: 'Texto livre',
        x: 20,
        y: 40,
        width: 60,
        height: 15,
        zIndex: 10,
        style: {
          fontFamily: 'sans',
          fontSize: 20,
          fontWeight: 'normal',
          color: '#1E293B',
          textAlign: 'left',
        },
      };
    }

    updatePresentation((prev) => {
      const nextSlides = [...prev.slides];
      const slide = nextSlides[activeSlideIndex];
      nextSlides[activeSlideIndex] = {
        ...slide,
        elements: [...slide.elements, newElem],
      };
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });
    setSelectedElementId(id);
  };

  const handleAddImage = (imageUrl: string) => {
    const id = `elem-img-${Date.now()}`;
    const newElem: SlideElement = {
      id,
      type: 'image',
      name: 'Imagem',
      content: imageUrl,
      x: 25,
      y: 20,
      width: 50,
      height: 60,
      zIndex: 5,
      style: {
        objectFit: 'cover',
        borderRadius: 16,
        shadow: true,
      },
    };

    updatePresentation((prev) => {
      const nextSlides = [...prev.slides];
      const slide = nextSlides[activeSlideIndex];
      nextSlides[activeSlideIndex] = {
        ...slide,
        elements: [...slide.elements, newElem],
      };
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });
    setSelectedElementId(id);
  };

  const handleAddShape = (shapeType: 'rectangle' | 'circle' | 'rounded-box' | 'line' | 'divider') => {
    const id = `elem-shape-${Date.now()}`;
    let newElem: SlideElement;

    if (shapeType === 'circle') {
      newElem = {
        id,
        type: 'shape',
        name: 'Círculo',
        content: '',
        x: 40,
        y: 35,
        width: 20,
        height: 35,
        zIndex: 2,
        style: {
          shapeType: 'circle',
          backgroundColor: '#3A6351',
        },
      };
    } else if (shapeType === 'line' || shapeType === 'divider') {
      newElem = {
        id,
        type: 'shape',
        name: 'Divisor',
        content: '',
        x: 25,
        y: 50,
        width: 50,
        height: 2,
        zIndex: 2,
        style: {
          shapeType: 'divider',
          backgroundColor: '#3A6351',
          borderWidth: 3,
        },
      };
    } else {
      newElem = {
        id,
        type: 'shape',
        name: 'Retângulo',
        content: '',
        x: 20,
        y: 20,
        width: 60,
        height: 60,
        zIndex: 1,
        style: {
          shapeType: shapeType === 'rounded-box' ? 'rounded-box' : 'rectangle',
          backgroundColor: '#F4F7F5',
          borderRadius: shapeType === 'rounded-box' ? 24 : 0,
        },
      };
    }

    updatePresentation((prev) => {
      const nextSlides = [...prev.slides];
      const slide = nextSlides[activeSlideIndex];
      nextSlides[activeSlideIndex] = {
        ...slide,
        elements: [...slide.elements, newElem],
      };
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });
    setSelectedElementId(id);
  };

  const handleAddNumber = () => {
    const id = `elem-num-${Date.now()}`;
    const newElem: SlideElement = {
      id,
      type: 'number',
      name: 'Métrica',
      content: '94%',
      secondaryContent: 'dos alunos relatam maior clareza após a orientação profissional',
      x: 25,
      y: 30,
      width: 50,
      height: 40,
      zIndex: 5,
      style: {
        fontSize: 72,
        color: '#3A6351',
        textAlign: 'center',
      },
    };

    updatePresentation((prev) => {
      const nextSlides = [...prev.slides];
      const slide = nextSlides[activeSlideIndex];
      nextSlides[activeSlideIndex] = {
        ...slide,
        elements: [...slide.elements, newElem],
      };
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });
    setSelectedElementId(id);
  };

  const handleAddQuote = () => {
    const id = `elem-quote-${Date.now()}`;
    const newElem: SlideElement = {
      id,
      type: 'quote',
      name: 'Citação',
      content: '“A única maneira de fazer um ótimo trabalho é amar o que você faz.”',
      secondaryContent: 'Steve Jobs',
      x: 15,
      y: 30,
      width: 70,
      height: 40,
      zIndex: 5,
      style: {
        fontSize: 32,
        color: '#1E293B',
        textAlign: 'center',
      },
    };

    updatePresentation((prev) => {
      const nextSlides = [...prev.slides];
      const slide = nextSlides[activeSlideIndex];
      nextSlides[activeSlideIndex] = {
        ...slide,
        elements: [...slide.elements, newElem],
      };
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });
    setSelectedElementId(id);
  };

  // Background & Notes updates
  const handleUpdateSlideBackground = (background: SlideBackground) => {
    updatePresentation((prev) => {
      const nextSlides = [...prev.slides];
      nextSlides[activeSlideIndex] = {
        ...nextSlides[activeSlideIndex],
        background,
      };
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });
  };

  const handleUpdateSlideNotes = (notes: PresenterNote) => {
    updatePresentation((prev) => {
      const nextSlides = [...prev.slides];
      nextSlides[activeSlideIndex] = {
        ...nextSlides[activeSlideIndex],
        notes,
      };
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });
  };

  // Save as Template
  const handleSaveAsTemplate = () => {
    saveAsTemplate(currentPres);
    alert(`Apresentação salva como modelo com sucesso! Você pode encontrá-la na aba "Meus Modelos".`);
  };

  // Collect all images used in this presentation for library reuse
  const presentationImages = currentPres.slides
    .flatMap((s) => s.elements)
    .filter((el) => el.type === 'image' && el.content)
    .map((el) => el.content);

  const selectedElement = activeSlide.elements.find((el) => el.id === selectedElementId) || null;

  return (
    <div className="w-full h-screen flex flex-col bg-[#FDFDFD] text-[#2C2C2C] overflow-hidden select-none font-sans">
      {/* Top Bar */}
      <EditorTopBar
        title={currentPres.title}
        onTitleChange={handleTitleChange}
        onBack={onBackToDashboard}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        autosaveStatus={autosaveStatus}
        onManualSave={() => {
          savePresentation(currentPres);
          setAutosaveStatus('saved');
        }}
        onSaveAsTemplate={handleSaveAsTemplate}
        onGenerateCode={() => setShowCodeModal(true)}
        onPresent={() => onPresent(currentPres, activeSlideIndex)}
      />

      {/* Quick Add Elements Sub-header */}
      <div className="w-full h-12 bg-white/90 border-b border-gray-200 px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <AddElementDropdown
            onAddText={handleAddText}
            onAddImage={handleAddImage}
            onAddShape={handleAddShape}
            onAddNumber={handleAddNumber}
            onAddQuote={handleAddQuote}
            presentationImages={presentationImages}
          />
          <span className="text-xs text-gray-400 font-sans hidden sm:inline">
            Slide {activeSlideIndex + 1} de {currentPres.slides.length}: “{activeSlide.title || 'Slide sem título'}”
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="hidden md:inline">
            Formato: 16:9 • Autosave ativo
          </span>
        </div>
      </div>

      {/* Main Workspace (Left Sidebar + Center Canvas + Right Inspector) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Thumbnails List */}
        <SlideListSidebar
          slides={currentPres.slides}
          activeSlideIndex={activeSlideIndex}
          onSelectSlide={(idx) => {
            setActiveSlideIndex(idx);
            setSelectedElementId(null);
          }}
          onAddSlide={handleAddSlide}
          onDuplicateSlide={handleDuplicateSlide}
          onDeleteSlide={handleDeleteSlide}
          onMoveSlideUp={handleMoveSlideUp}
          onMoveSlideDown={handleMoveSlideDown}
        />

        {/* Center Interactive Canvas */}
        <EditorCanvas
          slide={activeSlide}
          selectedElementId={selectedElementId}
          onSelectElement={setSelectedElementId}
          onUpdateElement={handleUpdateElement}
          onDeleteElement={handleDeleteElement}
          onDuplicateElement={handleDuplicateElement}
          onImageDrop={handleAddImage}
        />

        {/* Right Inspector / Properties Sidebar */}
        <PropertiesSidebar
          slide={activeSlide}
          selectedElement={selectedElement}
          onUpdateElement={handleUpdateElement}
          onUpdateSlideBackground={handleUpdateSlideBackground}
          onUpdateSlideNotes={handleUpdateSlideNotes}
          onDuplicateElement={handleDuplicateElement}
          onDeleteElement={handleDeleteElement}
          onBringForward={handleBringForward}
          onSendBackward={handleSendBackward}
          onAlignElement={handleAlignElement}
          presentationImages={presentationImages}
          onSelectElement={setSelectedElementId}
        />
      </div>

      {/* Code Modal */}
      <CodeModal
        presentation={currentPres}
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
      />
    </div>
  );
};
