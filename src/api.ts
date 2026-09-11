export async function apiFetch(resource: string | Request | URL, config?: RequestInit) {
  if (typeof resource === 'string' && resource.startsWith('/api/') && !resource.startsWith('/api/auth/')) {
    config = config || {};
    config.headers = config.headers || {};
    const token = localStorage.getItem('bhoomi_token');
    if (token) {
      if (config.headers instanceof Headers) {
        config.headers.set('Authorization', 'Bearer ' + token);
      } else {
        (config.headers as Record<string, string>)['Authorization'] = 'Bearer ' + token;
      }
    }
  }
  const res = await window.fetch(resource, config);
  if (!res.ok) {
     if (res.status === 401) {
        window.dispatchEvent(new Event('bhoomi_unauthorized'));
     }
     
     const originalJson = res.json.bind(res);
     res.json = async () => {
        if (res.status === 401) {
           if (typeof resource === 'string') {
              if (resource.includes('kpis')) return { areaNotified: 0, areaAcquired: 0, compensationAssessed: 0, compensationDisbursed: 0, familiesAffected: 0, familiesRnR: 0, activeProjects: 0 };
              if (resource.includes('parcels')) return { type: "FeatureCollection", features: [] };
              if (resource.includes('locations')) return {"All States": ["All Districts"]};
           }
           return [];
        }
        return await originalJson();
     };
  }
  return res;
}
