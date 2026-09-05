import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
import {
  CommandManager,
  EditorContext,
  TransformElementCommand,
  AddElementCommand,
  DeleteElementCommand,
  DuplicateElementCommand,
  UpdateElementContentCommand,
  UpdateElementPropertiesCommand,
  AlignElementCommand,
  ReorderElementLayersCommand,
  AddSlideCommand,
  DeleteSlideCommand,
  DuplicateSlideCommand,
  MoveSlideCommand,
  UpdateSlideBackgroundCommand,
  UpdateSlideNotesCommand,
  UpdateEntireSlideCommand,
  BatchApplyPresentationCommand,
  ElementRect,
  TransformType,
} from '../../services/command';
import { Undo2, Redo2 } from 'lucide-react';
import { AIPanel } from './ai/AIPanel';
import { AICreateSlideModal } from './ai/AICreateSlideModal';
import { VisualIdentity } from '../../types';
import { createSlideWithAI } from '../../services/aiService';

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

  // AI Panel & Modal States
  const [isAIPanelOpen, setIsAIPanelOpen] = useState<boolean>(false);
  const [isCreateSlideModalOpen, setIsCreateSlideModalOpen] = useState<boolean>(false);
  const [isCreatingSlideWithAI, setIsCreatingSlideWithAI] = useState<boolean>(false);

  // Autosave status & timer
  const [autosaveStatus, setAutosaveStatus] = useState<'saving' | 'saved' | 'idle'>('saved');
  const autosaveTimerRef = useRef<any>(null);

  // Code Modal
  const [showCodeModal, setShowCodeModal] = useState(false);

  // Command Pattern Manager
  const commandManagerRef = useRef<CommandManager>(new CommandManager(60));
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [undoCommandName, setUndoCommandName] = useState<string | undefined>(undefined);
  const [redoCommandName, setRedoCommandName] = useState<string | undefined>(undefined);

  // Visual feedback toast for Undo / Redo
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'undo' | 'redo' } | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  // Ref mirrors to avoid stale state in commands
  const currentPresRef = useRef(currentPres);
  currentPresRef.current = currentPres;

  const activeSlideIndexRef = useRef(activeSlideIndex);
  activeSlideIndexRef.current = activeSlideIndex;

  const selectedElementIdRef = useRef(selectedElementId);
  selectedElementIdRef.current = selectedElementId;

  // Track recent property edits to merge rapid slider updates
  const lastPropEditRef = useRef<{
    id: string;
    propKeys: string;
    timestamp: number;
  } | null>(null);

  // Trigger autosave debounced
  const scheduleAutosave = useCallback(
    (pres: Presentation) => {
      setAutosaveStatus('saving');
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = setTimeout(() => {
        savePresentation(pres);
        onPresentationUpdated(pres);
        setAutosaveStatus('saved');
      }, 600);
    },
    [onPresentationUpdated]
  );

  // EditorContext for Command pattern execution and rollbacks
  const editorContext: EditorContext = useMemo(
    () => ({
      getPresentation: () => currentPresRef.current,
      setPresentation: (updater, options) => {
        setCurrentPres((prev) => {
          const next = updater(prev);
          currentPresRef.current = next;
          if (!options?.skipAutosave) {
            scheduleAutosave(next);
          }
          return next;
        });
      },
      getActiveSlideIndex: () => activeSlideIndexRef.current,
      setActiveSlideIndex: (index: number) => {
        setActiveSlideIndex(index);
        activeSlideIndexRef.current = index;
      },
      getSelectedElementId: () => selectedElementIdRef.current,
      setSelectedElementId: (id: string | null) => {
        setSelectedElementId(id);
        selectedElementIdRef.current = id;
      },
      showFeedbackToast: (message, type) => {
        if (type === 'undo' || type === 'redo') {
          setFeedbackToast({ message, type });
          if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
          toastTimeoutRef.current = setTimeout(() => {
            setFeedbackToast(null);
          }, 2200);
        }
      },
    }),
    [scheduleAutosave]
  );

  // Subscribe to command manager events
  useEffect(() => {
    const manager = commandManagerRef.current;

    manager.onFeedback = (message, type) => {
      setFeedbackToast({ message, type });
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        setFeedbackToast(null);
      }, 2200);
    };

    const unsubscribe = manager.subscribe(() => {
      setCanUndo(manager.canUndo());
      setCanRedo(manager.canRedo());
      setUndoCommandName(manager.getUndoCommandName());
      setRedoCommandName(manager.getRedoCommandName());
    });

    return () => {
      unsubscribe();
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Global Keyboard shortcuts for Undo (Ctrl/Cmd+Z) and Redo (Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isField =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.getAttribute('contenteditable') === 'true';

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      if (!isCtrlOrCmd) return;

      const isZ = e.key === 'z' || e.key === 'Z';
      const isY = e.key === 'y' || e.key === 'Y';

      // Undo: Ctrl+Z or Cmd+Z (without shift)
      if (isZ && !e.shiftKey) {
        if (isField) return; // Allow native undo inside active inputs
        e.preventDefault();
        commandManagerRef.current.undo();
      }
      // Redo: Ctrl+Shift+Z or Cmd+Shift+Z or Ctrl+Y or Cmd+Y
      else if ((isZ && e.shiftKey) || isY) {
        if (isField) return;
        e.preventDefault();
        commandManagerRef.current.redo();
      }
      // AI Assistant: Ctrl+I or Cmd+I
      else if (e.key === 'i' || e.key === 'I') {
        if (isField) return;
        e.preventDefault();
        setIsAIPanelOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Safe active slide
  const activeSlide: EditorSlide =
    currentPres.slides[activeSlideIndex] ||
    currentPres.slides[0] || {
      id: 'slide-fallback',
      title: 'Slide 1',
      elements: [],
      background: { type: 'color', value: '#FFFFFF' },
    };

  // Title edit
  const handleTitleChange = (newTitle: string) => {
    editorContext.setPresentation((prev) => ({
      ...prev,
      title: newTitle,
      updatedAt: new Date().toISOString(),
    }));
  };

  // =========================================================
  // CANVAS TRANSFORM COMMANDS (Drag Move, Resize, Rotate)
  // =========================================================

  // Live updates during continuous dragging for 60fps rendering without creating hundreds of commands
  const handleLiveUpdateElement = (id: string, updates: Partial<SlideElement>) => {
    setCurrentPres((prev) => {
      const nextSlides = [...prev.slides];
      const slide = nextSlides[activeSlideIndexRef.current];
      if (!slide) return prev;

      nextSlides[activeSlideIndexRef.current] = {
        ...slide,
        elements: slide.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
      };
      const nextPres = { ...prev, slides: nextSlides };
      currentPresRef.current = nextPres;
      return nextPres;
    });
  };

  // Commit transform after gesture completes (pointer up)
  const handleCommitTransform = (
    id: string,
    prevRect: ElementRect,
    newRect: ElementRect,
    actionType: TransformType
  ) => {
    const cmd = new TransformElementCommand(
      editorContext,
      activeSlideIndexRef.current,
      id,
      prevRect,
      newRect,
      actionType
    );
    commandManagerRef.current.execute(cmd);
  };

  // Commit keyboard nudge (arrow keys)
  const handleCommitNudge = (id: string, prevRect: ElementRect, newRect: ElementRect) => {
    const cmd = new TransformElementCommand(
      editorContext,
      activeSlideIndexRef.current,
      id,
      prevRect,
      newRect,
      'nudge'
    );
    commandManagerRef.current.execute(cmd);
  };

  // Commit inline text editing on blur
  const handleCommitTextEdit = (id: string, prevText: string, newText: string) => {
    const cmd = new UpdateElementContentCommand(
      editorContext,
      activeSlideIndexRef.current,
      id,
      prevText,
      newText,
      'texto'
    );
    commandManagerRef.current.execute(cmd);
  };

  // =========================================================
  // SLIDE MANAGEMENT VIA COMMANDS
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

    const cmd = new AddSlideCommand(editorContext, newSlide, currentPres.slides.length);
    commandManagerRef.current.execute(cmd);
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

    const cmd = new DuplicateSlideCommand(editorContext, duplicatedSlide, index + 1, index);
    commandManagerRef.current.execute(cmd);
  };

  const handleDeleteSlide = (index: number) => {
    if (currentPres.slides.length <= 1) return;
    const targetSlide = currentPres.slides[index];
    if (!targetSlide) return;

    const cmd = new DeleteSlideCommand(editorContext, targetSlide, index);
    commandManagerRef.current.execute(cmd);
  };

  const handleMoveSlideUp = (index: number) => {
    if (index === 0) return;
    const cmd = new MoveSlideCommand(editorContext, index, index - 1);
    commandManagerRef.current.execute(cmd);
  };

  const handleMoveSlideDown = (index: number) => {
    if (index === currentPres.slides.length - 1) return;
    const cmd = new MoveSlideCommand(editorContext, index, index + 1);
    commandManagerRef.current.execute(cmd);
  };

  // =========================================================
  // ELEMENT MANAGEMENT VIA COMMANDS
  // =========================================================

  // Update properties from PropertiesSidebar (e.g. font, color, border, alignment)
  const handleUpdateElementProperties = (
    id: string,
    updates: Partial<SlideElement>,
    actionName?: string
  ) => {
    const slide = currentPresRef.current.slides[activeSlideIndexRef.current];
    if (!slide) return;
    const target = slide.elements.find((el) => el.id === id);
    if (!target) return;

    // Snapshot previous values for specified update keys
    const prevProperties: Partial<SlideElement> = {};
    for (const key of Object.keys(updates) as (keyof SlideElement)[]) {
      if (key === 'style') {
        prevProperties.style = { ...target.style };
      } else {
        (prevProperties as any)[key] = target[key];
      }
    }

    const propKeys = Object.keys(updates).join(',') + (updates.style ? Object.keys(updates.style).join(',') : '');
    const now = Date.now();

    // If rapidly sliding the same numeric property within 400ms, update state smoothly
    if (
      lastPropEditRef.current &&
      lastPropEditRef.current.id === id &&
      lastPropEditRef.current.propKeys === propKeys &&
      now - lastPropEditRef.current.timestamp < 400
    ) {
      handleLiveUpdateElement(id, updates);
      scheduleAutosave(currentPresRef.current);
      lastPropEditRef.current.timestamp = now;
      return;
    }

    lastPropEditRef.current = { id, propKeys, timestamp: now };

    const cmd = new UpdateElementPropertiesCommand(
      editorContext,
      activeSlideIndexRef.current,
      id,
      prevProperties,
      updates,
      actionName || 'Alterar propriedades'
    );
    commandManagerRef.current.execute(cmd);
  };

  const handleDeleteElement = (id: string) => {
    const slide = currentPresRef.current.slides[activeSlideIndexRef.current];
    if (!slide) return;
    const index = slide.elements.findIndex((el) => el.id === id);
    const element = slide.elements[index];
    if (!element || index === -1) return;

    const cmd = new DeleteElementCommand(editorContext, activeSlideIndexRef.current, element, index);
    commandManagerRef.current.execute(cmd);
  };

  const handleDuplicateElement = (id: string) => {
    const slide = currentPresRef.current.slides[activeSlideIndexRef.current];
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

    const cmd = new DuplicateElementCommand(editorContext, activeSlideIndexRef.current, duplicated, id);
    commandManagerRef.current.execute(cmd);
  };

  const handleBringForward = (id: string) => {
    const slide = currentPresRef.current.slides[activeSlideIndexRef.current];
    if (!slide) return;

    const prevElements = [...slide.elements];
    const maxZ = Math.max(...prevElements.map((e) => e.zIndex || 0), 1);
    const newElements = prevElements.map((el) => (el.id === id ? { ...el, zIndex: maxZ + 1 } : el));

    const cmd = new ReorderElementLayersCommand(
      editorContext,
      activeSlideIndexRef.current,
      id,
      prevElements,
      newElements,
      'forward'
    );
    commandManagerRef.current.execute(cmd);
  };

  const handleSendBackward = (id: string) => {
    const slide = currentPresRef.current.slides[activeSlideIndexRef.current];
    if (!slide) return;

    const prevElements = [...slide.elements];
    const minZ = Math.min(...prevElements.map((e) => e.zIndex || 0), 1);
    const newElements = prevElements.map((el) =>
      el.id === id ? { ...el, zIndex: Math.max(0, minZ - 1) } : el
    );

    const cmd = new ReorderElementLayersCommand(
      editorContext,
      activeSlideIndexRef.current,
      id,
      prevElements,
      newElements,
      'backward'
    );
    commandManagerRef.current.execute(cmd);
  };

  const handleAlignElement = (
    id: string,
    alignment: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom'
  ) => {
    const slide = currentPresRef.current.slides[activeSlideIndexRef.current];
    const target = slide?.elements.find((el) => el.id === id);
    if (!target) return;

    const prevCoords = { x: target.x, y: target.y };
    let newCoords = { x: target.x, y: target.y };
    let label = 'Esquerda';

    switch (alignment) {
      case 'left':
        newCoords = { ...newCoords, x: 5 };
        label = 'Esquerda';
        break;
      case 'center-h':
        newCoords = { ...newCoords, x: Math.round((50 - target.width / 2) * 10) / 10 };
        label = 'Centro Horizontal';
        break;
      case 'right':
        newCoords = { ...newCoords, x: Math.round((95 - target.width) * 10) / 10 };
        label = 'Direita';
        break;
      case 'top':
        newCoords = { ...newCoords, y: 5 };
        label = 'Topo';
        break;
      case 'center-v':
        newCoords = { ...newCoords, y: Math.round((50 - target.height / 2) * 10) / 10 };
        label = 'Centro Vertical';
        break;
      case 'bottom':
        newCoords = { ...newCoords, y: Math.round((95 - target.height) * 10) / 10 };
        label = 'Base';
        break;
    }

    const cmd = new AlignElementCommand(
      editorContext,
      activeSlideIndexRef.current,
      id,
      prevCoords,
      newCoords,
      label
    );
    commandManagerRef.current.execute(cmd);
  };

  // Add Elements via AddElementCommand
  const handleAddText = (type: 'title' | 'subtitle' | 'body' | 'free') => {
    const id = `elem-txt-${Date.now()}`;
    let newElem: SlideElement;

    if (type === 'title') {
      newElem = {
        id,
        type: 'text',
        name: 'Título',
        content: 'Novo Título Principal',
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
        content: 'Adicione um subtítulo explicativo com detalhes adicionais',
        x: 15,
        y: 42,
        width: 70,
        height: 12,
        zIndex: 10,
        style: {
          fontFamily: 'sans',
          fontSize: 22,
          fontWeight: 'normal',
          color: '#64748B',
          textAlign: 'center',
        },
      };
    } else if (type === 'body') {
      newElem = {
        id,
        type: 'text',
        name: 'Parágrafo',
        content:
          'Escreva seu parágrafo ou argumentação. Apresente seus dados e tópicos com clareza e autoridade.',
        x: 20,
        y: 40,
        width: 60,
        height: 25,
        zIndex: 10,
        style: {
          fontFamily: 'sans',
          fontSize: 16,
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
        name: 'Caixa de Texto',
        content: 'Texto livre para personalização',
        x: 35,
        y: 45,
        width: 30,
        height: 10,
        zIndex: 10,
        style: {
          fontFamily: 'sans',
          fontSize: 18,
          fontWeight: 'normal',
          color: '#1E293B',
          textAlign: 'left',
        },
      };
    }

    const cmd = new AddElementCommand(editorContext, activeSlideIndexRef.current, newElem);
    commandManagerRef.current.execute(cmd);
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

    const cmd = new AddElementCommand(editorContext, activeSlideIndexRef.current, newElem);
    commandManagerRef.current.execute(cmd);
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

    const cmd = new AddElementCommand(editorContext, activeSlideIndexRef.current, newElem);
    commandManagerRef.current.execute(cmd);
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

    const cmd = new AddElementCommand(editorContext, activeSlideIndexRef.current, newElem);
    commandManagerRef.current.execute(cmd);
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

    const cmd = new AddElementCommand(editorContext, activeSlideIndexRef.current, newElem);
    commandManagerRef.current.execute(cmd);
  };

  // Background & Notes updates via commands
  const handleUpdateSlideBackground = (background: SlideBackground) => {
    const slide = currentPresRef.current.slides[activeSlideIndexRef.current];
    if (!slide) return;
    const prevBg = slide.background || { type: 'color', value: '#FFFFFF' };
    const cmd = new UpdateSlideBackgroundCommand(
      editorContext,
      activeSlideIndexRef.current,
      prevBg,
      background
    );
    commandManagerRef.current.execute(cmd);
  };

  const handleUpdateSlideNotes = (notes: PresenterNote) => {
    const slide = currentPresRef.current.slides[activeSlideIndexRef.current];
    if (!slide) return;
    const prevNotes = slide.notes || { script: '', question: '', suggestedTime: '', objective: '' };
    const cmd = new UpdateSlideNotesCommand(
      editorContext,
      activeSlideIndexRef.current,
      prevNotes,
      notes
    );
    commandManagerRef.current.execute(cmd);
  };

  // Save as Template
  const handleSaveAsTemplate = () => {
    saveAsTemplate(currentPres);
    alert(`Apresentação salva como modelo com sucesso! Você pode encontrá-la na aba "Meus Modelos".`);
  };

  // AI Handlers
  const handleApplySlideEdit = (updatedSlide: EditorSlide, description: string) => {
    const prevSlide = currentPresRef.current.slides[activeSlideIndexRef.current];
    if (!prevSlide) return;
    const cmd = new UpdateEntireSlideCommand(
      editorContext,
      activeSlideIndexRef.current,
      prevSlide,
      updatedSlide,
      `IA: ${description}`
    );
    commandManagerRef.current.execute(cmd);
  };

  const handleAddNewSlide = (newSlide: EditorSlide) => {
    const insertIndex = activeSlideIndexRef.current + 1;
    const cmd = new AddSlideCommand(editorContext, newSlide, insertIndex);
    commandManagerRef.current.execute(cmd);
    setActiveSlideIndex(insertIndex);
    setSelectedElementId(null);
  };

  const handleCreateSlideFromModal = async (slideType: string, customPrompt: string) => {
    setIsCreatingSlideWithAI(true);
    try {
      const res = await createSlideWithAI({
        prompt: customPrompt || `Criar slide profissional do tipo ${slideType}`,
        slideType,
        afterSlideIndex: activeSlideIndexRef.current,
        presentationContext: {
          presentationTitle: currentPresRef.current.title,
          totalSlides: currentPresRef.current.slides.length,
          currentSlide: { title: activeSlide.title },
          visualIdentity: currentPresRef.current.visualIdentity,
        },
      });

      handleAddNewSlide(res.newSlide);
    } catch (err: any) {
      console.error('Falha ao criar slide com IA:', err);
      alert(err.message || 'Erro ao criar slide com IA');
    } finally {
      setIsCreatingSlideWithAI(false);
    }
  };

  const handleApplyIdentityToAll = (identity: VisualIdentity) => {
    const prevPres = currentPresRef.current;
    const newPres: Presentation = {
      ...prevPres,
      visualIdentity: identity,
      slides: prevPres.slides.map((s) => ({
        ...s,
        background:
          s.background?.type === 'color'
            ? { type: 'color', value: identity.backgroundColor || '#FDFBF7' }
            : s.background,
        elements: s.elements.map((el) => {
          if (el.locked) return el;
          if (el.type === 'text') {
            const isTitle = el.style.fontSize && el.style.fontSize > 26;
            return {
              ...el,
              style: {
                ...el.style,
                fontFamily: isTitle ? 'serif' : 'sans-serif',
                color: isTitle ? identity.primaryColor : el.style.color || '#2C2C2C',
              },
            };
          }
          if (el.type === 'shape') {
            return {
              ...el,
              style: {
                ...el.style,
                backgroundColor: identity.primaryColor,
              },
            };
          }
          return el;
        }),
      })),
      updatedAt: new Date().toISOString(),
    };

    const cmd = new BatchApplyPresentationCommand(
      editorContext,
      prevPres,
      newPres,
      'IA: Aplicar Identidade Visual'
    );
    commandManagerRef.current.execute(cmd);
  };

  // Collect all images used in this presentation for library reuse
  const presentationImages = currentPres.slides
    .flatMap((s) => s.elements)
    .filter((el) => el.type === 'image' && el.content)
    .map((el) => el.content);

  const selectedElement = activeSlide.elements.find((el) => el.id === selectedElementId) || null;

  return (
    <div className="w-full h-screen flex flex-col bg-[#FDFDFD] text-[#2C2C2C] overflow-hidden select-none font-sans relative">
      {/* Top Bar with Command Pattern Undo / Redo & AI Toggle */}
      <EditorTopBar
        title={currentPres.title}
        onTitleChange={handleTitleChange}
        onBack={onBackToDashboard}
        onUndo={() => commandManagerRef.current.undo()}
        onRedo={() => commandManagerRef.current.redo()}
        canUndo={canUndo}
        canRedo={canRedo}
        undoCommandName={undoCommandName}
        redoCommandName={redoCommandName}
        autosaveStatus={autosaveStatus}
        onManualSave={() => {
          savePresentation(currentPres);
          setAutosaveStatus('saved');
        }}
        onSaveAsTemplate={handleSaveAsTemplate}
        onGenerateCode={() => setShowCodeModal(true)}
        onPresent={() => onPresent(currentPres, activeSlideIndex)}
        isAIPanelOpen={isAIPanelOpen}
        onToggleAIPanel={() => setIsAIPanelOpen((prev) => !prev)}
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
            Formato: 16:9 • Comandos: Ctrl+Z / Ctrl+Shift+Z • IA: Ctrl+I
          </span>
        </div>
      </div>

      {/* Main Workspace (Left Sidebar + Center Canvas + Right Inspector or AI Assistant Panel) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Thumbnails List */}
        <SlideListSidebar
          slides={currentPres.slides}
          activeSlideIndex={activeSlideIndex}
          onSelectSlide={(idx) => {
            setActiveSlideIndex(idx);
            setSelectedElementId(null);
          }}
          onAddSlide={handleAddSlide}
          onOpenCreateWithAI={() => setIsCreateSlideModalOpen(true)}
          onDuplicateSlide={handleDuplicateSlide}
          onDeleteSlide={handleDeleteSlide}
          onMoveSlideUp={handleMoveSlideUp}
          onMoveSlideDown={handleMoveSlideDown}
        />

        {/* Center Interactive Canvas with Command Commits */}
        <EditorCanvas
          slide={activeSlide}
          selectedElementId={selectedElementId}
          onSelectElement={setSelectedElementId}
          onUpdateElement={handleLiveUpdateElement}
          onCommitTransform={handleCommitTransform}
          onCommitNudge={handleCommitNudge}
          onCommitTextEdit={handleCommitTextEdit}
          onDeleteElement={handleDeleteElement}
          onDuplicateElement={handleDuplicateElement}
          onImageDrop={handleAddImage}
        />

        {/* AI Assistant Side Panel (if open) */}
        {isAIPanelOpen ? (
          <AIPanel
            isOpen={isAIPanelOpen}
            onClose={() => setIsAIPanelOpen(false)}
            slide={activeSlide}
            slideIndex={activeSlideIndex}
            presentation={currentPres}
            onApplySlideEdit={handleApplySlideEdit}
            onAddNewSlide={handleAddNewSlide}
            onUndoLastAction={() => commandManagerRef.current.undo()}
            canUndo={canUndo}
            onGoToSlide={(idx) => {
              setActiveSlideIndex(idx);
              setSelectedElementId(null);
            }}
            onApplyIdentityToAll={handleApplyIdentityToAll}
          />
        ) : (
          /* Right Inspector / Properties Sidebar */
          <PropertiesSidebar
            slide={activeSlide}
            selectedElement={selectedElement}
            onUpdateElement={handleUpdateElementProperties}
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
        )}
      </div>

      {/* Visual Feedback Toast for Undo / Redo */}
      {feedbackToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2 bg-gray-900/95 backdrop-blur-md text-white rounded-full text-xs font-medium shadow-2xl border border-white/10 pointer-events-none animate-in fade-in slide-in-from-bottom-3 duration-200">
          {feedbackToast.type === 'undo' ? (
            <Undo2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Redo2 className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span>{feedbackToast.message}</span>
          <span className="text-gray-400 text-[10px] pl-1.5 border-l border-gray-700">
            {feedbackToast.type === 'undo' ? 'Ctrl+Z' : 'Ctrl+Shift+Z'}
          </span>
        </div>
      )}

      {/* Code Modal */}
      <CodeModal
        presentation={currentPres}
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
      />

      {/* AI Create Slide Modal */}
      <AICreateSlideModal
        isOpen={isCreateSlideModalOpen}
        onClose={() => setIsCreateSlideModalOpen(false)}
        onCreateSlide={handleCreateSlideFromModal}
        isLoading={isCreatingSlideWithAI}
      />
    </div>
  );
};
