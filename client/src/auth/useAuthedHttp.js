import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import http from '../api/http';

export function useAttachAuthToken() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    const id = http.interceptors.request.use(async (config) => {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently();
          config.headers.Authorization = `Bearer ${token}`;
        } catch {
          // user not actually logged in yet; let the request go through unauthenticated
        }
      }
      return config;
    });
    return () => http.interceptors.request.eject(id);
  }, [isAuthenticated, getAccessTokenSilently]);
}