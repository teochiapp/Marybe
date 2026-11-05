export const SESSION_EXPIRED_EVENT = 'marybe:session-expired';

let axiosInterceptorId = null;
let axiosClient = null;
const invalidatedTokenScopes = new Map();

const decodePayload = (token) => {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(atob(base64).split('').map(char =>
      `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`
    ).join('')));
  } catch {
    return null;
  }
};

export const getTokenExpiration = (token) => {
  const exp = decodePayload(token)?.exp;
  return Number.isFinite(exp) ? exp * 1000 : null;
};

export const isTokenExpired = (token, now = Date.now()) => {
  const expiration = getTokenExpiration(token);
  return expiration !== null && expiration <= now;
};

export const clearCredentials = (scope) => {
  if (scope === 'admin') {
    localStorage.removeItem('admin_jwt');
    return;
  }
  localStorage.removeItem('jwt');
  localStorage.removeItem('user');
};

export const notifySessionExpired = (scope = 'customer') => {
  const token = localStorage.getItem(scope === 'admin' ? 'admin_jwt' : 'jwt');
  if (token) invalidatedTokenScopes.set(token, scope);
  clearCredentials(scope);
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT, { detail: { scope } }));
};

const scopeForToken = (token) => (
  invalidatedTokenScopes.get(token) || (token && token === localStorage.getItem('admin_jwt') ? 'admin' : 'customer')
);

export const authenticatedFetch = async (input, init = {}, token) => {
  const response = await fetch(input, init);
  if (response.status === 401 && token) notifySessionExpired(scopeForToken(token));
  return response;
};

export const installAxiosSessionInterceptor = () => {
  let active = true;
  import('axios').then(({ default: axios }) => {
    if (!active || axiosInterceptorId !== null) return;
    axiosClient = axios;
    axiosInterceptorId = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          const authorization = error.config?.headers?.Authorization || error.config?.headers?.authorization || '';
          const token = authorization.replace(/^Bearer\s+/i, '').trim();
          if (token) notifySessionExpired(scopeForToken(token));
        }
        return Promise.reject(error);
      }
    );
  });

  return () => {
    active = false;
    if (axiosInterceptorId !== null && axiosClient) axiosClient.interceptors.response.eject(axiosInterceptorId);
    axiosInterceptorId = null;
    axiosClient = null;
  };
};
