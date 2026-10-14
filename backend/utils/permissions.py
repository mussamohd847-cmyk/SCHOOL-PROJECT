from models.permission import Permission
from models.role_permission import RolePermission
from database import db


def get_user_permissions(user) -> set:
    """Rudisha set ya permission codes za mtumiaji."""
    if not user:
        return set()
    if str(user.status or "").lower() != "active":
        return set()

    role = str(user.role or "").lower()

    # Admin anapata kila kitu
    if role == "admin":
        return {p.code for p in Permission.query.all()}

    rows = (
        db.session.query(Permission.code)
        .join(RolePermission, RolePermission.permission_id == Permission.id)
        .filter(RolePermission.role == role)
        .all()
    )
    return {row[0] for row in rows}


def user_has_permission(user, code: str) -> bool:
    """Angalia kama mtumiaji ana permission fulani."""
    if not user:
        return False

    # Admin anapata kila kitu - hakuna kuangalia database
    role = str(user.role or "").strip().lower()
    if role == "admin":
        return True

    try:
        perms = get_user_permissions(user)
        return "*" in perms or code in perms
    except Exception:
        return False
