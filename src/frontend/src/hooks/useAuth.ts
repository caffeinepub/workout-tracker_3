import { useInternetIdentity } from "./useInternetIdentity";

export function useAuth() {
  const { identity, login, clear, loginStatus, isInitializing, isLoggingIn } =
    useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  return {
    isAuthenticated,
    identity,
    login,
    logout: clear,
    isLoading: isInitializing || isLoggingIn,
    isLoggingIn,
    loginStatus,
  };
}
