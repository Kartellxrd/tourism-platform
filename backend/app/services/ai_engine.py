# backend/app/services/ai_engine.py

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# ── Feature list — order matters, must match everywhere ──────────────────────
FEATURES = [
    'wildlife',
    'photography',
    'luxury',
    'adventure',
    'culture',
    'family',
    'water',
    'desert',
    'birding',
    'stargazing',
]

# ── Destination feature vectors ───────────────────────────────────────────────
# Each value is 0.0 to 1.0 — how strongly a destination matches that feature
DESTINATION_VECTORS = {
    1:  [0.9, 0.8, 0.7, 0.3, 0.2, 0.4, 0.9, 0.0, 0.6, 0.3],  # Okavango Delta
    2:  [0.9, 0.6, 0.5, 0.5, 0.2, 0.5, 0.7, 0.0, 0.8, 0.1],  # Chobe
    3:  [0.3, 0.7, 0.2, 0.5, 0.3, 0.5, 0.2, 0.6, 0.2, 0.9],  # Makgadikgadi
    4:  [0.6, 0.4, 0.1, 0.9, 0.8, 0.2, 0.0, 0.9, 0.2, 0.5],  # Central Kalahari
    5:  [0.9, 0.8, 0.8, 0.4, 0.2, 0.4, 0.6, 0.1, 0.9, 0.2],  # Moremi
    6:  [0.7, 0.6, 0.3, 0.5, 0.2, 0.7, 0.3, 0.3, 0.4, 0.8],  # Nxai Pan
    7:  [0.2, 0.6, 0.2, 0.5, 0.9, 0.4, 0.1, 0.3, 0.1, 0.4],  # Tsodilo Hills
    8:  [0.7, 0.5, 0.2, 0.4, 0.6, 0.6, 0.2, 0.2, 0.3, 0.2],  # Khama Rhino
    9:  [0.9, 0.6, 0.4, 0.7, 0.2, 0.3, 0.4, 0.2, 0.5, 0.3],  # Savuti Marsh
    10: [0.8, 0.7, 0.9, 0.4, 0.1, 0.3, 0.8, 0.0, 0.6, 0.3],  # Linyanti
    11: [0.7, 0.6, 0.4, 0.7, 0.5, 0.4, 0.2, 0.4, 0.3, 0.3],  # Tuli Block
    12: [0.1, 0.4, 0.1, 0.8, 0.7, 0.2, 0.0, 0.5, 0.0, 0.3],  # Gcwihaba Caves
    13: [0.7, 0.5, 0.2, 0.8, 0.3, 0.3, 0.0, 0.9, 0.5, 0.4],  # Kgalagadi
    14: [0.6, 0.4, 0.2, 0.3, 0.3, 0.9, 0.2, 0.1, 0.2, 0.2],  # Mokolodi
    15: [0.5, 0.3, 0.1, 0.2, 0.2, 0.8, 0.1, 0.1, 0.3, 0.1],  # Gaborone Reserve
}


def build_user_vector(preferences: dict) -> np.ndarray:
    """
    Convert user preferences dict into a numpy vector.
    Example input:
    {
      'wildlife': 0.9, 'photography': 0.8, 'luxury': 0.3,
      'adventure': 0.5, 'culture': 0.2, 'family': 0.0,
      'water': 0.7, 'desert': 0.1, 'birding': 0.4, 'stargazing': 0.6
    }
    """
    return np.array([[preferences.get(f, 0.0) for f in FEATURES]])


def get_recommendations(preferences: dict) -> list:
    """
    Given a user preferences dict, return all destination IDs
    sorted by cosine similarity score descending.

    Returns list of dicts:
    [{ 'dest_id': 1, 'match_score': 97 }, ...]
    """
    user_vec = build_user_vector(preferences)

    dest_ids = list(DESTINATION_VECTORS.keys())
    dest_matrix = np.array([DESTINATION_VECTORS[d] for d in dest_ids])

    # Compute cosine similarity — returns array of scores 0.0 to 1.0
    scores = cosine_similarity(user_vec, dest_matrix)[0]

    # Build results list
    results = [
        {
            'dest_id': dest_ids[i],
            'match_score': round(float(scores[i]) * 100),
        }
        for i in range(len(dest_ids))
    ]

    # Sort highest match first
    return sorted(results, key=lambda x: x['match_score'], reverse=True)


def update_user_vector_from_interaction(
    current_preferences: dict,
    dest_id: int,
    action: str,
) -> dict:
    """
    Nudge user preferences based on what they interacted with.
    action weights:
      'view'     → small nudge  (+0.05)
      'wishlist' → medium nudge (+0.10)
      'book'     → strong nudge (+0.20)
      'ignore'   → slight push  (-0.05)
    """
    action_weights = {
        'view':     0.05,
        'wishlist': 0.10,
        'book':     0.20,
        'ignore':  -0.05,
    }

    weight = action_weights.get(action, 0.05)
    dest_vec = DESTINATION_VECTORS.get(dest_id)

    if not dest_vec:
        return current_preferences

    updated = dict(current_preferences)
    for i, feature in enumerate(FEATURES):
        current_val = updated.get(feature, 0.0)
        # Nudge towards destination feature value
        nudge = dest_vec[i] * weight
        new_val = current_val + nudge
        # Clamp between 0.0 and 1.0
        updated[feature] = round(min(1.0, max(0.0, new_val)), 4)

    return updated