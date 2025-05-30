
import React from 'react';
import { 
  Trophy, 
  ArrowUp,
  ArrowDown,
  Minus,
  Shield
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from "@/components/ui/skeleton";

export interface LeaderboardUser {
  id: string;
  rank: number;
  username: string;
  avatar?: string;
  points: number;
  level: number;
  solvedMachines: number;
  rankChange: 'up' | 'down' | 'same';
  changeAmount?: number;
  isCurrentUser?: boolean;
}

interface LeaderboardTableProps {
  users: LeaderboardUser[];
  currentPeriod: string;
  isLoading?: boolean;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  users,
  currentPeriod,
  isLoading = false,
}) => {
  const getRankChangeIcon = (change: 'up' | 'down' | 'same', amount?: number) => {
    switch (change) {
      case 'up':
        return (
          <span className="flex items-center text-green-500">
            <ArrowUp className="h-4 w-4 mr-1" />
            {amount && amount}
          </span>
        );
      case 'down':
        return (
          <span className="flex items-center text-red-500">
            <ArrowDown className="h-4 w-4 mr-1" />
            {amount && amount}
          </span>
        );
      default:
        return (
          <span className="flex items-center text-gray-500">
            <Minus className="h-4 w-4" />
          </span>
        );
    }
  };

  const getTrophyForRank = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-cybersec-yellow" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-300" />;
      case 3:
        return <Trophy className="h-5 w-5 text-cybersec-red" />;
      default:
        return rank;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full overflow-hidden rounded-lg border border-cybersec-darkgray">
        <Table>
          <TableHeader className="bg-cybersec-darkgray">
            <TableRow>
              <TableHead className="w-12 text-cybersec-neongreen">Rank</TableHead>
              <TableHead className="text-cybersec-neongreen">Usuario</TableHead>
              <TableHead className="text-cybersec-neongreen">Nivel</TableHead>
              <TableHead className="text-right text-cybersec-neongreen">Máquinas</TableHead>
              <TableHead className="text-right text-cybersec-neongreen">Puntos</TableHead>
              <TableHead className="text-right text-cybersec-neongreen w-24">Cambio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-6 w-6" /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-6 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="w-full overflow-hidden rounded-lg border border-cybersec-darkgray">
        <div className="p-8 text-center">
          <p className="text-gray-400 mb-2">No hay datos disponibles para este período</p>
          <p className="text-xs text-gray-500">
            Los datos aparecerán automáticamente cuando haya usuarios en el sistema.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-cybersec-darkgray">
      <Table>
        <TableHeader className="bg-cybersec-darkgray">
          <TableRow>
            <TableHead className="w-12 text-cybersec-neongreen">Rank</TableHead>
            <TableHead className="text-cybersec-neongreen">Usuario</TableHead>
            <TableHead className="text-cybersec-neongreen">Nivel</TableHead>
            <TableHead className="text-right text-cybersec-neongreen">Máquinas</TableHead>
            <TableHead className="text-right text-cybersec-neongreen">Puntos</TableHead>
            <TableHead className="text-right text-cybersec-neongreen w-24">Cambio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow 
              key={user.id}
              id={user.isCurrentUser ? 'current-user-row' : undefined}
              className={
                user.isCurrentUser 
                  ? "bg-cybersec-neongreen/10 hover:bg-cybersec-neongreen/20" 
                  : "hover:bg-cybersec-darkgray/50"
              }
            >
              <TableCell className="font-medium">
                {getTrophyForRank(user.rank)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 border border-cybersec-darkgray">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-cybersec-black text-cybersec-neongreen">
                      {user.username ? user.username.substring(0, 2).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="font-medium">{user.username || "Usuario"}</div>
                  {user.isCurrentUser && (
                    <Badge variant="outline" className="ml-2 border-cybersec-neongreen text-cybersec-neongreen text-xs">
                      Tú
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-1.5 text-cybersec-electricblue" />
                  {user.level}
                </div>
              </TableCell>
              <TableCell className="text-right">{user.solvedMachines}</TableCell>
              <TableCell className="text-right font-mono font-bold text-cybersec-neongreen">
                {user.points}
              </TableCell>
              <TableCell className="text-right">
                {getRankChangeIcon(user.rankChange, user.changeAmount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeaderboardTable;
