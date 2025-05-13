
import { toast } from "@/components/ui/use-toast";

/**
 * Thoroughly cleans up all Supabase auth state from storage
 * This helps prevent auth limbo states and session conflicts
 */
export const cleanupAuthState = () => {
  console.log("Cleaning up auth state...");
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      console.log(`Removing ${key} from localStorage`);
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      console.log(`Removing ${key} from sessionStorage`);
      sessionStorage.removeItem(key);
    }
  });
};

/**
 * Checks password strength with detailed feedback
 */
export const checkPasswordStrength = (password: string): { isStrong: boolean, message: string } => {
  // Check if password is at least 8 characters long
  if (password.length < 8) {
    return { isStrong: false, message: "La contraseña debe tener al menos 8 caracteres" };
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { isStrong: false, message: "La contraseña debe incluir al menos una letra mayúscula" };
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    return { isStrong: false, message: "La contraseña debe incluir al menos una letra minúscula" };
  }

  // Check for number
  if (!/\d/.test(password)) {
    return { isStrong: false, message: "La contraseña debe incluir al menos un número" };
  }

  // Check for special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isStrong: false, message: "La contraseña debe incluir al menos un carácter especial" };
  }

  // Password is strong
  return { isStrong: true, message: "Contraseña segura" };
};

/**
 * Check if a password is commonly used (insecure)
 */
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

/**
 * Process authentication fragments from URL (email confirmations, password resets)
 */
export const handleEmailConfirmation = async (
  supabase: any,
  path: string, 
  hash: string, 
  query: string,
  navigate: (path: string) => void
) => {
  console.log("Checking for auth fragments in URL: path=", path, "hash=", hash, "query=", query);
  
  // Handle email confirmation via access_token
  if (hash && hash.includes('access_token=')) {
    try {
      console.log("Processing email verification");
      
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error during email verification:", error);
        throw error;
      }
      
      if (data.session) {
        toast({
          title: "Email verificado",
          description: "Tu correo ha sido verificado correctamente. Ahora puedes iniciar sesión.",
          variant: "default"
        });
        
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
  
  // Handle password reset flow
  if (query && query.includes('type=recovery')) {
    console.log("Password reset flow detected");
    navigate(`/auth${query}`);
  }
};

/**
 * Ensures proper auth state before login attempts
 * Helps prevent auth conflicts from multiple sessions
 */
export const prepareForAuth = async (supabase: any) => {
  try {
    // Clean up any existing auth state
    cleanupAuthState();
    
    // Try to sign out globally to clear any existing sessions
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      // Continue even if this fails
      console.warn("Global sign out failed during auth preparation:", err);
    }
    
    return true;
  } catch (err) {
    console.error("Error preparing for authentication:", err);
    return false;
  }
};

/**
 * Safely reloads the application to ensure a clean state
 */
export const safeReload = (path: string = '/') => {
  setTimeout(() => {
    window.location.href = path;
  }, 100);
};
