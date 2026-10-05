import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import http from '../api/http';

export function useRole() {
  const { isAuthenticated, isLoading: authLoading, getAccessTokenSilently } = useAuth0();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { setLoading(false); return; }

    // Wait for a real token before calling the API, avoids a race
    // where the request fires before the interceptor has a token ready.
    getAccessTokenSilently()
      .then(() => http.get('/me'))
      .then((res) => setRole(res.data.role))
      .catch((err) => console.log('[auth] useRole failed:', err))
      .finally(() => setLoading(false));
  }, [isAuthenticated, authLoading, getAccessTokenSilently]);

  return { role, loading: loading || authLoading, isAuthenticated };
}