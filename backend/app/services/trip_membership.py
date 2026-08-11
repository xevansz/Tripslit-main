def _is_trip_member(trip: dict, user_id: str) -> bool:
    """Check if user is owner or member of trip."""
    is_owner = trip.get("owner_id") == user_id
    is_member = any(member.get("id") == user_id for member in trip.get("members", []))
    return is_owner or is_member