import axios from 'axios';

// Configuration
const CONFIG = {
  API_URL:
    import.meta.env.VITE_API_URL ||
    (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:5000/api'),
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

// Create axios instance
const api = axios.create({
  baseURL: CONFIG.API_URL,
  timeout: CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Enhanced token management
const tokenManager = {
  get: () => {
    const token = localStorage.getItem('token');
    if (import.meta.env.DEV) {
      console.log('Getting token:', token ? 'Token exists' : 'No token found');
    }
    return token;
  },

  set: (token) => {
    if (import.meta.env.DEV) {
      console.log('Setting token:', token ? 'Token set' : 'No token provided');
    }
    if (token) {
      localStorage.setItem('token', token);
    }
  },

  remove: () => {
    if (import.meta.env.DEV) console.log('Removing token and user data');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userSubscription');
  },

  isValid: (token) => {
    if (!token) {
      if (import.meta.env.DEV) console.log('Token validation: No token provided');
      return false;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        if (import.meta.env.DEV) console.log('Token validation: Invalid token format');
        return false;
      }

      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const isValid = payload.exp > currentTime;

      if (import.meta.env.DEV) {
        console.log('Token validation:', {
          isValid,
          exp: payload.exp,
          current: currentTime,
          timeLeft: payload.exp - currentTime,
        });
      }

      return isValid;
    } catch (error) {
      if (import.meta.env.DEV) console.log('Token validation error:', error);
      return false;
    }
  },
};

// Cache management
const cache = new Map();
const cacheManager = {
  get: (key) => {
    const item = cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      cache.delete(key);
      return null;
    }

    return item.data;
  },
  set: (key, data, duration = CONFIG.CACHE_DURATION) => {
    cache.set(key, {
      data,
      expiry: Date.now() + duration,
    });
  },
  clear: () => cache.clear(),
  delete: (key) => cache.delete(key),
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`Making ${config.method?.toUpperCase()} request to:`, config.url);
    }

    const token = tokenManager.get();

    if (token) {
      if (tokenManager.isValid(token)) {
        config.headers.Authorization = `Bearer ${token}`;
        if (import.meta.env.DEV) console.log('✅ Valid token added to request headers');
      } else {
        if (import.meta.env.DEV) console.log('❌ Token is invalid, removing and rejecting request');
        tokenManager.remove();
        return Promise.reject({
          response: {
            status: 401,
            data: { message: 'Token expired or invalid' },
          },
          config,
          isTokenError: true,
        });
      }
    } else {
      const protectedRoutes = ['/bookings', '/users/me', '/memberships/my-subscription'];
      const isProtectedRoute = protectedRoutes.some((route) => config.url?.includes(route));

      if (isProtectedRoute) {
        if (import.meta.env.DEV) console.log('🚫 Rejecting request to protected route without token');
        return Promise.reject({
          response: {
            status: 401,
            data: { message: 'Authentication required' },
          },
          config,
          isAuthError: true,
        });
      }
    }

    config.metadata = { startTime: Date.now() };
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV && response.config.metadata) {
      const duration = Date.now() - response.config.metadata.startTime;
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (import.meta.env.DEV) {
      console.error('API Error:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: originalRequest?.url,
        method: originalRequest?.method,
        isTokenError: error.isTokenError,
        isAuthError: error.isAuthError,
      });
    }
      // Response interceptor (inside api.interceptors.response.use error handler)
const isAuthEndpoint =
  originalRequest?.url?.includes('/users/login') ||
  originalRequest?.url?.includes('/users/register');

if ((error.response?.status === 401 || error.isTokenError || error.isAuthError) && !isAuthEndpoint) {
  // existing 401 handling here...
  if (!originalRequest._retry) {
    originalRequest._retry = true;
    tokenManager.remove();
    window.dispatchEvent(new CustomEvent('auth:logout'));
    const currentPath = window.location.pathname;
    if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
      if (import.meta.env.DEV) console.log('Redirecting to login due to 401');
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }
  }
  // IMPORTANT: return here so we don't fall through
  return Promise.reject(error);
}

    // Handle 401 Unauthorized
    if (error.response?.status === 401 || error.isTokenError || error.isAuthError) {
      if (import.meta.env.DEV) console.log('401 Unauthorized - handling token issues');

      if (!originalRequest._retry) {
        originalRequest._retry = true;

        tokenManager.remove();
        window.dispatchEvent(new CustomEvent('auth:logout'));

        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
          if (import.meta.env.DEV) console.log('Redirecting to login due to 401');
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
      }
    }

    // Tag network errors
    if (!error.response) {
      error.isNetworkError = true;
      error.userMessage = 'Network error. Please check your connection and try again.';
    } else {
      error.userMessage = error.response.data?.message || `Request failed with status ${error.response.status}`;
    }

    return Promise.reject(error);
  }
);

// Retry mechanism
const retryRequest = async (requestFn, maxAttempts = CONFIG.RETRY_ATTEMPTS) => {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;

      const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
      const isHardNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.isNetworkError;

      if (
        error.response?.status === 401 ||
        error.isTokenError ||
        error.isAuthError ||
        (error.response?.status >= 400 && error.response?.status < 500 && ![408, 429].includes(error.response.status)) ||
        isOffline ||
        isHardNetworkError
      ) {
        if (import.meta.env.DEV) {
          console.log(`Not retrying due to ${error.response?.status || (isOffline ? 'offline' : 'network')} error`);
        }
        throw error;
      }

      if (attempt < maxAttempts) {
        const delay = CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1);
        if (import.meta.env.DEV) {
          console.log(`Retrying request in ${delay}ms (attempt ${attempt + 1}/${maxAttempts})...`);
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

// Generic API call wrapper (offline-first with fallback caching)
const handleApiCall = async (apiCall, fallbackData = null, cacheKey = null) => {
  try {
    // Offline: use cache/fallback immediately (no network)
    const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
    if (isOffline) {
      if (cacheKey) {
        const cached = cacheManager.get(cacheKey);
        if (cached) {
          if (import.meta.env.DEV) console.log(`Using cached data (offline) for: ${cacheKey}`);
          return cached;
        }
      }
      if (fallbackData !== null) {
        const offlineResult = { success: true, data: fallbackData, isOffline: true, error: 'Offline' };
        if (cacheKey) cacheManager.set(cacheKey, offlineResult, CONFIG.CACHE_DURATION);
        return offlineResult;
      }
    }

    // Cache-first (when online)
    if (cacheKey) {
      const cachedData = cacheManager.get(cacheKey);
      if (cachedData) {
        if (import.meta.env.DEV) console.log(`Using cached data for: ${cacheKey}`);
        return cachedData;
      }
    }

    const response = await retryRequest(apiCall);
    const result = response.data;

    // Cache success responses
    if (cacheKey && result.success !== false) {
      cacheManager.set(cacheKey, result);
    }

    return result;
  } catch (error) {
    console.error('API call failed:', error);

    if (fallbackData !== null) {
      console.warn('Using fallback data due to API error');
      const result = {
        success: true,
        data: fallbackData,
        isOffline: true,
        error: error.userMessage || error.message || 'Network error',
      };

      // Cache fallback to reduce future network attempts/logs
      if (cacheKey) cacheManager.set(cacheKey, result, CONFIG.CACHE_DURATION);

      return result;
    }

    throw error;
  }
};

// Helper function to calculate end date
function calculateEndDate(startDateStr, period) {
  const startDate = new Date(startDateStr);
  const endDate = new Date(startDate);

  const map = {
    day: () => endDate.setDate(endDate.getDate() + 1),
    week: () => endDate.setDate(endDate.getDate() + 7),
    month: () => endDate.setMonth(endDate.getMonth() + 1),
    quarter: () => endDate.setMonth(endDate.getMonth() + 3),
    year: () => endDate.setFullYear(endDate.getFullYear() + 1),
  };

  (map[period] || map.month)();
  return endDate.toISOString();
}

// Auth services
export const authService = {
  register: async (userData) => {
    try {
      const response = await api.post('/users/register', userData);
      if (response.data.token) tokenManager.set(response.data.token);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

   login: async (credentials) => {
  // 1) Offline short-circuit
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    const err = new Error('You appear to be offline. Please connect to the internet and try again.');
    err.isNetworkError = true;
    err.userMessage = err.message;
    throw err;
  }

  try {
    if (import.meta.env.DEV) console.log('Attempting login...');
    // Authentication requests should not retry; they usually fail deterministically
    const resp = await api.post('/users/login', credentials);

    if (resp.data.token) {
      tokenManager.set(resp.data.token);
      cacheManager.clear();
      if (import.meta.env.DEV) console.log('Login successful, token stored');
    }

    return resp.data;
  } catch (error) {
    // Normalize errors to user-facing messages
    if (error.isNetworkError || error.code === 'ERR_NETWORK' || !error.response) {
      error.userMessage = 'Cannot reach the server. Please check your connection and try again.';
    } else if (error.response?.status >= 500) {
      error.userMessage = 'Server is unavailable right now. Please try again later.';
    } else if (error.response?.status === 400 || error.response?.status === 401) {
      error.userMessage = error.response?.data?.message || 'Invalid email or password.';
    } else {
      error.userMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
    }
    throw error;
  }
},
  logout: () => {
    if (import.meta.env.DEV) console.log('Logging out...');
    tokenManager.remove();
    cacheManager.clear();
  },

  getCurrentUser: () => {
    const token = tokenManager.get();
    if (!token || !tokenManager.isValid(token)) {
      if (import.meta.env.DEV) console.log('No valid token for getCurrentUser');
      return Promise.reject(new Error('No valid authentication token'));
    }
    return handleApiCall(() => api.get('/users/me'), null, 'current-user');
  },

  refreshToken: async () => {
    try {
      const response = await api.post('/users/refresh-token');
      if (response.data.token) tokenManager.set(response.data.token);
      return response.data;
    } catch (error) {
      tokenManager.remove();
      throw error;
    }
  },
};

// Booking services
export const bookingService = {
  createBooking: async (bookingData) => {
    const token = tokenManager.get();

    if (import.meta.env.DEV) {
      console.log('Creating booking with token status:', {
        hasToken: !!token,
        isValid: token ? tokenManager.isValid(token) : false,
      });
    }

    if (!token || !tokenManager.isValid(token)) {
      console.error('Authentication check failed in createBooking');

      // Save locally for sync later
      const localBooking = {
        ...bookingData,
        _id: `local-${Date.now()}`,
        status: 'pending-sync',
        createdAt: new Date().toISOString(),
        isLocal: true,
      };

      const localBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
      localBookings.push(localBooking);
      localStorage.setItem('userBookings', JSON.stringify(localBookings));

      return {
        success: true,
        message: 'Booking saved locally. Will sync when you log in again.',
        data: localBooking,
        isOffline: true,
        authError: true,
      };
    }

    try {
      const response = await api.post('/bookings', {
        ...bookingData,
        createdAt: new Date().toISOString(),
      });

      cacheManager.delete('user-bookings');
      return response.data;
    } catch (error) {
      if (error.isNetworkError) {
        const localBooking = {
          ...bookingData,
          _id: `local-${Date.now()}`,
          status: 'pending-sync',
          createdAt: new Date().toISOString(),
          isLocal: true,
        };

        const localBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        localBookings.push(localBooking);
        localStorage.setItem('userBookings', JSON.stringify(localBookings));

        return {
          success: true,
          message: 'Booking saved locally. Will sync when online.',
          data: localBooking,
          isOffline: true,
        };
      }

      throw error;
    }
  },

  getUserBookings: async (params = {}) => {
    const token = tokenManager.get();
    const fallbackBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');

    if (!token || !tokenManager.isValid(token)) {
      if (import.meta.env.DEV) console.log('🔒 No valid token for getUserBookings, returning fallback data');
      return Promise.resolve({
        success: true,
        data: fallbackBookings,
        isOffline: true,
        message: 'Please log in to see your latest bookings',
      });
    }

    try {
      return await handleApiCall(
        () => api.get('/bookings', { params: { limit: 100, page: 1, ...params } }),
        fallbackBookings,
        `user-bookings-${JSON.stringify(params)}`
      );
    } catch (error) {
      return {
        success: true,
        data: fallbackBookings,
        isOffline: true,
        error: error.userMessage,
      };
    }
  },

  getBooking: (bookingId) => {
    const token = tokenManager.get();
    if (!token || !tokenManager.isValid(token)) throw new Error('Authentication required. Please log in.');
    return handleApiCall(() => api.get(`/bookings/${bookingId}`), null, `booking-${bookingId}`);
  },

  updateBooking: async (bookingId, updateData) => {
    const token = tokenManager.get();
    if (!token || !tokenManager.isValid(token)) throw new Error('Authentication required. Please log in.');
    const response = await api.put(`/bookings/${bookingId}`, updateData);
    cacheManager.delete('user-bookings');
    cacheManager.delete(`booking-${bookingId}`);
    return response.data;
  },

  cancelBooking: async (bookingId) => {
    const token = tokenManager.get();
    if (!token || !tokenManager.isValid(token)) throw new Error('Authentication required. Please log in.');
    const response = await api.delete(`/bookings/${bookingId}`);
    cacheManager.delete('user-bookings');
    cacheManager.delete(`booking-${bookingId}`);
    return response.data;
  },

  getBookingStats: async () => {
    const token = tokenManager.get();
    const fallbackStats = {
      total: 0,
      confirmed: 0,
      pending: 0,
      cancelled: 0,
      completed: 0,
    };

    if (!token || !tokenManager.isValid(token)) {
      if (import.meta.env.DEV) console.log('🔒 No valid token for getBookingStats, returning fallback data');
      return Promise.resolve({ success: true, data: fallbackStats, isOffline: true });
    }

    try {
      return await handleApiCall(() => api.get('/bookings/stats/summary'), fallbackStats, 'booking-stats');
    } catch (error) {
      return { success: true, data: fallbackStats, isOffline: true, error: error.userMessage };
    }
  },
};

// Membership services
export const membershipService = {
  getAllPlans: () => {
    const fallbackPlans = [
      {
        _id: 'basic-plan',
        name: 'Basic',
        price: 2000,
        period: 'month',
        features: [
          'Access to gym equipment',
          'Locker room access',
          'Basic fitness assessment',
          'Mobile app access',
          '24/7 gym access',
        ],
        popular: false,
      },
      {
        _id: 'premium-plan',
        name: 'Premium',
        price: 5000,
        period: 'month',
        features: [
          'Everything in Basic',
          'Personal trainer (2 sessions/month)',
          'Group fitness classes',
          'Nutrition consultation',
          'Guest passes (2/month)',
          'Sauna & steam room access',
        ],
        popular: true,
      },
      {
        _id: 'elite-plan',
        name: 'Elite',
        price: 8000,
        period: 'month',
        features: [
          'Everything in Premium',
          'Unlimited personal training',
          'Custom meal plans',
          'Priority class booking',
          'Massage therapy (1/month)',
          'VIP lounge access',
          'Unlimited guest passes',
        ],
        popular: false,
      },
    ];

    return handleApiCall(() => api.get('/memberships/plans'), fallbackPlans, 'membership-plans');
  },

  subscribe: async (subscriptionData) => {
    const token = tokenManager.get();

    if (import.meta.env.DEV) {
      console.log('Creating subscription with token status:', {
        hasToken: !!token,
        isValid: token ? tokenManager.isValid(token) : false,
      });
    }

    if (!token || !tokenManager.isValid(token)) {
      console.error('Authentication check failed in subscribe');

      const mockSubscription = {
        _id: `mock-subscription-${Date.now()}`,
        plan: subscriptionData.planId,
        user: subscriptionData.userId,
        startDate: subscriptionData.startDate || new Date().toISOString(),
        status: 'pending-sync',
        endDate: calculateEndDate(subscriptionData.startDate || new Date().toISOString(), 'month'),
        isLocal: true,
      };

      localStorage.setItem('userSubscription', JSON.stringify(mockSubscription));

      return {
        success: true,
        message: 'Subscription saved locally. Will sync when you log in again.',
        data: { subscription: mockSubscription },
        isOffline: true,
        authError: true,
      };
    }

    try {
      const response = await api.post('/memberships/subscribe', subscriptionData);
      cacheManager.delete('user-subscription');
      return response.data;
    } catch (error) {
      if (error.isNetworkError) {
        const mockSubscription = {
          _id: `mock-subscription-${Date.now()}`,
          plan: subscriptionData.planId,
          user: subscriptionData.userId,
          startDate: subscriptionData.startDate || new Date().toISOString(),
          status: 'pending-sync',
          endDate: calculateEndDate(subscriptionData.startDate || new Date().toISOString(), 'month'),
          isLocal: true,
        };

        localStorage.setItem('userSubscription', JSON.stringify(mockSubscription));

        return {
          success: true,
          message: 'Subscription saved locally. Will sync when online.',
          data: { subscription: mockSubscription },
          isOffline: true,
        };
      }

      throw error;
    }
  },

  getUserSubscription: async () => {
    const token = tokenManager.get();
    const fallbackSubscription = JSON.parse(localStorage.getItem('userSubscription') || 'null');

    if (!token || !tokenManager.isValid(token)) {
      if (import.meta.env.DEV) console.log('🔒 No valid token for getUserSubscription, returning fallback data');
      return Promise.resolve({
        success: true,
        data: { subscription: fallbackSubscription },
        isOffline: true,
      });
    }

    try {
      return await handleApiCall(
        () => api.get('/memberships/my-subscription'),
        fallbackSubscription ? { subscription: fallbackSubscription } : { subscription: null },
        'user-subscription'
      );
    } catch (error) {
      return {
        success: true,
        data: { subscription: fallbackSubscription },
        isOffline: true,
        error: error.userMessage,
      };
    }
  },
};

// Trainer services
export const trainerService = {
  getAllTrainers: () => {
    const fallbackTrainers = [
     {
    name: 'Sarah Johnson',
    specialization: 'Strength Training & Powerlifting',
    experience: 8,
    image: 'https://i.pinimg.com/736x/6a/a7/6c/6aa76cca9f2a4ce7458902851b89e1b0.jpg',
    bio: 'Former Olympic weightlifter with expertise in strength training and powerlifting. Helped 200+ clients achieve their strength goals.',
    certifications: ['NASM-CPT', 'CSCS', 'Olympic Lifting'],
    stats: { clients: 200, years: 8, rating: 4.9 },
    hourlyRate: 85
  },
  {
    name: 'Mike Rodriguez',
    specialization: 'HIIT & Cardio Training',
    experience: 6,
    image: 'https://i.pinimg.com/1200x/88/d1/1a/88d11a3428462b2e143d8c4a28af7a60.jpg',
    bio: 'High-energy trainer specializing in HIIT workouts and cardiovascular conditioning. Marathon runner and fitness enthusiast.',
    certifications: ['ACE-CPT', 'HIIT Specialist', 'Running Coach'],
    stats: { clients: 150, years: 6, rating: 4.8 },
    hourlyRate: 75
  },
  {
    name: 'Emily Chen',
    specialization: 'Yoga & Flexibility',
    experience: 10,
    image: 'https://i.pinimg.com/1200x/a5/48/6e/a5486e5ceec98dc2eb463c447ff86994.jpg',
    bio: 'Certified yoga instructor with a focus on flexibility, mindfulness, and holistic wellness. Trained in multiple yoga disciplines.',
    certifications: ['RYT-500', 'Yin Yoga', 'Meditation'],
    stats: { clients: 300, years: 10, rating: 5.0 },
    hourlyRate: 70
  },
  {
    name: 'Rose Yougt',
    specialization: 'Bodybuilding & Nutrition',
    experience: 12,
    image: 'https://i.pinimg.com/1200x/2d/5d/1f/2d5d1ff0cafd1dff0a8d3e6b09c5af73.jpg',
    bio: 'Professional bodybuilder and nutrition expert. Specializes in muscle building, cutting, and competition preparation.',
    certifications: ['IFBB Pro', 'Nutrition Specialist', 'Contest Prep'],
    stats: { clients: 180, years: 12, rating: 4.9 },
    hourlyRate: 95
  }
    ];

    return handleApiCall(() => api.get('/trainers'), fallbackTrainers, 'trainers');
  },

  getTrainer: (id) => handleApiCall(() => api.get(`/trainers/${id}`), null, `trainer-${id}`),

  getTrainerAvailability: (trainerId, date) =>
    handleApiCall(() => api.get(`/trainers/${trainerId}/availability`, { params: { date } }), [], `trainer-availability-${trainerId}-${date}`),

  bookSession: (bookingData) => bookingService.createBooking({ ...bookingData, bookingType: 'trainer' }),
};

// Class services
export const classService = {
  getAllClasses: () => {
    const fallbackClasses = [
      {
        _id: 'class-1',
        name: 'Morning Yoga Flow',
        type: 'Yoga',
        trainer: 'Sarah Johnson',
        trainerId: 'trainer-1',
        duration: 60,
        difficulty: 'Beginner',
        maxParticipants: 20,
        currentParticipants: 12,
        description: 'Start your day with gentle yoga flow to energize body and mind.',
        equipment: ['Yoga mat', 'Blocks (optional)'],
        schedule: {
          Monday: ['9:00 AM', '6:00 PM'],
          Wednesday: ['9:00 AM', '6:00 PM'],
          Friday: ['9:00 AM', '6:00 PM'],
        },
        price: 25,
      },
      {
        _id: 'class-2',
        name: 'HIIT Blast',
        type: 'Cardio',
        trainer: 'Mike Wilson',
        trainerId: 'trainer-2',
        duration: 45,
        difficulty: 'Advanced',
        maxParticipants: 15,
        currentParticipants: 8,
        description: 'High-intensity interval training for maximum calorie burn.',
        equipment: ['None required'],
        schedule: {
          Tuesday: ['7:00 AM', '7:00 PM'],
          Thursday: ['7:00 AM', '7:00 PM'],
          Saturday: ['10:00 AM'],
        },
        price: 30,
      },
    ];

    return handleApiCall(() => api.get('/classes'), fallbackClasses, 'classes');
  },

  getClass: (id) => handleApiCall(() => api.get(`/classes/${id}`), null, `class-${id}`),

  getClassesByDay: async (day) => {
    try {
      return await handleApiCall(() => api.get(`/classes/day/${day}`), null, `classes-day-${day}`);
    } catch (error) {
      const allClasses = await classService.getAllClasses();
      const dayClasses = allClasses.data.filter((cls) => cls.schedule && cls.schedule[day] && cls.schedule[day].length > 0);

      return { success: true, data: dayClasses, isOffline: true };
    }
  },

  bookClass: (bookingData) => bookingService.createBooking({ ...bookingData, bookingType: 'class' }),
};

// Utility functions
export const apiUtils = {
  checkApiHealth: async () => {
    try {
      const response = await api.get('/health', { timeout: 5000 });
      return { ...response.data, isOnline: true };
    } catch (error) {
      return {
        success: false,
        message: 'API unavailable',
        isOnline: false,
        error: error.userMessage,
      };
    }
  },

  isAuthenticated: () => {
    const token = tokenManager.get();
    const isValid = token && tokenManager.isValid(token);
    if (import.meta.env.DEV) console.log('🔐 Authentication check:', isValid ? 'Authenticated' : 'Not authenticated');
    return isValid;
  },

  getApiUrl: () => CONFIG.API_URL,

  clearCache: () => {
    cacheManager.clear();
  },

  debugAuth: () => {
    const token = tokenManager.get();
    console.log('=== AUTH DEBUG ===');
    console.log('Token exists:', !!token);
    if (token) {
      console.log('Token preview:', token.substring(0, 50) + '...');
      console.log('Token valid:', tokenManager.isValid(token));
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        console.log('Expires at:', new Date(payload.exp * 1000));
        console.log('Current time:', new Date());
      } catch (e) {
        console.log('Error parsing token:', e);
      }
    }
    console.log('==================');
  },
};

export { api as default };
