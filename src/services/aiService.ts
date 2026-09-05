import {
  EditorSlide,
  Presentation,
  VisualIdentity,
  AISlideReviewItem,
  AISettings,
} from '../types';

export interface EditSlideResponse {
  explanation: string;
  actionsTaken: string[];
  updatedSlide: EditorSlide;
}

export interface CreateSlideResponse {
  explanation: string;
  newSlide: EditorSlide;
}

export interface GeneratePresentationResponse {
  title: string;
  description: string;
  visualIdentity: VisualIdentity;
  slides: EditorSlide[];
}

export interface ReviewPresentationResponse {
  summary: string;
  overallScore: number;
  reviewItems: AISlideReviewItem[];
}

export interface DetectIdentityResponse {
  visualIdentity: VisualIdentity;
  summary: string;
}

export interface ChatResponse {
  reply: string;
}

export const defaultAISettings: AISettings = {
  model: 'gemini-3.8-flash',
  temperature: 0.5,
  language: 'pt-BR',
  preserveLocked: true,
  stylePreset: 'ted_talk',
};

// ----------------------------------------------------------------------
// 1. Edit current slide with AI
// ----------------------------------------------------------------------
export async function editSlideWithAI(params: {
  prompt: string;
  slide: EditorSlide;
  presentationContext: {
    presentationTitle: string;
    slideIndex: number;
    totalSlides: number;
    previousSlide?: { title: string; subtitle?: string };
    nextSlide?: { title: string; subtitle?: string };
    visualIdentity?: VisualIdentity;
  };
  settings?: Partial<AISettings>;
}): Promise<EditSlideResponse> {
  const response = await fetch('/api/ai/edit-slide', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Erro ao editar slide com IA');
  }

  return response.json();
}

// ----------------------------------------------------------------------
// 2. Create new slide with AI
// ----------------------------------------------------------------------
export async function createSlideWithAI(params: {
  prompt: string;
  slideType: string;
  afterSlideIndex: number;
  presentationContext: {
    presentationTitle: string;
    totalSlides: number;
    currentSlide?: { title: string };
    visualIdentity?: VisualIdentity;
  };
  settings?: Partial<AISettings>;
}): Promise<CreateSlideResponse> {
  const response = await fetch('/api/ai/create-slide', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Erro ao criar slide com IA');
  }

  return response.json();
}

// ----------------------------------------------------------------------
// 3. Generate complete presentation with AI
// ----------------------------------------------------------------------
export async function generatePresentationWithAI(params: {
  prompt: string;
  slideCount?: number;
  tone?: string;
  targetAudience?: string;
}): Promise<GeneratePresentationResponse> {
  const response = await fetch('/api/ai/generate-presentation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Erro ao gerar apresentação com IA');
  }

  return response.json();
}

// ----------------------------------------------------------------------
// 4. Review entire presentation
// ----------------------------------------------------------------------
export async function reviewPresentationWithAI(
  presentation: Presentation
): Promise<ReviewPresentationResponse> {
  const response = await fetch('/api/ai/review-presentation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ presentation }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Erro ao analisar apresentação');
  }

  return response.json();
}

// ----------------------------------------------------------------------
// 5. Detect Visual Identity
// ----------------------------------------------------------------------
export async function detectIdentityWithAI(
  presentation: Presentation
): Promise<DetectIdentityResponse> {
  const response = await fetch('/api/ai/detect-identity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ presentation }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Erro ao detectar identidade visual');
  }

  return response.json();
}

// ----------------------------------------------------------------------
// 6. Chat with Copilot
// ----------------------------------------------------------------------
export async function chatWithAICopilot(params: {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  slideContext: {
    title: string;
    elementsCount: number;
    slideIndex: number;
  };
}): Promise<ChatResponse> {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Erro na conversa com o copiloto');
  }

  return response.json();
}
