const TOKEN_KEY = "token";
const ROLE_KEY = "role";
const EMAIL_KEY = "email";

/* Save auth details */
export const saveAuth = (token, role, email) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(EMAIL_KEY, email);
};

/* Getters */
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getUserRole = () => localStorage.getItem(ROLE_KEY);
export const getUserEmail = () => localStorage.getItem(EMAIL_KEY);

/* Auth helpers */
export const isAuthenticated = () => !!getToken();

/* Logout (alias exposed for UI) */
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(EMAIL_KEY);
};
