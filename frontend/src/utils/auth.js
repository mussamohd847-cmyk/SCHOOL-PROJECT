export function getCurrentUser() {
  try {
    const raw =
      localStorage.getItem("nia_user") ||
      sessionStorage.getItem("nia_user");
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (!user || !user.role) return null;
    return {
      ...user,
      role: String(user.role).toUpperCase(),
      permissions: Array.isArray(user.permissions) ? user.permissions : [],
    };
  } catch {
    return null;
  }
}

export function getToken() {
  return (
    localStorage.getItem("nia_token") ||
    sessionStorage.getItem("nia_token")
  );
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function hasPermission(code) {
  const u = getCurrentUser();
  if (!u) return false;
  if (u.permissions.includes("*")) return true;
  return u.permissions.includes(code);
}

export function hasRole(role) {
  const u = getCurrentUser();
  if (!u) return false;
  return u.role === String(role).toUpperCase();
}

export function logout() {
  ["nia_token", "nia_user", "nia_logged_in"].forEach((k) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
  window.location.href = "/login";
}
