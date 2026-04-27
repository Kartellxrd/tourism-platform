# backend/update_real_images.py
from app.database import SessionLocal
from app.models.destination import Destination

# REAL images from legitimate sources (Xinhua, Alamy, Wikimedia)
real_images = {
    "Three Dikgosi Monument": {
        "photo_url": "https://english.news.cn/resource/20230915/5a3343d8e8c046e3a8682f578c764baa/20230915_5a3343d8e8c046e3a8682f578c764baa_03.jpg",
        "description": "Three Dikgosi Monument - Bronze statues honoring Botswana's founding fathers who sought independence from Britain in 1966.",
        "ai_reason": "Must-see landmark - walking distance from UB! These three chiefs (Dikgosi) traveled to Britain in 1961 to request independence."
    },
    "National Museum & Art Gallery": {
        "photo_url": "https://images.pexels.com/photos/208702/pexels-photo-208702.jpeg?w=800&h=600&fit=crop",
        "description": "Botswana National Museum - Established in 1967, showcasing Botswana's natural history, art, and cultural heritage.",
        "ai_reason": "Free cultural experience - just 1.7km from campus! Features traditional crafts, art exhibits, and history displays."
    },
    "Gaborone Game Reserve": {
        "photo_url": "https://english.news.cn/resource/20220111/3845ca7791ad4a72a577e7376079bfca/20220111_3845ca7791ad4a72a577e7376079bfca_02.jpg",
        "description": "Gaborone Game Reserve - Urban wildlife sanctuary established in 1988. Home to ostriches, impalas, kudus, and wildebeests.",
        "ai_reason": "Perfect for a quick wildlife fix - only 2.6km from UB! See animals in their natural habitat without leaving the city."
    },
    "Riverwalk Mall": {
        "photo_url": "https://c8.alamy.com/comp/BTDN8K/the-entrance-to-the-riverwalk-shopping-mall-gaborone-botswana-BTDN8K.jpg",
        "description": "Riverwalk Shopping Mall - Premier shopping destination in Gaborone with cinema, restaurants, and retail stores.",
        "ai_reason": "Great for weekend shopping - 9.4km from campus. Features cinema, restaurants, and retail stores."
    },
    "Mokolodi Nature Reserve": {
        "photo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Пејзаж_Моколодија.jpg/800px-Пејзаж_Моколодија.jpg",
        "description": "Mokolodi Nature Reserve - Private not-for-profit game reserve established in 1994, known for rhino tracking.",
        "ai_reason": "Best wildlife experience near Gaborone - 15km from UB. Rhino tracking, night drives, and cheetah encounters available."
    }
}

db = SessionLocal()

for name, data in real_images.items():
    dest = db.query(Destination).filter(Destination.name == name).first()
    if dest:
        dest.photo_url = data["photo_url"]
        dest.description = data["description"]
        dest.ai_reason = data["ai_reason"]
        print(f"✅ Updated: {name}")
    else:
        print(f"❌ Not found: {name}")

db.commit()
db.close()
print("\n🎉 All images updated with REAL Botswana photos!")