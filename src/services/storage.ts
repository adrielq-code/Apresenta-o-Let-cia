import { Presentation, EditorSlide, SlideElement } from '../types';
import {
  INITIAL_ORIGINAL_PRESENTATION,
  ALL_INITIAL_TEMPLATES,
  generateElementId,
} from '../data/templates';

const PRESENTATIONS_STORAGE_KEY = 'minhas_apresentacoes_v2';
const TEMPLATES_STORAGE_KEY = 'meus_modelos_v2';

// Generates a short, human-readable code like "PRES-7K4M2" or "AP-8F42K"
export function generatePresentationCode(prefix = 'PRES'): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${result}`;
}

// Generate unique ID
export function generateId(prefix = 'pres'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
}

// Initialize and retrieve all user presentations
export function loadPresentations(): Presentation[] {
  try {
    const raw = localStorage.getItem(PRESENTATIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Erro ao carregar apresentações:', err);
  }

  // First run seeding: Initialize with the original keynote presentation!
  const initial = [INITIAL_ORIGINAL_PRESENTATION];
  saveAllPresentations(initial);
  return initial;
}

// Save all presentations list
export function saveAllPresentations(list: Presentation[]): void {
  try {
    localStorage.setItem(PRESENTATIONS_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Erro ao salvar apresentações no localStorage:', err);
  }
}

// Load templates (both system initial templates + user saved templates)
export function loadTemplates(): Presentation[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Erro ao carregar modelos:', err);
  }

  // Seed default templates
  saveAllTemplates(ALL_INITIAL_TEMPLATES);
  return ALL_INITIAL_TEMPLATES;
}

export function saveAllTemplates(list: Presentation[]): void {
  try {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Erro ao salvar modelos:', err);
  }
}

// Get single presentation by ID
export function getPresentationById(id: string): Presentation | null {
  const list = loadPresentations();
  const found = list.find((p) => p.id === id);
  if (found) return found;

  const templates = loadTemplates();
  const templateFound = templates.find((p) => p.id === id);
  return templateFound || null;
}

// Find presentation by public short code (e.g. "PRES-7K4M2" or "AP-FUTURO")
export function findPresentationByCode(code: string): Presentation | null {
  const clean = code.trim().toUpperCase();
  const all = [...loadPresentations(), ...loadTemplates()];
  return all.find((p) => p.code?.toUpperCase() === clean) || null;
}

// Save / update a presentation (handles autosave)
export function savePresentation(presentation: Presentation): void {
  const list = loadPresentations();
  const updatedPresentation = {
    ...presentation,
    updatedAt: new Date().toISOString(),
  };

  const index = list.findIndex((p) => p.id === presentation.id);
  if (index >= 0) {
    list[index] = updatedPresentation;
  } else {
    list.unshift(updatedPresentation);
  }

  saveAllPresentations(list);

  // If this is also a template, update in templates
  if (presentation.isTemplate) {
    const templates = loadTemplates();
    const tIndex = templates.findIndex((t) => t.id === presentation.id);
    if (tIndex >= 0) {
      templates[tIndex] = updatedPresentation;
    } else {
      templates.unshift(updatedPresentation);
    }
    saveAllTemplates(templates);
  }
}

// Create a new blank presentation
export function createNewPresentation(title = 'Nova Apresentação', format: '16:9' = '16:9'): Presentation {
  const newPres: Presentation = {
    id: generateId('pres'),
    code: generatePresentationCode('PRES'),
    title: title.trim() || 'Nova Apresentação',
    format,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isTemplate: false,
    imageLibrary: [],
    slides: [
      {
        id: generateId('slide'),
        title: 'Capa da Apresentação',
        background: { type: 'color', value: '#FFFFFF' },
        notes: {
          script: 'Apresentação inicial para o público.',
          question: '',
          objective: 'Apresentar tema e orador.',
          suggestedTime: '2 min',
        },
        elements: [
          {
            id: generateElementId('title'),
            type: 'text',
            name: 'Título Principal',
            x: 10,
            y: 30,
            width: 80,
            height: 20,
            rotation: 0,
            zIndex: 1,
            opacity: 1,
            content: title.trim() || 'Título da Apresentação',
            style: {
              fontSize: 52,
              fontFamily: 'serif',
              fontWeight: 'bold',
              color: '#1E293B',
              textAlign: 'center',
            },
          },
          {
            id: generateElementId('sub'),
            type: 'text',
            name: 'Subtítulo',
            x: 15,
            y: 54,
            width: 70,
            height: 12,
            rotation: 0,
            zIndex: 2,
            opacity: 1,
            content: 'Clique para editar este texto ou adicione novos elementos.',
            style: {
              fontSize: 22,
              fontFamily: 'sans',
              color: '#64748B',
              textAlign: 'center',
            },
          },
        ],
      },
    ],
  };

  savePresentation(newPres);
  return newPres;
}

// Duplicate a presentation
export function duplicatePresentation(id: string): Presentation | null {
  const original = getPresentationById(id);
  if (!original) return null;

  // Deep clone slides and regenerate element IDs to prevent reference sharing
  const clonedSlides: EditorSlide[] = original.slides.map((s) => ({
    ...s,
    id: generateId('slide'),
    elements: s.elements.map((el) => ({
      ...el,
      id: generateElementId(el.type),
    })),
  }));

  const duplicated: Presentation = {
    ...original,
    id: generateId('pres'),
    code: generatePresentationCode('PRES'),
    title: `${original.title} — Cópia`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isTemplate: false,
    slides: clonedSlides,
  };

  savePresentation(duplicated);
  return duplicated;
}

// Save a presentation as a reusable template
export function saveAsTemplate(presentationOrId: string | Presentation): Presentation | null {
  const original = typeof presentationOrId === 'string' ? getPresentationById(presentationOrId) : presentationOrId;
  if (!original) return null;

  const templates = loadTemplates();
  const templateCopy: Presentation = {
    ...original,
    id: generateId('template'),
    code: generatePresentationCode('TPL'),
    title: `Modelo — ${original.title.replace(/^Modelo —\s*/, '')}`,
    isTemplate: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slides: original.slides.map((s) => ({
      ...s,
      id: generateId('slide'),
      elements: s.elements.map((el) => ({ ...el, id: generateElementId(el.type) })),
    })),
  };

  templates.unshift(templateCopy);
  saveAllTemplates(templates);
  return templateCopy;
}

// Create a presentation from an existing template (does NOT modify original template)
export function createFromTemplate(templateId: string, customTitle?: string): Presentation | null {
  const templates = loadTemplates();
  const template = templates.find((t) => t.id === templateId) || getPresentationById(templateId);
  if (!template) return null;

  const newPres: Presentation = {
    ...template,
    id: generateId('pres'),
    code: generatePresentationCode('PRES'),
    title: customTitle || template.title.replace(/^Modelo —\s*/, ''),
    isTemplate: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slides: template.slides.map((s) => ({
      ...s,
      id: generateId('slide'),
      elements: s.elements.map((el) => ({ ...el, id: generateElementId(el.type) })),
    })),
  };

  savePresentation(newPres);
  return newPres;
}

// Delete a presentation
export function deletePresentation(id: string): void {
  const list = loadPresentations();
  const filtered = list.filter((p) => p.id !== id);
  saveAllPresentations(filtered);
}

// Import presentation via short code or exported payload
export function importPresentation(input: string): { success: boolean; presentation?: Presentation; message?: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { success: false, message: 'Código ou dados vazios.' };
  }

  // 1. Check if it matches existing code in database/cache
  const existing = findPresentationByCode(trimmed);
  if (existing) {
    // Clone it as a new independent presentation for the user
    const imported = duplicatePresentation(existing.id);
    if (imported) {
      return { success: true, presentation: imported };
    }
  }

  // 2. Try JSON parse if full presentation was shared
  try {
    let jsonStr = trimmed;
    if (trimmed.startsWith('SLIDES_DATA_B64:')) {
      jsonStr = atob(trimmed.replace('SLIDES_DATA_B64:', ''));
    }
    const parsed = JSON.parse(jsonStr);
    if (parsed && parsed.slides && Array.isArray(parsed.slides)) {
      const imported: Presentation = {
        ...parsed,
        id: generateId('pres'),
        code: generatePresentationCode('PRES'),
        title: `${parsed.title || 'Apresentação Importada'} (Importada)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isTemplate: false,
      };
      savePresentation(imported);
      return { success: true, presentation: imported };
    }
  } catch {
    // Not JSON
  }

  return { success: false, message: 'Apresentação não encontrada para este código.' };
}

// Export presentation package string
export function exportPresentationPackage(presentation: Presentation): string {
  try {
    return 'SLIDES_DATA_B64:' + btoa(unescape(encodeURIComponent(JSON.stringify(presentation))));
  } catch {
    return JSON.stringify(presentation);
  }
}
