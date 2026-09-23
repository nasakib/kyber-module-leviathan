import { LevelDefinition, LevelMasteryStatus } from './game';

export type UserRole = 'student' | 'teacher';

export interface UserProfile {
  id: string;
  email?: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
}

export interface CloudUserProgress {
  id?: string;
  userId: string;
  levelId: string;
  completed: boolean;
  stars: number;
  bestAttempts: number;
  masteryStatus: LevelMasteryStatus;
  updatedAt: string;
}

export type LevelDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface CommunityLevel {
  id: string;
  authorId?: string;
  authorName: string;
  title: string;
  sectorId: string;
  description: string;
  levelData: LevelDefinition;
  difficulty: LevelDifficulty;
  upvotes: number;
  playCount: number;
  createdAt: string;
  hasVoted?: boolean;
}

export interface Classroom {
  id: string;
  code: string;
  name: string;
  teacherId: string;
  createdAt: string;
  memberCount?: number;
}

export interface ClassroomMember {
  classroomId: string;
  studentId: string;
  studentName?: string;
  joinedAt: string;
}

export interface Assignment {
  id: string;
  classroomId: string;
  title: string;
  requiredLevelIds: string[];
  dueDate?: string;
  createdAt: string;
  submissionCount?: number;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  completedLevels: string[];
  totalStars: number;
  goldMasteriesCount: number;
  submittedAt: string;
}

export interface SupabaseConfigState {
  url: string;
  anonKey: string;
  isCustom: boolean;
  isConnected: boolean;
}
