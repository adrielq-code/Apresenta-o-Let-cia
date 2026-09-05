import { Presentation, EditorSlide, SlideElement, SlideBackground, PresenterNote } from '../../types';

export interface Command {
  /** Descriptive name for the action in Portuguese (e.g. "Mover elemento", "Redimensionar") */
  readonly name: string;
  /** Execute or apply the change */
  execute(): void;
  /** Revert or undo the change */
  undo(): void;
  /** Optional custom redo, defaults to calling execute() */
  redo?(): void;
}

export interface EditorContext {
  getPresentation: () => Presentation;
  setPresentation: (
    updater: (prev: Presentation) => Presentation,
    options?: { recordCommand?: boolean; skipAutosave?: boolean }
  ) => void;
  getActiveSlideIndex: () => number;
  setActiveSlideIndex: (index: number) => void;
  getSelectedElementId: () => string | null;
  setSelectedElementId: (id: string | null) => void;
  showFeedbackToast?: (message: string, type: 'undo' | 'redo' | 'action') => void;
}

export type TransformType = 'move' | 'resize' | 'rotate';

export interface ElementRect {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}
