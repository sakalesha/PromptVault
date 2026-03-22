const API_BASE_URL = import.meta.env.PROD 
  ? '/api' 
  : 'http://localhost:5000/api';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const text = await response.text();
      try {
        const errorData = JSON.parse(text);
        errorMessage = errorData.message || errorData.error || response.statusText;
      } catch (e) {
        // If not JSON, use the raw text (truncated if too long)
        errorMessage = text.slice(0, 100).replace(/<[^>]*>?/gm, ''); // Strip HTML
      }
    } catch (e) {
      // If error reading text, stay with statusText
    }
    throw new Error(`API error: ${errorMessage || 'Unknown Error'}`);
  }

  // Handle empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};
