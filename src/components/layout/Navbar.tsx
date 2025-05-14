
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  // Handle sign out without causing redirect loops
  const handleSignOut = async () => {
    closeMenu();
    // Use setTimeout to ensure menu close animation completes
    setTimeout(() => {
      signOut();
    }, 100);
  };

  // Navbar links depend on authentication status
  const navLinks = user 
    ? [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Máquinas', path: '/machines' },
        { name: 'Leaderboard', path: '/leaderboard' },
        { name: 'Desafíos', path: '/challenges' },
      ]
    : [
        { name: 'Inicio', path: '/' },
      ];

  return (
    <nav className="bg-cybersec-black border-b border-cybersec-darkgray fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <Shield className="h-8 w-8 text-cybersec-neongreen mr-2" />
                <span className="text-cybersec-neongreen font-bold text-xl">VulnZero</span>
              </Link>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive(link.path)
                      ? 'border-cybersec-neongreen text-cybersec-neongreen'
                      : 'border-transparent text-gray-300 hover:border-gray-600 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:ml-6 md:flex md:items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.user_metadata.avatar_url} alt={user.email || ""} />
                      <AvatarFallback className="bg-cybersec-electricblue text-cybersec-black">
                        {getInitials(user.email || "")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-cybersec-darkgray border-cybersec-darkgray">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-sm text-cybersec-neongreen">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuItem 
                    className="cursor-pointer text-cybersec-red focus:text-cybersec-red focus:bg-cybersec-black"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="bg-cybersec-neongreen text-cybersec-black hover:bg-cybersec-neongreen/80">
                <Link to="/auth">Iniciar sesión</Link>
              </Button>
            )}
          </div>

          <div className="-mr-2 flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-cybersec-darkgray focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-cybersec-black border-b border-cybersec-darkgray">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive(link.path)
                  ? 'bg-cybersec-darkgray text-cybersec-neongreen'
                  : 'text-gray-300 hover:bg-gray-900 hover:text-white'
              }`}
              onClick={closeMenu}
            >
              {link.name}
            </Link>
          ))}
          {user ? (
            <button
              onClick={handleSignOut}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-cybersec-red hover:bg-gray-900"
            >
              Cerrar sesión
            </button>
          ) : (
            <Link
              to="/auth"
              className="block px-3 py-2 rounded-md text-base font-medium bg-cybersec-neongreen text-cybersec-black"
              onClick={closeMenu}
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
