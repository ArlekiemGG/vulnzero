
// API configuration constants
const EXTERNAL_API_URL = window.location.hostname.includes("localhost") 
  ? "http://localhost:5000"  // Local development
  : window.location.hostname.includes("lovableproject.com")
    ? "https://locviruzkdfnhusfquuc-machine-api.lovableproject.com" // Lovable preview environment
    : "https://api.vulnzero.es"; // Production with custom domain

// Timeout for API requests (ms)
const API_TIMEOUT = 15000;

// Utility function to handle fetch timeout
const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    console.log(`Enviando solicitud a: ${url}`, options);
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(id);
    return response;
  } catch (error) {
    console.error(`Error en fetchWithTimeout para ${url}:`, error);
    clearTimeout(id);
    throw error;
  }
};

export { EXTERNAL_API_URL, API_TIMEOUT, fetchWithTimeout };
