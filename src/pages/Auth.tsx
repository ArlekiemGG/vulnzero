
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, User, Lock, Mail } from 'lucide-react';

const Auth = () => {
  const { user, signIn, signUp } = useAuth();
  
  // Redirect if user is already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-cybersec-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold tracking-tight text-cybersec-neongreen">
              <span className="flex items-center justify-center">
                <Shield className="h-8 w-8 mr-2" />
                CyberChallenge
              </span>
            </h1>
          </Link>
          <p className="text-gray-400 mt-2">Plataforma de aprendizaje en ciberseguridad</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-cybersec-darkgray">
            <TabsTrigger value="login" className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen">
              Iniciar Sesión
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen">
              Registrarse
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <LoginForm onLogin={signIn} />
          </TabsContent>

          <TabsContent value="register">
            <RegisterForm onRegister={signUp} />
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>&copy; 2023 CyberChallenge. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};

const LoginForm = ({ onLogin }: { onLogin: (email: string, password: string) => Promise<void> }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onLogin(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-cybersec-darkgray bg-cybersec-black shadow-xl">
      <CardHeader>
        <CardTitle className="text-cybersec-neongreen">Iniciar Sesión</CardTitle>
        <CardDescription>Ingresa a tu cuenta para continuar</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                className="pl-10 bg-cybersec-darkgray border-cybersec-darkgray"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10 bg-cybersec-darkgray border-cybersec-darkgray"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-cybersec-neongreen text-black hover:bg-cybersec-neongreen/80"
            disabled={isLoading}
          >
            {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const RegisterForm = ({ 
  onRegister 
}: { 
  onRegister: (email: string, password: string, username: string) => Promise<void> 
}) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }
    
    if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setPasswordError('');
    setIsLoading(true);
    
    try {
      await onRegister(email, password, username);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-cybersec-darkgray bg-cybersec-black shadow-xl">
      <CardHeader>
        <CardTitle className="text-cybersec-neongreen">Crear Cuenta</CardTitle>
        <CardDescription>Regístrate para comenzar</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="register-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="register-email"
                type="email"
                placeholder="tu@email.com"
                className="pl-10 bg-cybersec-darkgray border-cybersec-darkgray"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-username">Nombre de Usuario</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="register-username"
                type="text"
                placeholder="hackerman123"
                className="pl-10 bg-cybersec-darkgray border-cybersec-darkgray"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="register-password"
                type="password"
                placeholder="••••••••"
                className="pl-10 bg-cybersec-darkgray border-cybersec-darkgray"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-confirm-password">Confirmar Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="register-confirm-password"
                type="password"
                placeholder="••••••••"
                className="pl-10 bg-cybersec-darkgray border-cybersec-darkgray"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {passwordError && (
              <p className="text-sm text-cybersec-red mt-1">{passwordError}</p>
            )}
          </div>
          <Button 
            type="submit" 
            className="w-full bg-cybersec-neongreen text-black hover:bg-cybersec-neongreen/80"
            disabled={isLoading}
          >
            {isLoading ? 'Cargando...' : 'Registrarse'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-xs text-gray-500 text-center">
        Al registrarte, aceptas nuestros términos de servicio y política de privacidad.
      </CardFooter>
    </Card>
  );
};

export default Auth;
