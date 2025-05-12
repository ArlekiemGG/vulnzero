
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import LeaderboardTable, { LeaderboardUser } from '@/components/leaderboard/LeaderboardTable';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy } from 'lucide-react';

// Mock data para estadísticas de usuario
const userStats = {
  level: 7,
  points: 3450,
  pointsToNextLevel: 550,
  progress: 70,
  rank: 42,
  solvedMachines: 15,
  completedChallenges: 8,
};

// Mock data para usuarios del leaderboard
const globalLeaderboardUsers: LeaderboardUser[] = [
  {
    id: "user1",
    rank: 1,
    username: "HackerMaster",
    avatar: "https://i.pravatar.cc/100?img=1",
    points: 9850,
    level: 25,
    solvedMachines: 98,
    rankChange: "same",
  },
  {
    id: "user2",
    rank: 2,
    username: "CyberNinja",
    avatar: "https://i.pravatar.cc/100?img=2",
    points: 9320,
    level: 24,
    solvedMachines: 94,
    rankChange: "up",
    changeAmount: 1,
  },
  {
    id: "user3",
    rank: 3,
    username: "SecureDragon",
    avatar: "https://i.pravatar.cc/100?img=3",
    points: 8950,
    level: 23,
    solvedMachines: 89,
    rankChange: "down",
    changeAmount: 1,
  },
  {
    id: "user4",
    rank: 4,
    username: "Pentester01",
    avatar: "https://i.pravatar.cc/100?img=4",
    points: 8705,
    level: 22,
    solvedMachines: 85,
    rankChange: "up",
    changeAmount: 2,
  },
  {
    id: "user5",
    rank: 5,
    username: "RootGuru",
    avatar: "https://i.pravatar.cc/100?img=5",
    points: 8520,
    level: 22,
    solvedMachines: 82,
    rankChange: "same",
  },
  {
    id: "user42",
    rank: 42,
    username: "YourUsername",
    avatar: "",
    points: 3450,
    level: 7,
    solvedMachines: 15,
    rankChange: "up",
    changeAmount: 3,
    isCurrentUser: true,
  },
];

// Leaderboard mensual
const monthlyLeaderboardUsers: LeaderboardUser[] = [
  {
    id: "user4",
    rank: 1,
    username: "Pentester01",
    avatar: "https://i.pravatar.cc/100?img=4",
    points: 1250,
    level: 22,
    solvedMachines: 85,
    rankChange: "up",
    changeAmount: 1,
  },
  {
    id: "user3",
    rank: 2,
    username: "SecureDragon",
    avatar: "https://i.pravatar.cc/100?img=3",
    points: 980,
    level: 23,
    solvedMachines: 89,
    rankChange: "down",
    changeAmount: 1,
  },
  {
    id: "user1",
    rank: 3,
    username: "HackerMaster",
    avatar: "https://i.pravatar.cc/100?img=1",
    points: 920,
    level: 25,
    solvedMachines: 98,
    rankChange: "same",
  },
  {
    id: "user5",
    rank: 4,
    username: "RootGuru",
    avatar: "https://i.pravatar.cc/100?img=5",
    points: 845,
    level: 22,
    solvedMachines: 82,
    rankChange: "up",
    changeAmount: 3,
  },
  {
    id: "user2",
    rank: 5,
    username: "CyberNinja",
    avatar: "https://i.pravatar.cc/100?img=2",
    points: 820,
    level: 24,
    solvedMachines: 94,
    rankChange: "down",
    changeAmount: 2,
  },
  {
    id: "user42",
    rank: 8,
    username: "YourUsername",
    avatar: "",
    points: 685,
    level: 7,
    solvedMachines: 15,
    rankChange: "up",
    changeAmount: 5,
    isCurrentUser: true,
  },
];

// Leaderboard semanal
const weeklyLeaderboardUsers: LeaderboardUser[] = [
  {
    id: "user42",
    rank: 1,
    username: "YourUsername",
    avatar: "",
    points: 320,
    level: 7,
    solvedMachines: 15,
    rankChange: "up",
    changeAmount: 5,
    isCurrentUser: true,
  },
  {
    id: "user3",
    rank: 2,
    username: "SecureDragon",
    avatar: "https://i.pravatar.cc/100?img=3",
    points: 290,
    level: 23,
    solvedMachines: 89,
    rankChange: "up",
    changeAmount: 3,
  },
  {
    id: "user5",
    rank: 3,
    username: "RootGuru",
    avatar: "https://i.pravatar.cc/100?img=5",
    points: 275,
    level: 22,
    solvedMachines: 82,
    rankChange: "down",
    changeAmount: 1,
  },
  {
    id: "user1",
    rank: 4,
    username: "HackerMaster",
    avatar: "https://i.pravatar.cc/100?img=1",
    points: 260,
    level: 25,
    solvedMachines: 98,
    rankChange: "down",
    changeAmount: 2,
  },
  {
    id: "user4",
    rank: 5,
    username: "Pentester01",
    avatar: "https://i.pravatar.cc/100?img=4",
    points: 210,
    level: 22,
    solvedMachines: 85,
    rankChange: "same",
  }
];

const Leaderboard = () => {
  const [selectedRegion, setSelectedRegion] = useState("global");

  return (
    <div className="min-h-screen bg-cybersec-black">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar userStats={userStats} />
        <main className="flex-1 md:ml-64 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <header className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-cybersec-neongreen mb-2">
                  Leaderboard
                </h1>
                <p className="text-gray-400">
                  Compite con otros hackers por los primeros puestos
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-[160px] bg-cybersec-darkgray border-cybersec-darkgray text-cybersec-neongreen">
                    <SelectValue placeholder="Seleccionar región" />
                  </SelectTrigger>
                  <SelectContent className="bg-cybersec-darkgray border-cybersec-darkgray">
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="europe">Europa</SelectItem>
                    <SelectItem value="america">América</SelectItem>
                    <SelectItem value="asia">Asia</SelectItem>
                    <SelectItem value="oceania">Oceanía</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="border-cybersec-neongreen text-cybersec-neongreen">
                  Mi posición
                </Button>
              </div>
            </header>

            <div className="mb-8">
              <Card className="bg-cybersec-darkgray border-cybersec-darkgray">
                <CardHeader className="pb-3">
                  <CardTitle className="text-cybersec-neongreen">Top 3 Hackers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {globalLeaderboardUsers.slice(0, 3).map((user, index) => (
                      <Card key={user.id} className={`bg-cybersec-black ${
                        index === 0 ? 'border-cybersec-yellow' : 
                        index === 1 ? 'border-gray-400' : 
                        'border-cybersec-red'
                      }`}>
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center text-center">
                            <div className="mb-4">
                              <div className={`relative p-1 rounded-full ${
                                index === 0 ? 'bg-cybersec-yellow/20 border border-cybersec-yellow' : 
                                index === 1 ? 'bg-gray-500/20 border border-gray-400' : 
                                'bg-cybersec-red/20 border border-cybersec-red'
                              }`}>
                                <div className="w-20 h-20 rounded-full overflow-hidden">
                                  <img 
                                    src={user.avatar || "/placeholder.svg"}
                                    alt={user.username}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center ${
                                  index === 0 ? 'bg-cybersec-yellow text-black' : 
                                  index === 1 ? 'bg-gray-400 text-black' : 
                                  'bg-cybersec-red text-black'
                                }`}>
                                  {index + 1}
                                </div>
                              </div>
                            </div>
                            
                            <h3 className="text-lg font-bold text-white mb-1">{user.username}</h3>
                            
                            <div className={`mb-2 ${
                              index === 0 ? 'text-cybersec-yellow' : 
                              index === 1 ? 'text-gray-400' : 
                              'text-cybersec-red'
                            }`}>
                              <span className="font-mono font-bold">{user.points} pts</span>
                            </div>
                            
                            <div className="flex justify-center gap-3 text-sm text-gray-400">
                              <div className="flex items-center">
                                <Trophy className="h-3.5 w-3.5 mr-1.5 text-cybersec-electricblue" />
                                Nivel {user.level}
                              </div>
                              <div>{user.solvedMachines} máquinas</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="global">
              <TabsList className="bg-cybersec-darkgray mb-6">
                <TabsTrigger value="global" className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen">
                  Global
                </TabsTrigger>
                <TabsTrigger value="monthly" className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen">
                  Mensual
                </TabsTrigger>
                <TabsTrigger value="weekly" className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen">
                  Semanal
                </TabsTrigger>
              </TabsList>

              <TabsContent value="global">
                <LeaderboardTable users={globalLeaderboardUsers} currentPeriod="Global" />
              </TabsContent>
              
              <TabsContent value="monthly">
                <LeaderboardTable users={monthlyLeaderboardUsers} currentPeriod="Mayo 2023" />
              </TabsContent>
              
              <TabsContent value="weekly">
                <LeaderboardTable users={weeklyLeaderboardUsers} currentPeriod="15-22 Mayo 2023" />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Leaderboard;
