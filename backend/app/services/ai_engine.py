import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models.destination import Destination
from ..models.preference import UserPreference

# ── Feature list — MUST MATCH your Preferences page exactly ─────────────────
FEATURES = [
    'wildlife',      # 0 - Wildlife/Nature
    'photography',   # 1 - Photography
    'luxury',        # 2 - Luxury
    'adventure',     # 3 - Adventure
    'culture',       # 4 - Culture
    'family',        # 5 - Family friendly
    'water',         # 6 - Water activities
    'desert',        # 7 - Desert landscapes
    'birding',       # 8 - Bird watching
    'stargazing',    # 9 - Stargazing
]

# ── Map budget preference to numerical value ────────────────────────────────
BUDGET_MAP = {
    'budget': 0.0,   # Budget: prefers low prices (0-2500)
    'mid': 0.5,      # Mid-range: balanced
    'luxury': 1.0,   # Luxury: prefers high prices
}

# ── Get destination feature vectors from DATABASE (NOT hardcoded) ──────────
def get_destination_vectors(db: Session):
    """
    Fetch all destinations from database and build feature vectors
    based on their actual data (category, features, price)
    """
    destinations = db.query(Destination).all()
    
    vectors = {}
    
    for dest in destinations:
        # Build vector based on destination's actual data
        vector = [0.0] * len(FEATURES)
        
        # Category-based scoring
        category = dest.category.lower() if dest.category else ""
        if 'wildlife' in category or 'safari' in category:
            vector[0] = 0.9  # wildlife
            vector[8] = 0.7  # birding
        if 'culture' in category or 'museum' in category:
            vector[4] = 0.9  # culture
            vector[1] = 0.6  # photography
        if 'shopping' in category:
            vector[4] = 0.5  # culture
            vector[2] = 0.4  # luxury
        if 'historical' in category:
            vector[4] = 0.8  # culture
            vector[1] = 0.7  # photography
        if 'adventure' in category:
            vector[3] = 0.8  # adventure
        
        # Features-based scoring (from destination.features array)
        if dest.features:
            features_lower = [f.lower() for f in dest.features]
            if any('game' in f or 'wildlife' in f for f in features_lower):
                vector[0] = max(vector[0], 0.8)
            if any('photo' in f or 'view' in f for f in features_lower):
                vector[1] = max(vector[1], 0.7)
            if any('luxury' in f or 'lodge' in f for f in features_lower):
                vector[2] = max(vector[2], 0.8)
            if any('hiking' in f or '4x4' in f or 'trail' in f for f in features_lower):
                vector[3] = max(vector[3], 0.7)
            if any('cultural' in f or 'history' in f for f in features_lower):
                vector[4] = max(vector[4], 0.7)
            if any('family' in f or 'kids' in f for f in features_lower):
                vector[5] = max(vector[5], 0.7)
            if any('water' in f or 'river' in f or 'mokoro' in f for f in features_lower):
                vector[6] = max(vector[6], 0.8)
            if any('desert' in f or 'kalahari' in f for f in features_lower):
                vector[7] = max(vector[7], 0.8)
            if any('bird' in f for f in features_lower):
                vector[8] = max(vector[8], 0.7)
            if any('star' in f or 'night' in f for f in features_lower):
                vector[9] = max(vector[9], 0.7)
        
        # Price-based scoring (affects budget preference)
        if dest.price and dest.price > 0:
            if dest.price <= 50:  # Cheap
                vector[2] = 0.2  # low luxury
            elif dest.price <= 150:  # Mid
                vector[2] = 0.5  # mid luxury
            else:  # Expensive
                vector[2] = 0.8  # high luxury
        else:  # Free entry
            vector[2] = 0.1  # very low luxury
        
        vectors[dest.id] = vector
    
    return vectors


def build_user_vector(preferences: dict) -> np.ndarray:
    """
    Convert user preferences dict into a numpy vector.
    Preferences come from the database or defaults.
    """
    return np.array([[preferences.get(f, 0.5) for f in FEATURES]])


def get_recommendations(preferences: dict, db: Session = None) -> list:
    """
    Given user preferences, return all destination IDs from DATABASE
    sorted by cosine similarity score descending.
    """
    if db is None:
        db = SessionLocal()
    
    try:
        # Get destination vectors from DATABASE
        dest_vectors_dict = get_destination_vectors(db)
        
        if not dest_vectors_dict:
            return []
        
        dest_ids = list(dest_vectors_dict.keys())
        dest_matrix = np.array([dest_vectors_dict[d] for d in dest_ids])
        
        # Build user vector
        user_vec = build_user_vector(preferences)
        
        # Compute cosine similarity
        scores = cosine_similarity(user_vec, dest_matrix)[0]
        
        # Build results
        results = [
            {
                'dest_id': dest_ids[i],
                'match_score': round(float(scores[i]) * 100),
            }
            for i in range(len(dest_ids))
        ]
        
        # Sort highest match first
        return sorted(results, key=lambda x: x['match_score'], reverse=True)
    
    finally:
        if db:
            db.close()


def update_user_vector_from_interaction(
    current_preferences: dict,
    dest_id: int,
    action: str,
    db: Session = None
) -> dict:
    """
    Nudge user preferences based on what they interacted with.
    """
    if db is None:
        db = SessionLocal()
    
    try:
        action_weights = {
            'view': 0.05,
            'wishlist': 0.10,
            'book': 0.20,
            'ignore': -0.05,
        }
        
        weight = action_weights.get(action, 0.05)
        
        # Get destination vector from DATABASE
        dest_vectors = get_destination_vectors(db)
        dest_vec = dest_vectors.get(dest_id)
        
        if not dest_vec:
            return current_preferences
        
        updated = dict(current_preferences)
        for i, feature in enumerate(FEATURES):
            current_val = updated.get(feature, 0.5)
            nudge = dest_vec[i] * weight
            new_val = current_val + nudge
            updated[feature] = round(min(1.0, max(0.0, new_val)), 4)
        
        return updated
    
    finally:
        if db:
            db.close()


# For testing - print destination vectors
if __name__ == "__main__":
    db = SessionLocal()
    vectors = get_destination_vectors(db)
    print(f"📊 Loaded {len(vectors)} destinations from database:")
    for dest_id, vec in vectors.items():
        dest = db.query(Destination).filter(Destination.id == dest_id).first()
        print(f"  {dest_id}: {dest.name if dest else 'Unknown'} - {vec}")
    db.close()