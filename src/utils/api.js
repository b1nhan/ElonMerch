/**
 * API Utility for Frontend
 * Place this in src/utils/api.js
 * 
 * Automatically attaches JWT token from localStorage to all protected requests
 * Uses http://localhost:8000 for backend
 */

const API_BASE_URL = 'http://localhost:8000';

/**
 * Get token from localStorage
 * Returns token or null if not found
 */
const getToken = () => {
  try {
    const token = localStorage.getItem('token');
    return token && token.trim() ? token.trim() : null;
  } catch (err) {
    console.error('Error retrieving token from localStorage:', err);
    return null;
  }
};

/**
 * Make authenticated API request
 * Automatically adds JWT token from localStorage to Authorization header
 */
export const apiCall = async (endpoint, options = {}) => {
  const token = getToken();
  
  // Build headers with default Content-Type
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Attach token to Authorization header for ALL requests
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn('No authentication token found in localStorage');
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Parse response data
    let data;
    try {
      data = await response.json();
    } catch (err) {
      // Handle non-JSON responses
      data = {
        status: 'error',
        message: 'Invalid response format from server',
      };
    }

    // Check if response is not ok (status outside 200-299 range)
    if (!response.ok) {
      // Check for authentication error (401)
      if (response.status === 401) {
        // Clear stored token on 401 Unauthorized
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.warn('Authentication token expired or invalid. Cleared from localStorage.');
      }

      throw {
        status: response.status,
        message: data.message || `HTTP Error ${response.status}`,
        data: data.data || null,
      };
    }

    return data;
  } catch (error) {
    // Handle different types of errors
    if (error.status) {
      // Network error or API error with status
      throw error;
    }

    // Network/fetch error
    throw {
      status: 0,
      message: error.message || 'Network error',
      data: null,
    };
  }
};

/**
 * GET request helper
 * Automatically attaches JWT token
 */
export const apiGet = (endpoint, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;
  return apiCall(url, { method: 'GET' });
};

/**
 * POST request helper
 * Automatically attaches JWT token
 */
export const apiPost = (endpoint, body = {}) => {
  return apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

/**
 * PUT request helper
 * Automatically attaches JWT token
 */
export const apiPut = (endpoint, body = {}) => {
  return apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
};

/**
 * PATCH request helper
 * Automatically attaches JWT token
 */
export const apiPatch = (endpoint, body = {}) => {
  return apiCall(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
};

/**
 * DELETE request helper
 * Automatically attaches JWT token
 */
export const apiDelete = (endpoint) => {
  return apiCall(endpoint, { method: 'DELETE' });
};

/**
 * Upload file with multipart/form-data
 * Automatically attaches JWT token
 */
export const apiUpload = (endpoint, formData) => {
  const token = getToken();
  const headers = {};

  // Attach token to Authorization header
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  })
    .then(response => {
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        throw new Error(`HTTP Error ${response.status}`);
      }
      return response.json();
    })
    .catch(error => {
      throw {
        status: 0,
        message: error.message || 'Upload failed',
        data: null,
      };
    });
};

export default {
  apiCall,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  apiUpload,
  getToken,
};
