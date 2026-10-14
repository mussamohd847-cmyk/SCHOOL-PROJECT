import { hasPermission, hasRole } from "../utils/auth";

export default function Can({ permission, role, children, fallback = null }) {
  if (permission && !hasPermission(permission)) return fallback;
  if (role && !hasRole(role)) return fallback;
  return children;
}
