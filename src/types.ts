export interface PresenterNote {
  script: string;
  question: string;
  objective: string;
  suggestedTime: string;
  tips?: string;
}

export interface TimelineMilestone {
  id: string;
  stepNumber: number;
  label: string;
  subtitle: string;
  description: string;
  defaultImage: string;
  customImageKey: string;
}

export interface SlideData {
  id: number;
  title: string;
  subtitle?: string;
  category: 'Abertura' | 'Interação' | 'História' | 'Profissão' | 'Estética' | 'Empreendedorismo' | 'Realidade' | 'Escolha' | 'Dinâmica' | 'Reflexão' | 'Encerramento';
  notes: PresenterNote;
}

export interface SpeakerConfig {
  speakerName: string;
  speakerRole: string;
  clinicName: string;
  instagram: string;
  college: string;
  graduationYear: string;
  customExperienceText?: string;
  timelinePhotos: {
    highSchool?: string;
    decision?: string;
    college?: string;
    graduation?: string;
    specialization?: string;
    aesthetics?: string;
    clinic?: string;
    entrepreneurship?: string;
  };
}

// ==========================================
// VISUAL SLIDE EDITOR & PRESENTATION TYPES
// ==========================================

export type SlideElementType =
  | 'text'
  | 'image'
  | 'shape'
  | 'line'
  | 'number'
  | 'quote'
  | 'icon';

export interface SlideElementStyle {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  textAlign?: 'left' | 'center' | 'right';
  textTransform?: 'none' | 'uppercase' | 'lowercase';
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  lineHeight?: number;
  letterSpacing?: number;
  objectFit?: 'cover' | 'contain' | 'fill';
  shapeType?: 'rectangle' | 'circle' | 'rounded-box' | 'line' | 'divider';
  shadow?: boolean;
}

export interface SlideElement {
  id: string;
  type: SlideElementType;
  name?: string;
  x: number; // percentage 0 - 100 relative to 1920x1080 canvas
  y: number; // percentage 0 - 100
  width: number; // percentage 0 - 100
  height: number; // percentage 0 - 100
  rotation?: number; // degrees
  zIndex: number;
  opacity?: number; // 0 - 1
  content: string; // text string, image URL, quote author, or number label
  secondaryContent?: string; // quote body, number caption, or icon name
  style: SlideElementStyle;
  animation?: 'fade' | 'slide-up' | 'scale' | 'none';
}

export interface SlideBackground {
  type: 'color' | 'gradient' | 'image';
  value: string;
  fit?: 'cover' | 'contain' | 'fill';
  opacity?: number;
}

export interface EditorSlide {
  id: string | number;
  title: string;
  subtitle?: string;
  background: SlideBackground;
  elements: SlideElement[];
  notes: PresenterNote;
  transition?: 'slide' | 'fade' | 'zoom' | 'none';
  nativeSlideId?: number; // Linked to original 24 keynote slides if applicable
}

export interface Presentation {
  id: string;
  code: string; // short unique code e.g. "PRES-7K4M2"
  title: string;
  description?: string;
  format: '16:9';
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  isTemplate: boolean;
  slides: EditorSlide[];
  speakerConfig?: SpeakerConfig;
  imageLibrary?: string[];
}

export type AppView = 'dashboard' | 'editor' | 'present';

