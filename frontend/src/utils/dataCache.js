// Cache ya data - inaepusha ku-load kila mara kutoka DB
const CACHE_TIME = 5 * 60 * 1000; // Dakika 5

export const dataCache = {
  set(key, data) {
    try {
      sessionStorage.setItem(`nia_cache_${key}`, JSON.stringify({
        data,
        time: Date.now()
      }));
    } catch (e) {}
  },
  
  get(key) {
    try {
      const cached = sessionStorage.getItem(`nia_cache_${key}`);
      if (!cached) return null;
      const { data, time } = JSON.parse(cached);
      if (Date.now() - time > CACHE_TIME) {
        sessionStorage.removeItem(`nia_cache_${key}`);
        return null;
      }
      return data;
    } catch { return null; }
  },
  
  clear(key) {
    if (key) sessionStorage.removeItem(`nia_cache_${key}`);
    else Object.keys(sessionStorage).forEach(k => {
      if (k.startsWith('nia_cache_')) sessionStorage.removeItem(k);
    });
  }
};
