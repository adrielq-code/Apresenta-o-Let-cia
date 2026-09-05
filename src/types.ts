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
  locked?: boolean; // When true, AI and canvas drag protect this element from edits
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

export interface VisualIdentity {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  headingFont: 'Playfair Display, serif' | 'Montserrat, sans-serif' | string;
  bodyFont: 'Montserrat, sans-serif' | 'Playfair Display, serif' | string;
  cardStyle?: 'minimal' | 'rounded' | 'bordered';
  imageStyle?: 'rounded' | 'sharp' | 'shadow';
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
  visualIdentity?: VisualIdentity;
}

export type AppView = 'dashboard' | 'editor' | 'present';

// ==========================================
// AI ASSISTANT TYPES
// ==========================================

export interface AIAssistantAction {
  id: string;
  timestamp: string;
  type: 'edit-slide' | 'create-slide' | 'review-presentation' | 'custom';
  description: string;
  slideId?: string | number;
  slideIndex?: number;
  prompt: string;
  previousSlideState?: EditorSlide;
}

export interface AIPromptSuggestion {
  label: string;
  prompt: string;
  mode: 'edit' | 'create';
  icon?: string;
}

export interface AISlideReviewItem {
  id: string;
  type: 'text_overflow' | 'contrast' | 'alignment' | 'consistency' | 'layout_density' | 'narrative';
  severity: 'low' | 'medium' | 'high';
  slideIndex: number;
  slideTitle: string;
  description: string;
  recommendation: string;
  suggestedActionName: string;
}

export interface AISettings {
  model: string;
  temperature: number; // 0.2 (precise) to 0.8 (creative)
  language: string;
  preserveLocked: boolean;
  stylePreset: 'ted_talk' | 'modern_minimal' | 'executive' | 'bold_creative';
}


