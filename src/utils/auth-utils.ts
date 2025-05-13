
import { toast } from "@/components/ui/use-toast";

// Function to clean up auth state
export const cleanupAuthState = () => {
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

// Password strength checker
export const checkPasswordStrength = (password: string): { isStrong: boolean, message: string } => {
  // Check if password is at least 8 characters long
  if (password.length < 8) {
    return { isStrong: false, message: "La contraseña debe tener al menos 8 caracteres" };
  }

  // Check if password has at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { isStrong: false, message: "La contraseña debe incluir al menos una letra mayúscula" };
  }

  // Check if password has at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { isStrong: false, message: "La contraseña debe incluir al menos una letra minúscula" };
  }

  // Check if password has at least one number
  if (!/\d/.test(password)) {
    return { isStrong: false, message: "La contraseña debe incluir al menos un número" };
  }

  // Check if password has at least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isStrong: false, message: "La contraseña debe incluir al menos un carácter especial" };
  }

  // Password is strong
  return { isStrong: true, message: "Contraseña segura" };
};

// Check for common passwords
export const isCommonPassword = (password: string): boolean => {
  const commonPasswords = [
    'password', 'password123', '123456', '123456789', 'qwerty', 
    'admin', 'welcome', 'letmein', 'monkey', 'abc123', 
    'iloveyou', '1234567', '1234567890', 'password1', '12345678',
    'baseball', 'football', 'superman', 'starwars', 'jennifer',
    'michael', 'shadow', 'batman', 'dragon', 'master'
  ];
  
  return commonPasswords.some(commonPwd => 
    commonPwd.toLowerCase() === password.toLowerCase());
};

// Handle email confirmation from URL
export const handleEmailConfirmation = async (
  supabase: any,
  path: string, 
  hash: string, 
  query: string,
  navigate: (path: string) => void
) => {
  // Check if we have an access_token in the URL (email confirmation)
  if (hash && hash.includes('access_token=')) {
    try {
      // The hash contains the access_token which Supabase will handle automatically
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (data.session) {
        toast({
          title: "Email verificado",
          description: "Tu correo ha sido verificado correctamente. Ahora puedes iniciar sesión.",
          variant: "default"
        });
        
        // Redirect to dashboard if user is confirmed
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error("Email verification error:", error);
      toast({
        title: "Error de verificación",
        description: "No se pudo verificar tu correo electrónico. Por favor, intenta iniciar sesión o solicita un nuevo enlace de verificación.",
        variant: "destructive"
      });
    }
  }
  
  // Check for password reset flow
  if (query && query.includes('type=recovery')) {
    // Redirect to reset password page maintaining the query parameters
    navigate(`/auth${query}`);
  }
};
