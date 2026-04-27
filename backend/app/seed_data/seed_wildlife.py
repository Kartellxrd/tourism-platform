from app.database import SessionLocal
from app.models.wildlife import WildlifeSighting, WildlifeCalendar

db = SessionLocal()

# Clear existing data
db.query(WildlifeSighting).delete()
db.query(WildlifeCalendar).delete()

# ============ WILDLIFE SIGHTINGS ============
wildlife_data = [
    # Lions
    {"destination_id": 7, "animal_name": "Lion", "animal_category": "Predator",
     "best_months": [5,6,7,8,9,10], "best_hours_start": 6, "best_hours_end": 10,
     "probability_rating": 95, "viewing_tips": "Look near water sources during dry season. Early morning drives are best.",
     "habitat": "Savanna"},
    {"destination_id": 5, "animal_name": "Lion", "animal_category": "Predator",
     "best_months": [6,7,8,9], "best_hours_start": 6, "best_hours_end": 9,
     "probability_rating": 85, "viewing_tips": "Guided night drives available. Ask at reception.",
     "habitat": "Savanna"},
    
    # Elephants
    {"destination_id": 7, "animal_name": "Elephant", "animal_category": "Herbivore",
     "best_months": [4,5,6,7,8,9,10], "best_hours_start": 7, "best_hours_end": 11,
     "probability_rating": 98, "viewing_tips": "Chobe has 50,000+ elephants. Best seen on river cruises at sunset.",
     "habitat": "Riverine"},
    {"destination_id": 6, "animal_name": "Elephant", "animal_category": "Herbivore",
     "best_months": [5,6,7,8,9,10], "best_hours_start": 7, "best_hours_end": 10,
     "probability_rating": 90, "viewing_tips": "Look for elephants along delta channels during morning.",
     "habitat": "Water"},
    {"destination_id": 1, "animal_name": "Elephant", "animal_category": "Herbivore",
     "best_months": [1,2,3,4,5,6,7,8,9,10,11,12], "best_hours_start": 8, "best_hours_end": 16,
     "probability_rating": 60, "viewing_tips": "Small population but visible year-round.",
     "habitat": "Woodland"},
    
    # Rhinos
    {"destination_id": 5, "animal_name": "Rhino", "animal_category": "Big Five",
     "best_months": [5,6,7,8], "best_hours_start": 7, "best_hours_end": 10,
     "probability_rating": 95, "viewing_tips": "Guided rhino tracking walks available. Book in advance!",
     "habitat": "Bushland"},
    
    # Leopards
    {"destination_id": 5, "animal_name": "Leopard", "animal_category": "Predator",
     "best_months": [5,6,7,8,9,10], "best_hours_start": 17, "best_hours_end": 19,
     "probability_rating": 70, "viewing_tips": "Leopards are nocturnal. Look in trees during late afternoon.",
     "habitat": "Woodland"},
    
    # Cheetahs
    {"destination_id": 5, "animal_name": "Cheetah", "animal_category": "Predator",
     "best_months": [6,7,8,9], "best_hours_start": 7, "best_hours_end": 10,
     "probability_rating": 75, "viewing_tips": "Cheetah encounters available. Early morning is best.",
     "habitat": "Open Plains"},
    
    # Hippos
    {"destination_id": 7, "animal_name": "Hippo", "animal_category": "Herbivore",
     "best_months": [4,5,6,7,8,9,10], "best_hours_start": 10, "best_hours_end": 16,
     "probability_rating": 90, "viewing_tips": "Best seen on river cruises. Keep safe distance!",
     "habitat": "Water"},
    
    # Zebras
    {"destination_id": 1, "animal_name": "Zebra", "animal_category": "Herbivore",
     "best_months": [1,2,3,4,5,6,7,8,9,10,11,12], "best_hours_start": 8, "best_hours_end": 16,
     "probability_rating": 95, "viewing_tips": "Common throughout Gaborone Game Reserve.",
     "habitat": "Grassland"},
    
    # Giraffes
    {"destination_id": 5, "animal_name": "Giraffe", "animal_category": "Herbivore",
     "best_months": [5,6,7,8,9,10], "best_hours_start": 8, "best_hours_end": 11,
     "probability_rating": 80, "viewing_tips": "Look for them in open woodland areas.",
     "habitat": "Savanna"},
]

# ============ CALENDAR DATA ============
calendar_data = [
    {"month": 1, "month_name": "January", 
     "events": ["Green Season", "Bird Watching Peak", "Zebra Foaling"],
     "wildlife_rating": 6, "pros": ["Lush landscapes", "Fewer tourists", "Lower prices"],
     "cons": ["Hot and humid", "Possible rain"], "avg_temp_high": 32, "avg_temp_low": 20,
     "rainfall_mm": 80, "season_type": "Green Season"},
    
    {"month": 2, "month_name": "February",
     "events": ["Green Season", "Bird Watching Peak", "Calving Season"],
     "wildlife_rating": 6, "pros": ["Baby animals", "Great photography", "Quiet camps"],
     "cons": ["Still hot", "Afternoon showers"], "avg_temp_high": 32, "avg_temp_low": 20,
     "rainfall_mm": 75, "season_type": "Green Season"},
    
    {"month": 3, "month_name": "March",
     "events": ["End of Green Season", "Bird Migration"],
     "wildlife_rating": 7, "pros": ["Ending rains", "Still lush", "Good prices"],
     "cons": ["Can still be humid"], "avg_temp_high": 31, "avg_temp_low": 19,
     "rainfall_mm": 60, "season_type": "Shoulder"},
    
    {"month": 4, "month_name": "April",
     "events": ["Dry Season Begins", "Elephant Gathering", "Excellent Safari"],
     "wildlife_rating": 9, "pros": ["Dry weather", "Animals gather at water", "Perfect temps"],
     "cons": ["Prices starting to rise"], "avg_temp_high": 30, "avg_temp_low": 17,
     "rainfall_mm": 30, "season_type": "Shoulder"},
    
    {"month": 5, "month_name": "May",
     "events": ["Peak Dry Season", "Lion Hunting Peak", "Wildlife Peak"],
     "wildlife_rating": 10, "pros": ["Best wildlife viewing", "Perfect weather", "No rain"],
     "cons": ["High season prices", "Book in advance"], "avg_temp_high": 28, "avg_temp_low": 14,
     "rainfall_mm": 10, "season_type": "Peak"},
    
    {"month": 6, "month_name": "June",
     "events": ["Peak Dry Season", "Elephant Peak", "Excellent Photography"],
     "wildlife_rating": 10, "pros": ["Crisp mornings", "Excellent visibility", "Prime viewing"],
     "cons": ["Cold mornings", "Highest prices"], "avg_temp_high": 25, "avg_temp_low": 10,
     "rainfall_mm": 5, "season_type": "Peak"},
    
    {"month": 7, "month_name": "July",
     "events": ["Peak Dry Season", "Elephant Peak", "Peak Tourism"],
     "wildlife_rating": 10, "pros": ["Best game viewing", "Perfect safari weather"],
     "cons": ["Most expensive", "Crowded"], "avg_temp_high": 25, "avg_temp_low": 8,
     "rainfall_mm": 5, "season_type": "Peak"},
    
    {"month": 8, "month_name": "August",
     "events": ["Peak Dry Season", "Elephant Peak", "Excellent Visibility"],
     "wildlife_rating": 10, "pros": ["Prime game viewing", "Beautiful sunsets"],
     "cons": ["Peak prices", "Still busy"], "avg_temp_high": 27, "avg_temp_low": 10,
     "rainfall_mm": 5, "season_type": "Peak"},
    
    {"month": 9, "month_name": "September",
     "events": ["Late Dry Season", "Predator Peak", "Excellent Safari"],
     "wildlife_rating": 10, "pros": ["Last chance before rains", "Animals at water"],
     "cons": ["Getting hot", "Still high season"], "avg_temp_high": 30, "avg_temp_low": 14,
     "rainfall_mm": 10, "season_type": "Peak"},
    
    {"month": 10, "month_name": "October",
     "events": ["Dry Season End", "Elephant Peak", "Pre-rain heat"],
     "wildlife_rating": 9, "pros": ["Excellent wildlife viewing", "Fewer crowds late month"],
     "cons": ["Very hot", "Hazy skies possible"], "avg_temp_high": 33, "avg_temp_low": 18,
     "rainfall_mm": 20, "season_type": "Peak"},
    
    {"month": 11, "month_name": "November",
     "events": ["Green Season Begins", "Birding Peak", "First Rains"],
     "wildlife_rating": 7, "pros": ["Lower prices", "Dramatic skies", "Baby animals"],
     "cons": ["Afternoon showers", "Humid"], "avg_temp_high": 32, "avg_temp_low": 19,
     "rainfall_mm": 40, "season_type": "Shoulder"},
    
    {"month": 12, "month_name": "December",
     "events": ["Green Season", "Birding Peak", "Calving Season"],
     "wildlife_rating": 6, "pros": ["Festive atmosphere", "Lush scenery", "Good birding"],
     "cons": ["Hot and humid", "Afternoon storms"], "avg_temp_high": 31, "avg_temp_low": 19,
     "rainfall_mm": 70, "season_type": "Green Season"},
]

# Insert data
for data in wildlife_data:
    sighting = WildlifeSighting(**data)
    db.add(sighting)

for data in calendar_data:
    calendar = WildlifeCalendar(**data)
    db.add(calendar)

db.commit()

print(f"✅ Added {len(wildlife_data)} wildlife sightings")
print(f"✅ Added {len(calendar_data)} calendar entries")

# Verify
print("\n📊 Verification:")
print(f"Wildlife sightings count: {db.query(WildlifeSighting).count()}")
print(f"Calendar entries count: {db.query(WildlifeCalendar).count()}")

# Show sample
sample = db.query(WildlifeSighting).first()
if sample:
    print(f"\n📋 Sample: {sample.animal_name} at dest {sample.destination_id}")

db.close()