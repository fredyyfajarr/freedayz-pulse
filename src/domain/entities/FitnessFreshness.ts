export type FormStatus = 
  | 'peaking'        // TSB +15 to +25 (Ready for race day, rested & sharp)
  | 'fresh'          // TSB +5 to +15 (Very good recovery, low fatigue)
  | 'optimal'        // TSB -10 to +5 (Sweet spot for progressive overload & training adaptation)
  | 'fatigued'       // TSB -25 to -10 (Heavy training phase, needs planned recovery)
  | 'overreaching'   // TSB < -25 (Risk of burnout or overtraining injury)
  | 'transition';    // TSB > +25 (Detraining, lack of stimuli)

export interface DailyPMCPoint {
  dateStr: string; // YYYY-MM-DD
  date: Date;
  dailyTrimp: number;
  ctl: number; // Chronic Training Load (Fitness - 42 days exponential moving average)
  atl: number; // Acute Training Load (Fatigue - 7 days exponential moving average)
  tsb: number; // Training Stress Balance (Form = CTL - ATL)
  status: FormStatus;
  statusLabel: string;
  activitiesCount: number;
  totalDistanceMeters: number;
}

export interface FitnessSummary {
  currentFitness: number; // Current CTL
  currentFatigue: number; // Current ATL
  currentForm: number;    // Current TSB
  currentStatus: FormStatus;
  statusDescription: string;
  sevenDayDistanceKm: number;
  sevenDayTrimp: number;
  history: DailyPMCPoint[];
}
