export interface Prompt {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPublic?: boolean;
  isTemplate?: boolean;
  isFavorite?: boolean;
  copyCount?: number;
  templateUseCount?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  teamId?: string;
  collaborators?: string[]; // Array of user emails or UIDs
  score?: number;
  userVotes?: { [userId: string]: number }; // 1 for upvote, -1 for downvote
  isDraft?: boolean;
}

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  members: string[];
  createdAt?: string | Date;
}

export interface Invitation {
  id: string;
  teamId: string;
  teamName: string;
  email: string;
  inviterId: string;
  inviterName: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt?: string | Date;
}

export interface PromptVersion {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt?: string | Date;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface UserSettings {
  defaultCategory?: string;
  theme?: 'light' | 'dark' | 'system';
}
