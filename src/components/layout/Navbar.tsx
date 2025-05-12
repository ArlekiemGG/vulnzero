
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, Bell, User, Search, BarChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger, 
} from '@/components/ui/dropdown-menu';

const Navbar: React.FC = () => {
  return (
    <nav className="border-b border-cybersec-darkgray bg-cybersec-black py-3 px-4 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-cybersec-neongreen" />
            <span className="font-bold text-lg text-cybersec-neongreen glitch-text">CyberChallenge</span>
          </Link>

          <div className="hidden md:flex gap-4">
            <Button variant="ghost" asChild>
              <Link to="/dashboard" className="text-cybersec-neongreen hover:text-cybersec-neongreen/80">Dashboard</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/machines" className="text-cybersec-neongreen hover:text-cybersec-neongreen/80">Máquinas</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/leaderboard" className="text-cybersec-neongreen hover:text-cybersec-neongreen/80">Leaderboard</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/challenges" className="text-cybersec-neongreen hover:text-cybersec-neongreen/80">Desafíos</Link>
            </Button>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-cybersec-neongreen" />
            <Input 
              type="text" 
              placeholder="Buscar..." 
              className="bg-cybersec-darkgray w-64 pl-9 border-cybersec-neongreen focus:border-cybersec-neongreen text-cybersec-neongreen" 
            />
          </div>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-cybersec-neongreen" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-cybersec-red"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9 border border-cybersec-neongreen">
                  <AvatarImage src="/placeholder.svg" alt="Avatar" />
                  <AvatarFallback className="bg-cybersec-darkgray text-cybersec-neongreen">UN</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-cybersec-darkgray border-cybersec-neongreen text-cybersec-neongreen" align="end">
              <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-cybersec-neongreen/30" />
              <DropdownMenuItem className="cursor-pointer hover:bg-cybersec-neongreen/10">
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-cybersec-neongreen/10">
                <BarChart className="mr-2 h-4 w-4" />
                <span>Estadísticas</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-cybersec-neongreen/30" />
              <DropdownMenuItem className="cursor-pointer text-cybersec-red hover:bg-cybersec-red/10">
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex md:hidden">
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5 text-cybersec-neongreen" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
