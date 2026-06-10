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
  preferredName: string;
  dob: string;
  phoneNumber: string;
  email: string;
  referralSource: string;
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
  morningRoutine: string;
  eveningRoutine: string;
  routineDuration: string;
  productChangeFrequency: string;
  productReactions: string;
  professionalHistory: string;
  skinHistorySummary: string;
  treatmentsTried: string;
  temporaryHelp: string;
  worsenedBy: string;
  recurringCycles: string;
  supplements: string;
  exerciseHabits: string;
  lifestyleFactors: string;
  hormonalImbalance: boolean;
  pcos: boolean;
  fibroids: boolean;
  thyroidImbalance: boolean;
  insulinResistance: boolean;
  eczemaPsoriasis: boolean;
  digestiveConcerns: boolean;
  currentMedications: string;
  treatmentHistory: string[];
  previousReactions: string;
  desiredOutcome: string;
  topGoals: string;
  commitmentLevel: 'Ready' | 'Curious' | 'Committed' | '';
  opennessToCorrectiveCare: 'Yes' | 'Maybe' | 'Prefer guidance' | '';
  frontPhotoNotes: string;
  leftPhotoNotes: string;
  rightPhotoNotes: string;
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
  professionalPrimaryConcerns?: string;
  professionalSkinBehavior?: string;
  professionalBarrierStatus?: string;
  professionalInflammationLevel?: string;
  professionalPigmentClassification?: string;
  professionalTriggerPatterns?: string;
  professionalRecommendedTreatmentPathway?: string;
  professionalRecommendedHomecare?: string;
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
