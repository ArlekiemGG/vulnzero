
/**
 * Thoroughly cleans up all Supabase auth state from storage
 */
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

/**
 * Checks password strength
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
    'admin', 'welcome', 'letmein', 'monkey', 'abc123'
  ];
  
  return commonPasswords.some(commonPwd => 
    commonPwd.toLowerCase() === password.toLowerCase());
};

/**
 * Process authentication fragments from URL
 */
export const handleEmailConfirmation = async (
  supabase: any,
  path: string, 
  hash: string, 
  query: string,
  navigate: (path: string) => void
) => {
  // Handle email confirmation via access_token
  if (hash && hash.includes('access_token=')) {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (data.session) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Email verification error:", error);
    }
  }
  
  // Handle password reset flow
  if (query && query.includes('type=recovery')) {
    navigate(`/auth${query}`);
  }
};

/**
 * Ensures proper auth state before login attempts
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
