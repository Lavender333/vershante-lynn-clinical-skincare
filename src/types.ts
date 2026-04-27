export interface OperatingHours {
  id: string;
  days: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
}

export interface AssessmentData {
  id?: string; // Document ID (assigned by Firestore after creation)
  fullName: string;
  email: string;
  age: string;
  concerns: string[];
  sensitivityLevel: 'Low' | 'Medium' | 'High';
  hormonalStage: 'Standard' | 'Post-Partum' | 'Perimenopause' | 'Menopause' | 'Post-Menopause';
  stressLevel: number; // 1-10
  sleepQuality: 'Poor' | 'Average' | 'Excellent';
  waterIntake: 'Low' | 'Standard' | 'Optimal';
  dietaryProfile: string[];
  activityLevel: 'Sedentary' | 'Moderate' | 'Active';
  caffeineIntake: 'None' | 'Moderate' | 'High';
  currentRoutine: string;
  professionalHistory: string;
  goals: string;
  investmentPreference: 'The Home Ritual' | 'The Signature Hybrid Flow' | 'The Total Transformation';
  primaryIntent: string;
  clinicalFocus: string[]; // Cortisol & Stress, Postpartum, Menopause, Hyperpigmentation
  stepFeedback?: Record<string, string>;
  clinicalResponse?: string;
  meetingId?: string;
  clinicalInsights?: {
    analysis: string;
    solutions: string[];
    recommendedProducts: string[];
    confidenceScore: number;
  };
  professionalNotes?: string;
  consultationSlot?: {
    id?: string;
    date: string;
    time: string;
    type?: 'Virtual' | 'In-Person';
  };
  status?: 'pending' | 'reviewed' | 'scheduled' | 'completed'; // Assigned by server
  createdAt?: any; // Assigned by Firestore serverTimestamp
}

export interface ConsultationSlot {
  id: string;
  date: string;
  time: string;
  type: 'Virtual' | 'In-Person';
  available: boolean;
}

export interface BookingData {
  assessmentId: string;
  slotId: string;
  type: 'Virtual' | 'In-Person';
}
