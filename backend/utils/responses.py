from flask import jsonify


def success_response(message="Success", data=None, status_code=200, pagination=None):
    body = {"success": True, "message": message}
    if data is not None:
        body["data"] = data
    if pagination is not None:
        body["pagination"] = pagination
    return jsonify(body), status_code


def error_response(message="An error occurred", status_code=400, error=None):
    body = {"success": False, "message": message}
    if error is not None:
        body["error"] = error
    return jsonify(body), status_code


def paginate_query(query, request_args):
    page = request_args.get("page", 1, type=int) or 1
    per_page = request_args.get("per_page", 20, type=int) or 20
    per_page = min(per_page, 100)

    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()

    pagination = {"page": page, "per_page": per_page, "total": total}
    return items, pagination
