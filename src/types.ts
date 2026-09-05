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
