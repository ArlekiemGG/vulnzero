
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, User, Lock, Mail, Github, Chrome, ArrowRight, CheckCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Auth = () => {
  const { user, signIn, signUp, signInWithGithub, signInWithGoogle } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('login');
  
  useEffect(() => {
    // Handle password reset from query params
    if (searchParams.get('reset') === 'true') {
      setActiveTab('reset');
      toast({
        title: "Restablecimiento de contraseña",
        description: "Puedes establecer una nueva contraseña ahora.",
      });
    }
    
    // Handle email verification from query params
    if (searchParams.get('verification') === 'true') {
      toast({
        title: "Verifica tu email",
        description: "Por favor, verifica tu correo electrónico para activar tu cuenta.",
      });
    }
    
    // If we have type=recovery in the URL, it's a password reset flow
    if (searchParams.get('type') === 'recovery') {
      setActiveTab('reset');
      toast({
        title: "Restablecimiento de contraseña",
        description: "Por favor, establece una nueva contraseña para tu cuenta.",
      });
    }
  }, [searchParams]);
  
  // Redirect if user is already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Manejador para prevenir cambio de pestaña con la tecla Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevenir el comportamiento por defecto
    }
  };

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

        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full" onKeyDown={handleKeyDown}>
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-cybersec-darkgray">
            <TabsTrigger value="login" className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen">
              Iniciar Sesión
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen">
              Registrarse
            </TabsTrigger>
            <TabsTrigger value="reset" className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen">
              Recuperar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <LoginForm 
              onLogin={signIn} 
              onGithubLogin={signInWithGithub}
              onGoogleLogin={signInWithGoogle}
              onForgotPassword={() => setActiveTab('reset')}
            />
          </TabsContent>

          <TabsContent value="register">
            <RegisterForm 
              onRegister={signUp} 
              onGithubLogin={signInWithGithub}
              onGoogleLogin={signInWithGoogle}
            />
          </TabsContent>
          
          <TabsContent value="reset">
            {searchParams.get('type') === 'recovery' ? (
              <PasswordResetForm />
            ) : (
              <ResetPasswordForm />
            )}
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>&copy; 2023 CyberChallenge. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};

const LoginForm = ({ 
  onLogin, 
  onGithubLogin,
  onGoogleLogin,
  onForgotPassword
}: { 
  onLogin: (email: string, password: string) => Promise<void>;
  onGithubLogin: () => Promise<void>;
  onGoogleLogin: () => Promise<void>;
  onForgotPassword: () => void;
}) => {
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

  // Manejador específico para la tecla Enter en el formulario de login
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <Card className="border-cybersec-darkgray bg-cybersec-black shadow-xl">
      <CardHeader>
        <CardTitle className="text-cybersec-neongreen">Iniciar Sesión</CardTitle>
        <CardDescription>Ingresa a tu cuenta para continuar</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent border-gray-700 hover:bg-gray-800"
              onClick={onGithubLogin}
            >
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent border-gray-700 hover:bg-gray-800"
              onClick={onGoogleLogin}
            >
              <Chrome className="mr-2 h-4 w-4" />
              Google
            </Button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-700"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-cybersec-black px-2 text-gray-500">O continuar con</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4">
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
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Contraseña</Label>
                <Button variant="link" className="p-0 h-auto text-xs text-gray-400" onClick={onForgotPassword}>
                  ¿Olvidaste tu contraseña?
                </Button>
              </div>
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
        </div>
      </CardContent>
    </Card>
  );
};

const RegisterForm = ({ 
  onRegister,
  onGithubLogin,
  onGoogleLogin
}: { 
  onRegister: (email: string, password: string, username: string) => Promise<void>;
  onGithubLogin: () => Promise<void>;
  onGoogleLogin: () => Promise<void>;
}) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

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
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="border-cybersec-darkgray bg-cybersec-black shadow-xl">
        <CardHeader>
          <CardTitle className="text-cybersec-neongreen">Verifica tu correo</CardTitle>
          <CardDescription>Hemos enviado un enlace de confirmación</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-cybersec-darkgray border-cybersec-neongreen">
            <Mail className="h-5 w-5 text-cybersec-neongreen" />
            <AlertTitle>Revisa tu bandeja de entrada</AlertTitle>
            <AlertDescription>
              Hemos enviado un correo de verificación a <strong>{email}</strong>. 
              Por favor, revisa tu bandeja de entrada y haz clic en el enlace de confirmación para activar tu cuenta.
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-sm text-gray-400">
            <p>Si no recibes el correo en unos minutos:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Revisa tu carpeta de spam o correo no deseado</li>
              <li>Verifica que hayas escrito correctamente tu dirección de correo</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-cybersec-darkgray bg-cybersec-black shadow-xl">
      <CardHeader>
        <CardTitle className="text-cybersec-neongreen">Crear Cuenta</CardTitle>
        <CardDescription>Regístrate para comenzar</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent border-gray-700 hover:bg-gray-800"
              onClick={onGithubLogin}
            >
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent border-gray-700 hover:bg-gray-800"
              onClick={onGoogleLogin}
            >
              <Chrome className="mr-2 h-4 w-4" />
              Google
            </Button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-700"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-cybersec-black px-2 text-gray-500">O registrarse con</span>
            </div>
          </div>

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
        </div>
      </CardContent>
      <CardFooter className="text-xs text-gray-500 text-center">
        Al registrarte, aceptas nuestros términos de servicio y política de privacidad.
      </CardFooter>
    </Card>
  );
};

const ResetPasswordForm = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await resetPassword(email);
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="border-cybersec-darkgray bg-cybersec-black shadow-xl">
        <CardHeader>
          <CardTitle className="text-cybersec-neongreen">Correo enviado</CardTitle>
          <CardDescription>Instrucciones para restablecer tu contraseña</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-cybersec-darkgray border-cybersec-neongreen">
            <Mail className="h-5 w-5 text-cybersec-neongreen" />
            <AlertTitle>Revisa tu bandeja de entrada</AlertTitle>
            <AlertDescription>
              Si existe una cuenta asociada a <strong>{email}</strong>, 
              recibirás instrucciones para restablecer tu contraseña.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-cybersec-darkgray bg-cybersec-black shadow-xl">
      <CardHeader>
        <CardTitle className="text-cybersec-neongreen">Recuperar contraseña</CardTitle>
        <CardDescription>Te enviaremos un enlace para restablecer tu contraseña</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="reset-email"
                type="email"
                placeholder="tu@email.com"
                className="pl-10 bg-cybersec-darkgray border-cybersec-darkgray"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-cybersec-neongreen text-black hover:bg-cybersec-neongreen/80"
            disabled={isLoading}
          >
            {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const PasswordResetForm = () => {
  const { updatePassword } = useAuth();
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
    
    setPasswordError('');
    setIsLoading(true);
    
    try {
      await updatePassword(password);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-cybersec-darkgray bg-cybersec-black shadow-xl">
      <CardHeader>
        <CardTitle className="text-cybersec-neongreen">Nueva Contraseña</CardTitle>
        <CardDescription>Establece tu nueva contraseña</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nueva contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="new-password"
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
            <Label htmlFor="confirm-password">Confirmar contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="confirm-password"
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
            {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default Auth;
