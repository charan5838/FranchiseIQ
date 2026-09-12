import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

from app.seed.seed_data import init_db, seed_all_data
init_db()
seed_all_data()

client = TestClient(app)


print('--- 1. Testing /health ---')
res = client.get('/health')
assert res.status_code == 200, f'Health failed: {res.text}'
print('Health:', res.json())

print('\n--- 2. Testing /api/sectors ---')
res = client.get('/api/sectors')
assert res.status_code == 200, f'Sectors failed: {res.text}'
sectors = res.json()
print(f'Retrieved {len(sectors)} sectors.')
assert len(sectors) == 12, f'Expected 12 sectors, got {len(sectors)}'

print('\n--- 3. Testing /api/franchises ---')
res = client.get('/api/franchises')
assert res.status_code == 200, f'Franchises failed: {res.text}'
franchises = res.json()
print(f'Retrieved {len(franchises)} franchises.')
assert len(franchises) >= 120, f'Expected 120+ franchises, got {len(franchises)}'

print('\n--- 4. Testing Manual Filters on List Franchise page ---')
# Test space filters: min_sqft=400, max_sqft=1000
res_filtered = client.get('/api/franchises?min_sqft=500&max_sqft=1200&monthly_revenue=200000&monthly_profit=40000')
assert res_filtered.status_code == 200
filtered_franchises = res_filtered.json()
print(f'Filtered franchises matching manual criteria: {len(filtered_franchises)}')
assert len(filtered_franchises) > 0

print('\n--- 5. Testing Franchise Detail ---')
sample_slug = franchises[0]['slug']
res = client.get(f'/api/franchises/{sample_slug}')
detail = res.json()
print("Detail for " + detail["name"] + ": Investment = " + str(detail["total_investment"]) + ", Fee = " + str(detail["franchise_fee"]))


assert detail['investment'] is not None
assert detail['financial'] is not None

print('\n--- 6. Testing Sector Profit Leaders ---')
res = client.get('/api/franchises/sector-profit-leaders')
assert res.status_code == 200
leaders = res.json()
print(f'Retrieved profit leaders for {len(leaders)} sectors.')

print('\n--- 7. Testing Comparison Engine ---')
comp_ids = [franchises[0]['id'], franchises[1]['id']]
res = client.post('/api/comparison/compare', json={'franchise_ids': comp_ids})
assert res.status_code == 200, f'Comparison failed: {res.text}'
comp_res = res.json()
print("Compared franchises count: " + str(len(comp_res["franchises"])))

print('\n--- 8. Testing Financial Calculator ---')
res = client.get('/api/calculator/franchise-presets')
assert res.status_code == 200
presets = res.json()
print(f'Retrieved {len(presets)} calculator presets.')

calc_payload = {
    'avg_customers_daily': 120,
    'avg_ticket_value': 350,
    'operating_days': 30,
    'cogs_pct': 35,
    'monthly_rent': 60000,
    'employee_salaries': 50000,
    'utilities': 20000,
    'marketing': 10000,
    'maintenance': 5000,
    'platform_commission': 15000,
    'tech_fees': 3000,
    'other_expenses': 5000,
    'royalty_pct': 5,
    'royalty_fixed': 0,
    'total_investment': 3000000
}
res = client.post('/api/calculator/calculate', json=calc_payload)
assert res.status_code == 200
calc_out = res.json()
print("Calculator revenue: " + str(calc_out["revenue"]) + ", monthly profit: " + str(calc_out["monthly_net_profit"]))

print('\n--- 9. Testing Recommendation Engine ---')
rec_payload = {
    'budget': 3500000,
    'city': 'Hyderabad',
    'locality': 'Madhapur',
    'shop_area_sqft': 800,
    'business_experience': '1-3 years',
    'desired_involvement': 'Active Management',
    'risk_preference': 'Medium',
    'goal': 'Balanced Growth',
    'desired_return_pct': 25,
    'max_payback_months': 36
}
res = client.post('/api/recommendations/rank', json=rec_payload)
assert res.status_code == 200
ranks = res.json()
print("Ranked recommendations count: " + str(len(ranks)) + ", Top pick: " + ranks[0]["name"])


print('\n--- 10. Testing Support & Chatbot ---')
sup_res = client.post('/api/support', json={
    'name': 'Test Investor',
    'email': 'test@investor.com',
    'category': 'Franchise Data',
    'subject': 'Inquiry regarding Domino\'s profit margins',
    'message': 'Please clarify how Claim Gap is computed for Domino\'s.'
})
assert sup_res.status_code == 200
print('Support ticket created:', sup_res.json()['id'])

chat_res = client.post('/api/help/chat', json={
    'message': 'Tell me about Domino\'s Pizza'
})
assert chat_res.status_code == 200
print('Chatbot response snippet:', chat_res.json()['reply'][:100] + '...')

fb_res = client.post('/api/feedback', json={
    'rating': 5,
    'category': 'General',
    'message': 'The MongoDB migration is super fast and clean!'
})
assert fb_res.status_code == 200
print('Feedback created:', fb_res.json()['id'])

print('\n--- 11. Testing Demo Auth Login ---')
login_res = client.post('/api/auth/login', json={
    'email': 'investor@franchiseiq.com',
    'password': 'Investor@123'
})
assert login_res.status_code == 200
print('Investor login success. Token:', login_res.json()['access_token'][:20] + '...')

print('\n========================================')
print('ALL TESTS PASSED WITH 100% SUCCESS!')
print('========================================')
