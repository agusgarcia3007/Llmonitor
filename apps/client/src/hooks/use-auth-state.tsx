export const useAuthState = () => {
  const isAuthenticated = document.cookie.includes("isAuthenticated");
  return { isLoggedIn: isAuthenticated };
};
