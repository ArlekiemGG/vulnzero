
export interface CTF {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  type: string;
  organizer: string;
  difficulty: string;
  registered: boolean;
  challenges: number;
  participants: number;
  maxPoints: number;
  userPoints?: number;
  format: string;
  image: string;
  rank?: number;
  totalParticipants?: number;
  registrationId?: string; // Added to track registration
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  solved: number;
  isCurrentUser?: boolean;
}

export interface CTFSession {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  userPoints: number;
  maxPoints: number;
  format: string;
  type: string;
  image: string;
  challenges: number;
  participants: number;
  difficulty: string;
}

export interface CTFRegistration {
  id: string;
  user_id: string;
  ctf_id: number;
  registered_at: string;
}
