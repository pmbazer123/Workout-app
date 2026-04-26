export type FitnessLevel = 'Recruit' | 'Soldier' | 'Operator'
export type AgeRange = '18-25' | '26-35' | '36-45' | '46+'
export type Goal = 'strength' | 'endurance' | 'weight_loss' | 'conditioning'
export type Equipment = 'none' | 'pull_up_bar' | 'resistance_bands' | 'dumbbells' | 'dip_bars'
export type ExerciseCategory = 'push' | 'pull' | 'core' | 'legs' | 'cardio' | 'full_body'
export type WeekPhase = 'Foundation' | 'Building' | 'Intensity' | 'Peak'
export type DayState = 'locked' | 'today' | 'completed' | 'rest' | 'missed'
export type OnboardingStep = 'welcome' | 'age' | 'fitness' | 'goals' | 'equipment' | 'review'

export interface WorkoutExerciseSlot {
  exerciseId: string
  exerciseName: string
  sets: number
  reps: number | null
  durationSeconds: number | null
  restSeconds: number
  isCompleted: boolean
  completedSets: number
}

export interface ExerciseData {
  id: string
  name: string
  category: ExerciseCategory
  description: string
  musclesTargeted: string[]
  formCues: string[]
  equipment: Equipment[]
  fitnessLevels: FitnessLevel[]
}

export type AchievementType =
  | 'FIRST_MISSION'
  | 'WEEK_1_COMPLETE'
  | 'WEEK_2_COMPLETE'
  | 'WEEK_3_COMPLETE'
  | 'CAMPAIGN_COMPLETE'
  | 'STREAK_3'
  | 'STREAK_7'
  | 'STREAK_14'
  | 'STREAK_28'
  | 'IRON_WILL'
  | 'NO_RETREAT'
  | 'EARLY_BIRD'
  | 'NIGHT_OPS'
  | 'CENTURY'
  | 'ENDURANCE'
  | 'PROMOTION_SOLDIER'
  | 'PROMOTION_OPERATOR'

export interface AchievementMetadata {
  dayNumber?: number
  streak?: number
  totalReps?: number
  durationMinutes?: number
  completedAt?: string
  promotionFrom?: FitnessLevel
}

export interface UserProfileData {
  id: string
  ageRange: AgeRange
  fitnessLevel: FitnessLevel
  goals: Goal[]
  equipment: Equipment[]
  createdAt: Date
  updatedAt: Date
}

export interface ChallengeData {
  id: string
  userId: string
  startDate: Date
  currentDay: number
  isActive: boolean
  streak: number
  completedDays: number
  totalWorkoutDays: number
}

export interface CalendarDayData {
  dayNumber: number
  state: DayState
  isRestDay: boolean
  completedAt?: Date
  weekPhase: WeekPhase
  phaseLabel: string
}

export interface ProgressStats {
  totalWorkoutsCompleted: number
  currentStreak: number
  longestStreak: number
  totalReps: number
  totalMinutes: number
  weeklyData: WeeklyDataPoint[]
  completionRate: number
}

export interface WeeklyDataPoint {
  weekLabel: string
  workoutsCompleted: number
  workoutsTotal: number
  percentage: number
}
