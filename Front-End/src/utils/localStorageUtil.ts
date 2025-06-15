export const localStorageUtil = {
  setAuthToLocalStorage: (accessToken: string, role: string) => {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("role", role);
  },
  getAccessTokenFromLocalStorage: () => {
    return localStorage.getItem("access_token") || null;
  },
  getRoleFromLocalStorage: () => {
    return localStorage.getItem("role") || null;
  },
  removeAuthFromLocalStorage: () => {
    localStorage.removeItem("role");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
  getRefreshTokenFromLocalStorage: () => {
    return localStorage.getItem("refresh_token") || null;
  },
  setRefreshTokenToLocalStorage: (refreshToken: string) => {
    localStorage.setItem("refresh_token", refreshToken);
  },
  setAccessTokenToLocalStorage: (accessToken: string) => {
    localStorage.setItem("access_token", accessToken);
  }
};
