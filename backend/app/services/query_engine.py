# backend/app/services/query_engine.py

from datetime import datetime
from services.ai_engine import get_recommendations, FEATURES

DESTINATION_INFO = {
    1:  { 'name': 'Okavango Delta',              'location': 'Maun',           'price': 4500 },
    2:  { 'name': 'Chobe National Park',         'location': 'Kasane',         'price': 5100 },
    3:  { 'name': 'Makgadikgadi Pans',           'location': 'Nata',           'price': 3200 },
    4:  { 'name': 'Central Kalahari',            'location': 'Ghanzi',         'price': 2900 },
    5:  { 'name': 'Moremi Game Reserve',         'location': 'Moremi',         'price': 4800 },
    6:  { 'name': 'Nxai Pan National Park',      'location': 'Maun',           'price': 2600 },
    7:  { 'name': 'Tsodilo Hills',               'location': 'Shakawe',        'price': 1800 },
    8:  { 'name': 'Khama Rhino Sanctuary',       'location': 'Serowe',         'price': 1500 },
    9:  { 'name': 'Savuti Marsh',                'location': 'Chobe',          'price': 3800 },
    10: { 'name': 'Linyanti Wetlands',           'location': 'Linyanti',       'price': 5500 },
    11: { 'name': 'Tuli Block',                  'location': 'Selebi-Phikwe',  'price': 3100 },
    12: { 'name': 'Gcwihaba Caves',              'location': 'Ghanzi',         'price': 1200 },
    13: { 'name': 'Kgalagadi Transfrontier',     'location': 'Tsabong',        'price': 2400 },
    14: { 'name': 'Mokolodi Nature Reserve',     'location': 'Gaborone',       'price':  900 },
    15: { 'name': 'Gaborone Game Reserve',       'location': 'Gaborone',       'price':  600 },
}

SEASONAL_DATA = {
    1:  {
        'best_months':  ['April', 'May', 'June', 'July', 'August'],
        'peak_season':  'June to August',
        'avoid':        ['December', 'January', 'February'],
        'why':          'Flood season peaks June–August, concentrating wildlife near water channels. Perfect for mokoro canoe safaris.',
        'current_tip':  'Water levels rising — excellent mokoro and boat safari conditions.',
    },
    2:  {
        'best_months':  ['July', 'August', 'September', 'October'],
        'peak_season':  'July to October',
        'avoid':        ['January', 'February'],
        'why':          'Dry season forces elephants to the river. Largest elephant herds visible in October.',
        'current_tip':  'Peak elephant season — river cruises are spectacular right now.',
    },
    3:  {
        'best_months':  ['November', 'December', 'January', 'February'],
        'peak_season':  'November to February',
        'avoid':        ['June', 'July', 'August'],
        'why':          'Rainy season brings flamingos and the zebra migration. Salt pans fill with water.',
        'current_tip':  'Dry season now — great for quad biking and stargazing.',
    },
    4:  {
        'best_months':  ['May', 'June', 'July', 'August', 'September'],
        'peak_season':  'May to September',
        'avoid':        ['December', 'January'],
        'why':          'Dry winter months are best for game viewing. Lions are highly active.',
        'current_tip':  'Good season for desert drives and Bushmen cultural experiences.',
    },
    5:  {
        'best_months':  ['June', 'July', 'August', 'September', 'October'],
        'peak_season':  'June to October',
        'avoid':        ['January', 'February'],
        'why':          'Year-round Big Five sightings but dry season offers best visibility.',
        'current_tip':  'Excellent Big Five viewing with low vegetation.',
    },
    6:  {
        'best_months':  ['November', 'December', 'January', 'February'],
        'peak_season':  'November to February',
        'avoid':        ['July', 'August'],
        'why':          'Zebra migration and Baines Baobabs are spectacular after rains.',
        'current_tip':  'Visit after first rains for zebra migration spectacle.',
    },
    7:  {
        'best_months':  ['May', 'June', 'July', 'August', 'September'],
        'peak_season':  'May to September',
        'avoid':        ['December', 'January'],
        'why':          'Dry season makes rock art hiking trails accessible and comfortable.',
        'current_tip':  'Perfect hiking conditions to explore the ancient rock paintings.',
    },
    8:  {
        'best_months':  ['March', 'April', 'May', 'June', 'July', 'August'],
        'peak_season':  'March to August',
        'avoid':        ['November', 'December'],
        'why':          'Rhinos are most active in cooler months. Walking safaris are comfortable.',
        'current_tip':  'Great rhino tracking conditions right now.',
    },
    9:  {
        'best_months':  ['June', 'July', 'August', 'September'],
        'peak_season':  'June to September',
        'avoid':        ['January', 'February'],
        'why':          'Predator action is intense in dry season as prey concentrates near water.',
        'current_tip':  'Lions and hyenas extremely active around the marsh.',
    },
    10: {
        'best_months':  ['June', 'July', 'August', 'September', 'October'],
        'peak_season':  'June to October',
        'avoid':        ['January', 'February'],
        'why':          'Wild dog packs and large herds visible during dry season.',
        'current_tip':  'Exclusive remote wilderness at its finest right now.',
    },
    11: {
        'best_months':  ['April', 'May', 'June', 'July', 'August', 'September'],
        'peak_season':  'April to September',
        'avoid':        ['December', 'January'],
        'why':          'Dry season makes horseback safaris comfortable and game plentiful.',
        'current_tip':  'Ideal conditions for horseback safaris through ancient landscapes.',
    },
    12: {
        'best_months':  ['April', 'May', 'June', 'July', 'August'],
        'peak_season':  'April to August',
        'avoid':        ['December', 'January'],
        'why':          'Cool dry months make cave exploration comfortable.',
        'current_tip':  'Perfect temperature for underground cave exploration.',
    },
    13: {
        'best_months':  ['March', 'April', 'May', 'June', 'July'],
        'peak_season':  'March to July',
        'avoid':        ['December', 'January'],
        'why':          'Post-rain season brings Kalahari lions out in the open dunes.',
        'current_tip':  'Good lion and cheetah sightings in the red dunes.',
    },
    14: {
        'best_months':  ['April', 'May', 'June', 'July', 'August', 'September'],
        'peak_season':  'April to September',
        'avoid':        [],
        'why':          'Open year-round. Dry season offers best rhino and game viewing.',
        'current_tip':  'Great family day trip from Gaborone right now.',
    },
    15: {
        'best_months':  ['April', 'May', 'June', 'July', 'August', 'September'],
        'peak_season':  'April to September',
        'avoid':        [],
        'why':          'Urban reserve accessible year-round. Dry season best for game.',
        'current_tip':  'Quick city escape — zebras and giraffes visible today.',
    },
}


def handle_query(query: str, user_preferences: dict = None) -> dict:
    query_lower = query.lower().strip()
    current_month = datetime.now().strftime('%B')

    # ── Find which destination they mention ───────────────────────────────────
    matched_dest_id = None
    matched_dest_name = None
    for dest_id, info in DESTINATION_INFO.items():
        if any(word in query_lower for word in info['name'].lower().split()):
            matched_dest_id = dest_id
            matched_dest_name = info['name']
            break

    # ── Detect intent ─────────────────────────────────────────────────────────
    is_timing    = any(w in query_lower for w in ['now', 'best time', 'when', 'season', 'visit', 'good time', 'right time', 'month'])
    is_budget    = any(w in query_lower for w in ['cheap', 'budget', 'affordable', 'under', 'less than', 'cheapest', 'low cost'])
    is_recommend = any(w in query_lower for w in ['recommend', 'suggest', 'best', 'should i', 'where', 'which'])
    is_weather   = any(w in query_lower for w in ['weather', 'rain', 'hot', 'cold', 'temperature', 'climate'])
    is_greeting  = any(w in query_lower for w in ['hello', 'hi', 'hey', 'help', 'what can you'])
    is_animals   = any(w in query_lower for w in ['lion', 'elephant', 'rhino', 'leopard', 'cheetah', 'wild dog', 'flamingo', 'zebra', 'giraffe'])

    # ── Greeting ──────────────────────────────────────────────────────────────
    if is_greeting:
        return {
            'response': "Dumela! 👋 I'm Pula, your AI tourism assistant for Botswana. I can help you with:\n\n• **Best time to visit** any destination\n• **Budget recommendations** based on your price range\n• **Personalised suggestions** based on your preferences\n• **Wildlife tips** — where to spot specific animals\n\nTry asking: *'Should I visit Okavango Delta now?'* or *'Recommend a cheap safari'*",
            'dest_id': None,
            'action': None,
        }

    # ── Timing question about specific destination ────────────────────────────
    if matched_dest_id and is_timing:
        seasonal = SEASONAL_DATA[matched_dest_id]
        is_good_now = current_month in seasonal['best_months']

        if is_good_now:
            response = f"✅ **{current_month} is a great time** to visit {matched_dest_name}!\n\n{seasonal['why']}\n\n💡 *Right now:* {seasonal['current_tip']}\n\n📅 Peak season is {seasonal['peak_season']}."
        else:
            avoid_note = f" Try to avoid {', '.join(seasonal['avoid'][:2])}." if seasonal['avoid'] else ''
            response = f"⚠️ **{current_month} is not the best time** for {matched_dest_name}.\n\n📅 Best time: **{seasonal['peak_season']}**\n\n{seasonal['why']}{avoid_note}\n\n💡 *Right now:* {seasonal['current_tip']}"

        if user_preferences:
            recs = get_recommendations(user_preferences)
            match = next((r for r in recs if r['dest_id'] == matched_dest_id), None)
            if match:
                response += f"\n\n🤖 Your AI match score for this destination is **{match['match_score']}%**."

        return {
            'response': response,
            'dest_id':  matched_dest_id,
            'action':   'show_destination',
        }

    # ── Budget question ───────────────────────────────────────────────────────
    if is_budget:
        # Extract budget amount if mentioned
        budget_limit = 2000
        import re
        numbers = re.findall(r'\d+', query)
        if numbers:
            budget_limit = int(numbers[0])

        affordable = [
            (dest_id, info)
            for dest_id, info in DESTINATION_INFO.items()
            if info['price'] <= budget_limit
        ]
        affordable.sort(key=lambda x: x[1]['price'])

        if affordable:
            dest_list = '\n'.join([
                f"• **{info['name']}** — P {info['price']:,} ({info['location']})"
                for _, info in affordable[:4]
            ])
            response = f"💰 Here are destinations **under P {budget_limit:,}**:\n\n{dest_list}\n\n💡 Tip: {affordable[0][1]['name']} in {affordable[0][1]['location']} is the most affordable option."
        else:
            response = f"I couldn't find destinations under P {budget_limit:,}. The most affordable option is **Gaborone Game Reserve at P 600**."

        return {
            'response': response,
            'dest_id':  affordable[0][0] if affordable else 15,
            'action':   'show_destination',
        }

    # ── Animal / wildlife question ────────────────────────────────────────────
    if is_animals:
        animal_map = {
            'elephant': [2, 5, 9],
            'lion':     [4, 9, 13],
            'rhino':    [8, 14],
            'leopard':  [5, 9],
            'cheetah':  [13, 4],
            'wild dog': [10, 5],
            'flamingo': [3],
            'zebra':    [6, 3, 15],
            'giraffe':  [15, 14],
        }

        found_animal = None
        found_dests  = []
        for animal, dest_ids in animal_map.items():
            if animal in query_lower:
                found_animal = animal
                found_dests  = dest_ids
                break

        if found_animal and found_dests:
            dest_names = [DESTINATION_INFO[d]['name'] for d in found_dests if d in DESTINATION_INFO]
            seasonal   = SEASONAL_DATA[found_dests[0]]
            response   = f"🦁 Best places to see **{found_animal}s** in Botswana:\n\n"
            response  += '\n'.join([f"• **{name}**" for name in dest_names])
            response  += f"\n\n📅 Best time: **{seasonal['peak_season']}**\n💡 {seasonal['why']}"
            return {
                'response': response,
                'dest_id':  found_dests[0],
                'action':   'show_destination',
            }

    # ── Personalised recommendation ───────────────────────────────────────────
    if is_recommend and user_preferences:
        recs     = get_recommendations(user_preferences)
        top_3    = recs[:3]
        dest_list = '\n'.join([
            f"• **{DESTINATION_INFO[r['dest_id']]['name']}** — {r['match_score']}% match (P {DESTINATION_INFO[r['dest_id']]['price']:,})"
            for r in top_3
            if r['dest_id'] in DESTINATION_INFO
        ])
        seasonal  = SEASONAL_DATA.get(top_3[0]['dest_id'], {})
        best_pick = DESTINATION_INFO[top_3[0]['dest_id']]['name']
        response  = f"🤖 Based on your preferences, here are your **top matches**:\n\n{dest_list}\n\n✨ My top pick for you is **{best_pick}** — {seasonal.get('current_tip', 'great conditions right now')}."
        return {
            'response': response,
            'dest_id':  top_3[0]['dest_id'],
            'action':   'show_destination',
        }

    # ── General recommendation without preferences ────────────────────────────
    if is_recommend:
        response = f"🌍 Top destinations in Botswana right now:\n\n• **Okavango Delta** — UNESCO World Heritage, 97% rated\n• **Chobe National Park** — Africa's densest elephant population\n• **Moremi Game Reserve** — Year-round Big Five\n\n💡 Set your preferences in **Settings → AI Preferences** for personalised recommendations!"
        return {
            'response': response,
            'dest_id':  1,
            'action':   'show_destination',
        }

    # ── Weather question ──────────────────────────────────────────────────────
    if is_weather:
        response = f"🌤️ **Botswana weather in {current_month}:**\n\n Botswana has two main seasons:\n\n• **Dry season (May–October):** Cool and sunny, 15–30°C. Best for game viewing as animals gather near water.\n• **Wet season (Nov–April):** Hot with afternoon rains, 25–40°C. Lush green landscapes, baby animals, flamingos.\n\n💡 Most visitors prefer **June–August** — warm days, cool nights, excellent wildlife density."
        return {
            'response': response,
            'dest_id':  None,
            'action':   None,
        }

    # ── Fallback ──────────────────────────────────────────────────────────────
    return {
        'response': f"I'm not sure about that. Try asking me:\n\n• *'Best time to visit Chobe?'*\n• *'Recommend a safari under P2000'*\n• *'Where can I see elephants?'*\n• *'What's the weather like in Botswana?'*",
        'dest_id':  None,
        'action':   None,
    }