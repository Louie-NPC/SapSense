# Mobile App Assigned Trees Fix - Debug Checklist

## ✅ Applied Fixes

### 1. **Fixed camelCase vs snake_case Mismatch** (`FarmerDashboardScreen.tsx`)
- Changed `user?.assignedTrees` to properly access the property that's already converted by AuthContext
- The AuthContext converts API's `assigned_trees` → `assignedTrees` on login (line 104)
- Frontend code now correctly uses `assignedTrees` consistently

### 2. **Improved Error Logging in Mobile API** (`api.ts`)
Updated the `catch` block in `apiRequest` function to show detailed error information:
```typescript
} catch(error: any) {
  console.error(`API Request Error [${endpoint}]:`, error.message, error.stack);
  throw error;
}
```

### 3. **Added Detailed Console Logs** (`FarmerDashboardScreen.tsx`)
Added comprehensive logging to track the data flow:
- 🌳 Logs the exact `user.id` being used to fetch trees
- ✅ Shows the length and details of array returned by `treesApi.getByFarmer(user.id)`
- Includes `assigned_farmer_id` for each tree to verify database matching
- 🔄 Enhanced fallback logging when triggered
- JSON.stringify output for better readability of tree data

---

## 🔍 Manual Debugging Steps

Follow these steps to identify why trees aren't showing up:

### Step 1: Check User Authentication Data
Run your app and after login, check the terminal/console logs for:
```
=== FETCH TREES START ===
User ID: <your-user-id>
User assignedTrees: ["tree-id-1", "tree-id-2", ...]
```

**What to verify:**
- ✅ User ID is present and matches your database
- ✅ `assignedTrees` array contains tree IDs (not empty)

---

### Step 2: Verify Database Tree Assignment
Check the logs for:
```
🌳 Fetching trees for farmer ID: <your-user-id>
✅ Trees from getByFarmer API: <count> trees: [...]
```

**What to verify:**
- ✅ Count is greater than 0
- ✅ Each tree object has correct `assigned_farmer_id` matching the user ID
- ✅ Tree IDs and names are present

**If count is 0**, run this SQL query to verify database state:
```sql
SELECT id, name, assigned_farmer_id, assigned_farmer_name 
FROM trees 
WHERE assigned_farmer_id = '<your-user-id>';
```

---

### Step 3: Check Fallback Logic (if needed)
If `getByFarmer` returns 0 trees but user has `assignedTrees`, you'll see:
```
🔄 Fallback triggered! User has assignedTrees: ["tree-id-1", ...]
Fetching all trees to filter by assignedTrees...
All trees from API: <total-count>
Filtered trees count: <filtered-count> trees: [...]
```

**What to verify:**
- ✅ Fallback finds trees when filtering by assignedTrees
- ✅ Filtered count matches expected number of assigned trees

---

### Step 4: Verify Database Schema Matching
The most common issue is mismatch between:
- `user.id` from authentication
- `assigned_farmer_id` in trees table

**Run this diagnostic query:**
```sql
-- Check if user exists and get their ID
SELECT id, name, email, role FROM users WHERE email = '<your-email>';

-- Check trees assigned to this user
SELECT t.id, t.name, t.assigned_farmer_id, t.assigned_farmer_name, u.name as farmer_name
FROM trees t
LEFT JOIN users u ON t.assigned_farmer_id = u.id
WHERE t.assigned_farmer_id = '<user-id-from-step-1>';
```

**Expected result:**
- User should exist with the same ID being logged
- Trees should have `assigned_farmer_id` exactly matching the user ID

---

### Step 5: Test API Endpoint Directly
Use curl or Postman to test the API endpoint:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://192.168.19.187:3001/api/trees/farmer/YOUR_USER_ID
```

**Expected response:** Array of tree objects with correct `assigned_farmer_id`

---

## 🎯 Common Issues & Solutions

### Issue 1: `getByFarmer` Returns Empty Array
**Cause:** Database `assigned_farmer_id` doesn't match `user.id`

**Solution:**
```sql
UPDATE trees 
SET assigned_farmer_id = '<correct-user-id>' 
WHERE assigned_farmer_id = '<wrong-id-or-null>';
```

---

### Issue 2: User Has No assignedTrees Array
**Cause:** User object not properly loaded or user role is not 'farmer'

**Solution:**
- Verify user role in database: `SELECT role FROM users WHERE id = '<user-id>';`
- Check AuthContext stores assignedTrees only for farmers
- Re-login to refresh user data

---

### Issue 3: Network/API Connection Error
**Cause:** Cannot reach backend server at `http://192.168.19.187:3001`

**Solution:**
- Verify server is running: Check terminal for "Server running on port 3001"
- Verify IP address is correct for your network
- Check firewall settings allow port 3001
- Try: `ping 192.168.19.187`

---

### Issue 4: Harvest Stats Load But Trees Don't
**Cause:** Different API endpoints with different permission/logic

**What to check:**
- Harvest stats use: `/harvest/farmer/:farmerId/stats`
- Trees use: `/trees/farmer/:farmerId`
- Both should work with same farmer ID
- Check backend logs for errors on `/trees/farmer/:id` endpoint

---

## 📱 Testing After Fix

1. **Clear app data** and re-login to ensure fresh user data
2. **Watch console logs** during fetch
3. **Verify tree cards appear** in the UI
4. **Pull to refresh** to trigger refetch
5. **Check all filters** (All, Harvest, Critical, etc.) work

---

## 🚀 Next Steps If Still Not Working

1. **Share your console logs** showing:
   - User ID and assignedTrees
   - Results from `getByFarmer` API call
   - Any error messages

2. **Share database query results** from Step 4

3. **Check backend server logs** for errors when mobile app calls `/api/trees/farmer/:id`

4. **Verify both web and mobile use same backend URL** (web: localhost, mobile: IP address)

---

## 📝 Summary of Changes Made

| File | Change | Purpose |
|------|--------|---------|
| `FarmerDashboardScreen.tsx` | Enhanced console.log statements | Track data flow and identify where trees are lost |
| `FarmerDashboardScreen.tsx` | Fixed property access to `assignedTrees` | Ensure fallback logic triggers correctly |
| `api.ts` | Improved error logging with message + stack | See actual network/parsing errors instead of generic message |

---

**Remember:** The web version works, so the backend is functioning. The issue is either:
1. Mobile app using different user ID than web
2. Mobile app not receiving/handling the response correctly
3. Database assignment mismatch

The enhanced logs will pinpoint exactly where the problem occurs! 🎯
