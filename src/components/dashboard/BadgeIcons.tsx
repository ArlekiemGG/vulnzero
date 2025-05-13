
import React from 'react';
import { Trophy, Database, Flag, Code, Shield, User, Activity, Heart, Star } from 'lucide-react';

export type BadgeIcon = 
  | 'trophy' 
  | 'database' 
  | 'flag' 
  | 'code' 
  | 'shield' 
  | 'user' 
  | 'activity' 
  | 'heart'
  | 'star';

export const getBadgeIcon = (iconName: string): React.ReactNode => {
  switch (iconName) {
    case 'trophy':
      return <Trophy className="h-5 w-5 text-green-400" />;
    case 'database':
      return <Database className="h-5 w-5 text-blue-400" />;
    case 'flag':
      return <Flag className="h-5 w-5 text-amber-400" />;
    case 'code':
      return <Code className="h-5 w-5 text-purple-400" />;
    case 'shield':
      return <Shield className="h-5 w-5 text-cybersec-electricblue" />;
    case 'user':
      return <User className="h-5 w-5 text-gray-400" />;
    case 'activity':
      return <Activity className="h-5 w-5 text-red-400" />;
    case 'heart':
      return <Heart className="h-5 w-5 text-pink-400" />;
    case 'star':
      return <Star className="h-5 w-5 text-yellow-400" />;
    default:
      return <Trophy className="h-5 w-5 text-green-400" />;
  }
};
