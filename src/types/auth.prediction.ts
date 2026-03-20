export type RiskLevel = "Low Risk" | "Moderate Risk" | "High Risk";

export interface PredictInput {
  age: number;
  gender: number;               // 0=Male, 1=Female
  marital_status: number;       // 0=Single 1=Married 2=Divorced 3=Widowed
  employment_status: number;    // 0=Employed 1=Unemployed 2=Student 3=Retired
  region: number;               // 0-10
  prev_chronic_conditions: number; // 0=No, 1=Yes
  allergic_reaction: number;    // 0=No, 1=Yes
  receiving_immu0therapy: number;  // 0=No, 1=Yes (backend spelling same)
}

export interface PredictionRecord {
  _id: string;
  userId: string;
  input: PredictInput;
  prediction: 0 | 1;
  risk_level: RiskLevel;
  probability: number;
  confidence: number;
  feature_importance: Record<string, number>;
  createdAt: string;
}

export interface MLResult {
  prediction: 0 | 1;
  risk_level: RiskLevel;
  probability: number;
  confidence: number;
  feature_importance: Record<string, number>;
  timestamp: string;
}

export interface PredictionAPIResponse {
  success: boolean;
  data: {
    prediction: PredictionRecord;
    mlResponse: MLResult;
  };
}

export interface IDoctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  region: number;
  region_name: string;
  phone: string;
  email: string;
  rating: number;
  experience_years: number;
  languages: string[];
  consultation_fee: number;
  chamber_address: string;
  availability: { days: string[]; hours: string };
  qualifications: string[];
  specializations: string[];
}

export interface IDoctorsResponse {
  success: boolean;
  count: number;
  region: number;
  region_name: string;
  risk_level: RiskLevel | string;
  doctors: IDoctor[];
}

export interface PredictionHistoryResponse {
  data: PredictionRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AnalyticsData {
  total: number;
  sideEffectCount: number;
  noSideEffectCount: number;
  avgProbability: number | null;
  avgConfidence: number | null;
  riskLevels: RiskLevel[];
}