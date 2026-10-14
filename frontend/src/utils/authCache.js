// Cache ya user session - login inakuwa instant
export const authCache = {
  save(user, token) {
    localStorage.setItem('nia_user', JSON.stringify(user));
    localStorage.setItem('nia_token', token);
    localStorage.setItem('nia_login_time', Date.now().toString());
  },
  
  getUser() {
    try {
      const user = localStorage.getItem('nia_user');
      return user ? JSON.parse(user) : null;
    } catch { return null; }
  },
  
  getToken() {
    return localStorage.getItem('nia_token');
  },
  
  isValid() {
    const time = localStorage.getItem('nia_login_time');
    if (!time) return false;
    // Valid kwa masaa 24
    return (Date.now() - parseInt(time)) < 24 * 60 * 60 * 1000;
  },
  
  clear() {
    localStorage.removeItem('nia_user');
    localStorage.removeItem('nia_token');
    localStorage.removeItem('nia_login_time');
  }
};
