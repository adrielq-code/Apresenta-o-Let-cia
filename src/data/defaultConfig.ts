import { SpeakerConfig, TimelineMilestone } from '../types';

export const DEFAULT_SPEAKER_CONFIG: SpeakerConfig = {
  speakerName: '[Nome da Farmacêutica]',
  speakerRole: 'Farmacêutica Esteta & Empreendedora',
  clinicName: '[Sua Clínica de Estética]',
  instagram: '@[seu.instagram]',
  college: '[Sua Faculdade de Graduação]',
  graduationYear: '[Ano de Formação]',
  customExperienceText: 'Na minha trajetória, percebi que o retorno financeiro e a realização profissional vieram depois de dominar a técnica, aprender gestão de verdade e colocar a saúde e a autoestima das pessoas em primeiro lugar.',
  timelinePhotos: {
    highSchool: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    decision: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    college: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
    graduation: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    specialization: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=800&q=80',
    aesthetics: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
    clinic: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
    entrepreneurship: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
  },
};

export const TIMELINE_MILESTONES: TimelineMilestone[] = [
  {
    id: 'highSchool',
    stepNumber: 1,
    label: 'Ensino Médio',
    subtitle: 'Dúvidas & Expectativas',
    description: 'Sentada na carteira com 16-17 anos, sem ter certeza absoluta do futuro.',
    defaultImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    customImageKey: 'highSchool',
  },
  {
    id: 'decision',
    stepNumber: 2,
    label: 'Escolha da Farmácia',
    subtitle: 'O Primeiro Passo',
    description: 'Atraída pela ciência, química, biologia e o cuidado com a saúde humana.',
    defaultImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    customImageKey: 'decision',
  },
  {
    id: 'college',
    stepNumber: 3,
    label: 'Faculdade',
    subtitle: 'Mergulho na Ciência',
    description: 'Laboratórios, farmacologia, fórmulas, bioquímica e horas de dedicação.',
    defaultImage: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
    customImageKey: 'college',
  },
  {
    id: 'graduation',
    stepNumber: 4,
    label: 'Formação',
    subtitle: 'O Diploma na Mão',
    description: 'Sensação de vitória, mas também a pergunta: "E agora no mercado de trabalho?".',
    defaultImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    customImageKey: 'graduation',
  },
  {
    id: 'specialization',
    stepNumber: 5,
    label: 'Especialização',
    subtitle: 'Refinando o Olhar',
    description: 'Pós-graduação e aperfeiçoamento contínuo em cosmetologia e procedimentos.',
    defaultImage: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=800&q=80',
    customImageKey: 'specialization',
  },
  {
    id: 'aesthetics',
    stepNumber: 6,
    label: 'Estética',
    subtitle: 'A Paixão Descoberta',
    description: 'A união da precisão farmacêutica com o resgate da autoestima de pessoas.',
    defaultImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
    customImageKey: 'aesthetics',
  },
  {
    id: 'clinic',
    stepNumber: 7,
    label: 'Clínica',
    subtitle: 'O Espaço Físico',
    description: 'Transformar conhecimento em um ambiente acolhedor e seguro para pacientes.',
    defaultImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
    customImageKey: 'clinic',
  },
  {
    id: 'entrepreneurship',
    stepNumber: 8,
    label: 'Empreendedorismo',
    subtitle: 'O Negócio Real',
    description: 'Liderar equipe, gerir finanças, marketing e construir autoridade sólida.',
    defaultImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
    customImageKey: 'entrepreneurship',
  },
];

const STORAGE_KEY = 'escolhendo_meu_futuro_speaker_config_v1';

export function loadSpeakerConfig(): SpeakerConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SPEAKER_CONFIG,
        ...parsed,
        timelinePhotos: {
          ...DEFAULT_SPEAKER_CONFIG.timelinePhotos,
          ...(parsed.timelinePhotos || {}),
        },
      };
    }
  } catch (e) {
    console.error('Failed to load speaker config from localStorage', e);
  }
  return DEFAULT_SPEAKER_CONFIG;
}

export function saveSpeakerConfig(config: SpeakerConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save speaker config to localStorage', e);
  }
}
