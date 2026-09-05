import {
  Command,
  EditorContext,
  ElementRect,
  TransformType,
} from './types';
import {
  EditorSlide,
  SlideElement,
  SlideBackground,
  PresenterNote,
} from '../../types';

// =========================================================
// 1. TRANSFORM COMMAND (Move, Resize, Rotate, Nudge)
// =========================================================
export class TransformElementCommand implements Command {
  readonly name: string;

  constructor(
    private context: EditorContext,
    private slideIndex: number,
    private elementId: string,
    private prevRect: ElementRect,
    private newRect: ElementRect,
    private transformType: TransformType | 'nudge'
  ) {
    switch (transformType) {
      case 'move':
        this.name = 'Mover elemento';
        break;
      case 'resize':
        this.name = 'Redimensionar elemento';
        break;
      case 'rotate':
        this.name = 'Rotacionar elemento';
        break;
      case 'nudge':
        this.name = 'Ajustar posição';
        break;
      default:
        this.name = 'Transformar elemento';
    }
  }

  execute(): void {
    this.applyRect(this.newRect);
  }

  undo(): void {
    this.applyRect(this.prevRect);
  }

  private applyRect(rect: ElementRect): void {
    this.context.setPresentation((prev) => {
      const nextSlides = [...prev.slides];
      const slide = nextSlides[this.slideIndex];
      if (!slide) return prev;

      nextSlides[this.slideIndex] = {
        ...slide,
        elements: slide.elements.map((el) =>
          el.id === this.elementId
            ? {
                ...el,
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
                rotation: rect.rotation,
              }
            : el
        ),
      };
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });

    this.context.setActiveSlideIndex(this.slideIndex);
    this.context.setSelectedElementId(this.elementId);
  }
}

// =========================================================
// 2. ADD ELEMENT COMMAND
// =========================================================
export class AddElementCommand implements Command {
  readonly name: string;

  constructor(
    private context: EditorContext,
    private slideIndex: number,
    private element: SlideElement
  ) {
    this.name = `Adicionar ${this.element.name || 'elemento'}`;
  }

  execute(): void {
    this.context.setPresentation((prev) => {
      const nextSlides = [...prev.slides];
      const slide = nextSlides[this.slideIndex];
      if (!slide) return prev;

      nextSlides[this.slideIndex] = {
        ...slide,
        elements: [...slide.elements, this.element],
      };
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });

    this.context.setActiveSlideIndex(this.slideIndex);
    this.context.setSelectedElementId(this.element.id);
  }

  undo(): void {
    this.context.setPresentation((prev) => {
      const nextSlides = [...prev.slides];
      const slide = nextSlides[this.slideIndex];
      if (!slide) return prev;

      nextSlides[this.slideIndex] = {
        ...slide,
        elements: slide.elements.filter((el) => el.id !== this.element.id),
      };
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });

    this.context.setActiveSlideIndex(this.slideIndex);
    if (this.context.getSelectedElementId() === this.element.id) {
      this.context.setSelectedElementId(null);
    }
  }
}

// =========================================================
// 3. DELETE ELEMENT COMMAND
// =========================================================
export class DeleteElementCommand implements Command {
  readonly name: string;

  constructor(
    private context: EditorContext,
    private slideIndex: number,
    private element: SlideElement,
    private elementIndex: number
  ) {
    this.name = `Excluir ${this.element.name || 'elemento'}`;
  }

  execute(): void {
    this.context.setPresentation((prev) => {
      const nextSlides = [...prev.slides];
      const slide = nextSlides[this.slideIndex];
      if (!slide) return prev;

      nextSlides[this.slideIndex] = {
        ...slide,
        elements: slide.elements.filter((el) => el.id !== this.element.id),
      };
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });

    this.context.setActiveSlideIndex(this.slideIndex);
    if (this.context.getSelectedElementId() === this.element.id) {
      this.context.setSelectedElementId(null);
    }
  }

  undo(): void {
    this.context.setPresentation((prev) => {
      const nextSlides = [...prev.slides];
      const slide = nextSlides[this.slideIndex];
      if (!slide) return prev;

      const nextElements = [...slide.elements];
      nextElements.splice(this.elementIndex, 0, this.element);

      nextSlides[this.slideIndex] = {
        ...slide,
        elements: nextElements,
      };
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });

    this.context.setActiveSlideIndex(this.slideIndex);
    this.context.setSelectedElementId(this.element.id);
  }
}

// =========================================================
// 4. DUPLICATE ELEMENT COMMAND
// =========================================================
export class DuplicateElementCommand implements Command {
  readonly name = 'Duplicar elemento';

  constructor(
    private context: EditorContext,
    private slideIndex: number,
    private duplicatedElement: SlideElement,
    private originalElementId: string
  ) {}

  execute(): void {
    this.context.setPresentation((prev) => {
      const nextSlides = [...prev.slides];
      const slide = nextSlides[this.slideIndex];
      if (!slide) return prev;

      nextSlides[this.slideIndex] = {
        ...slide,
        elements: [...slide.elements, this.duplicatedElement],
      };
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });

    this.context.setActiveSlideIndex(this.slideIndex);
    this.context.setSelectedElementId(this.duplicatedElement.id);
  }

  undo(): void {
    this.context.setPresentation((prev) => {
      const nextSlides = [...prev.slides];
      const slide = nextSlides[this.slideIndex];
      if (!slide) return prev;

      nextSlides[this.slideIndex] = {
        ...slide,
        elements: slide.elements.filter((el) => el.id !== this.duplicatedElement.id),
      };
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });

    this.context.setActiveSlideIndex(this.slideIndex);
    this.context.setSelectedElementId(this.originalElementId);
  }
}

// =========================================================
// 5. UPDATE ELEMENT CONTENT / TEXT COMMAND
// =========================================================
export class UpdateElementContentCommand implements Command {
  readonly name: string;

  constructor(
    private context: EditorContext,
    private slideIndex: number,
    private elementId: string,
    private prevContent: string,
    private newContent: string,
    fieldName = 'conteúdo'
  ) {
    this.name = `Editar ${fieldName}`;
  }

  execute(): void {
    this.applyContent(this.newContent);
  }

  undo(): void {
    this.applyContent(this.prevContent);
  }

  private applyContent(content: string): void {
    this.context.setPresentation((prev) => {
      const nextSlides = [...prev.slides];
      const slide = nextSlides[this.slideIndex];
      if (!slide) return prev;

      nextSlides[this.slideIndex] = {
        ...slide,
        elements: slide.elements.map((el) =>
          el.id === this.elementId ? { ...el, content } : el
        ),
      };
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });

    this.context.setActiveSlideIndex(this.slideIndex);
    this.context.setSelectedElementId(this.elementId);
  }
}

// =========================================================
// 6. UPDATE ELEMENT PROPERTIES / STYLE COMMAND
// =========================================================
export class UpdateElementPropertiesCommand implements Command {
  readonly name: string;

  constructor(
    private context: EditorContext,
    private slideIndex: number,
    private elementId: string,
    private prevProperties: Partial<SlideElement>,
    private newProperties: Partial<SlideElement>,
    actionName = 'Alterar propriedades'
  ) {
    this.name = actionName;
  }

  execute(): void {
    this.applyProps(this.newProperties);
  }

  undo(): void {
    this.applyProps(this.prevProperties);
  }

  private applyProps(props: Partial<SlideElement>): void {
    this.context.setPresentation((prev) => {
      const nextSlides = [...prev.slides];
      const slide = nextSlides[this.slideIndex];
      if (!slide) return prev;

      nextSlides[this.slideIndex] = {
        ...slide,
        elements: slide.elements.map((el) => {
          if (el.id !== this.elementId) return el;
          return {
            ...el,
            ...props,
            style: {
              ...el.style,
              ...(props.style || {}),
            },
          };
        }),
      };
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });

    this.context.setActiveSlideIndex(this.slideIndex);
    this.context.setSelectedElementId(this.elementId);
  }
}

// =========================================================
// 7. ALIGN ELEMENT COMMAND
// =========================================================
export class AlignElementCommand implements Command {
  readonly name: string;

  constructor(
    private context: EditorContext,
    private slideIndex: number,
    private elementId: string,
    private prevCoords: { x: number; y: number },
    private newCoords: { x: number; y: number },
    alignmentLabel: string
  ) {
    this.name = `Alinhar (${alignmentLabel})`;
  }

  execute(): void {
    this.applyCoords(this.newCoords);
  }

  undo(): void {
    this.applyCoords(this.prevCoords);
  }

  private applyCoords(coords: { x: number; y: number }): void {
    this.context.setPresentation((prev) => {
      const nextSlides = [...prev.slides];
      const slide = nextSlides[this.slideIndex];
      if (!slide) return prev;

      nextSlides[this.slideIndex] = {
        ...slide,
        elements: slide.elements.map((el) =>
          el.id === this.elementId ? { ...el, x: coords.x, y: coords.y } : el
        ),
      };
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });

    this.context.setActiveSlideIndex(this.slideIndex);
    this.context.setSelectedElementId(this.elementId);
  }
}

// =========================================================
// 8. REORDER ELEMENT LAYERS COMMAND (Z-Index / Camadas)
// =========================================================
export class ReorderElementLayersCommand implements Command {
  readonly name: string;

  constructor(
    private context: EditorContext,
    private slideIndex: number,
    private elementId: string,
    private prevElements: SlideElement[],
    private newElements: SlideElement[],
    direction: 'forward' | 'backward'
  ) {
    this.name = direction === 'forward' ? 'Trazer para frente' : 'Enviar para trás';
  }

  execute(): void {
    this.applyElements(this.newElements);
  }

  undo(): void {
    this.applyElements(this.prevElements);
  }

  private applyElements(elements: SlideElement[]): void {
    this.context.setPresentation((prev) => {
      const nextSlides = [...prev.slides];
      const slide = nextSlides[this.slideIndex];
      if (!slide) return prev;

      nextSlides[this.slideIndex] = {
        ...slide,
        elements,
      };
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });

    this.context.setActiveSlideIndex(this.slideIndex);
    this.context.setSelectedElementId(this.elementId);
  }
}

// =========================================================
// 9. SLIDE COMMANDS (Add, Delete, Duplicate, Move)
// =========================================================
export class AddSlideCommand implements Command {
  readonly name = 'Adicionar slide';

  constructor(
    private context: EditorContext,
    private slide: EditorSlide,
    private insertIndex: number
  ) {}

  execute(): void {
    this.context.setPresentation((prev) => {
      const nextSlides = [...prev.slides];
      nextSlides.splice(this.insertIndex, 0, this.slide);
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });
    this.context.setActiveSlideIndex(this.insertIndex);
    this.context.setSelectedElementId(null);
  }

  undo(): void {
    this.context.setPresentation((prev) => {
      const nextSlides = prev.slides.filter((_, idx) => idx !== this.insertIndex);
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });
    const newIdx = Math.max(0, this.insertIndex - 1);
    this.context.setActiveSlideIndex(newIdx);
    this.context.setSelectedElementId(null);
  }
}

export class DeleteSlideCommand implements Command {
  readonly name = 'Excluir slide';

  constructor(
    private context: EditorContext,
    private slide: EditorSlide,
    private deletedIndex: number
  ) {}

  execute(): void {
    this.context.setPresentation((prev) => {
      const nextSlides = prev.slides.filter((_, idx) => idx !== this.deletedIndex);
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });
    const currentActive = this.context.getActiveSlideIndex();
    const newIdx = Math.max(0, currentActive >= this.deletedIndex ? currentActive - 1 : currentActive);
    this.context.setActiveSlideIndex(newIdx);
    this.context.setSelectedElementId(null);
  }

  undo(): void {
    this.context.setPresentation((prev) => {
      const nextSlides = [...prev.slides];
      nextSlides.splice(this.deletedIndex, 0, this.slide);
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });
    this.context.setActiveSlideIndex(this.deletedIndex);
    this.context.setSelectedElementId(null);
  }
}

export class DuplicateSlideCommand implements Command {
  readonly name = 'Duplicar slide';

  constructor(
    private context: EditorContext,
    private duplicatedSlide: EditorSlide,
    private insertIndex: number,
    private sourceIndex: number
  ) {}

  execute(): void {
    this.context.setPresentation((prev) => {
      const nextSlides = [...prev.slides];
      nextSlides.splice(this.insertIndex, 0, this.duplicatedSlide);
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });
    this.context.setActiveSlideIndex(this.insertIndex);
    this.context.setSelectedElementId(null);
  }

  undo(): void {
    this.context.setPresentation((prev) => {
      const nextSlides = prev.slides.filter((_, idx) => idx !== this.insertIndex);
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });
    this.context.setActiveSlideIndex(this.sourceIndex);
    this.context.setSelectedElementId(null);
  }
}

export class MoveSlideCommand implements Command {
  readonly name = 'Reordenar slide';

  constructor(
    private context: EditorContext,
    private fromIndex: number,
    private toIndex: number
  ) {}

  execute(): void {
    this.move(this.fromIndex, this.toIndex);
  }

  undo(): void {
    this.move(this.toIndex, this.fromIndex);
  }

  private move(from: number, to: number): void {
    this.context.setPresentation((prev) => {
      const nextSlides = [...prev.slides];
      const [item] = nextSlides.splice(from, 1);
      nextSlides.splice(to, 0, item);
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });
    this.context.setActiveSlideIndex(to);
  }
}

// =========================================================
// 10. SLIDE BACKGROUND & NOTES COMMANDS
// =========================================================
export class UpdateSlideBackgroundCommand implements Command {
  readonly name = 'Alterar fundo do slide';

  constructor(
    private context: EditorContext,
    private slideIndex: number,
    private prevBackground: SlideBackground,
    private newBackground: SlideBackground
  ) {}

  execute(): void {
    this.applyBackground(this.newBackground);
  }

  undo(): void {
    this.applyBackground(this.prevBackground);
  }

  private applyBackground(bg: SlideBackground): void {
    this.context.setPresentation((prev) => {
      const nextSlides = [...prev.slides];
      const slide = nextSlides[this.slideIndex];
      if (!slide) return prev;

      nextSlides[this.slideIndex] = {
        ...slide,
        background: bg,
      };
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });
    this.context.setActiveSlideIndex(this.slideIndex);
  }
}

export class UpdateSlideNotesCommand implements Command {
  readonly name = 'Alterar notas do apresentador';

  constructor(
    private context: EditorContext,
    private slideIndex: number,
    private prevNotes: PresenterNote,
    private newNotes: PresenterNote
  ) {}

  execute(): void {
    this.applyNotes(this.newNotes);
  }

  undo(): void {
    this.applyNotes(this.prevNotes);
  }

  private applyNotes(notes: PresenterNote): void {
    this.context.setPresentation((prev) => {
      const nextSlides = [...prev.slides];
      const slide = nextSlides[this.slideIndex];
      if (!slide) return prev;

      nextSlides[this.slideIndex] = {
        ...slide,
        notes,
      };
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });
    this.context.setActiveSlideIndex(this.slideIndex);
  }
}

// =========================================================
// 11. AI SLIDE & PRESENTATION COMMANDS
// =========================================================
export class UpdateEntireSlideCommand implements Command {
  readonly name: string;

  constructor(
    private context: EditorContext,
    private slideIndex: number,
    private prevSlide: EditorSlide,
    private newSlide: EditorSlide,
    commandName: string = 'IA: Atualizar slide'
  ) {
    this.name = commandName;
  }

  execute(): void {
    this.context.setPresentation((prev) => {
      const nextSlides = [...prev.slides];
      nextSlides[this.slideIndex] = JSON.parse(JSON.stringify(this.newSlide));
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });
    this.context.setActiveSlideIndex(this.slideIndex);
  }

  undo(): void {
    this.context.setPresentation((prev) => {
      const nextSlides = [...prev.slides];
      nextSlides[this.slideIndex] = JSON.parse(JSON.stringify(this.prevSlide));
      return { ...prev, slides: nextSlides, updatedAt: new Date().toISOString() };
    });
    this.context.setActiveSlideIndex(this.slideIndex);
  }
}

export class BatchApplyPresentationCommand implements Command {
  readonly name: string;

  constructor(
    private context: EditorContext,
    private prevPresentation: any,
    private newPresentation: any,
    commandName: string = 'IA: Otimizar apresentação'
  ) {
    this.name = commandName;
  }

  execute(): void {
    this.context.setPresentation(() => JSON.parse(JSON.stringify(this.newPresentation)));
  }

  undo(): void {
    this.context.setPresentation(() => JSON.parse(JSON.stringify(this.prevPresentation)));
  }
}

