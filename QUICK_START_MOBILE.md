# Quick Start Guide - Mobile App with Real Backend

## The Problem You Had ❌

Your Expo mobile app wasn't showing real farmer data because it was generating **fake random data** instead of connecting to your PostgreSQL backend like the web version does.

---

## The Solution ✅

I've updated the mobile app to:
1. **Connect to your backend server** at `http://localhost:3001/api`
2. **Fetch real farmer data** from PostgreSQL database
3. **Display harvest statistics** (monthly, weekly, today, quality rating)
4. **Support actions** like marking trees as harvested and enabling sleep mode
5. **Auto-refresh** every 5 seconds with real-time updates

---

## How to Run 🚀

### Step 1: Start Your Backend Server
```bash
cd server
npm run dev
```
Keep this running in the background!

### Step 2: Start the Mobile App
```bash
cd CocoSapMobile
npm start
```

Then press:
- **`a`** - Open on Android
- **`i`** - Open on iOS (if available)

### Step 3: Login with Farmer Credentials

**Real Database Users** (from PostgreSQL):
- Use your actual farmer credentials from the database
- Example: `juan@example.com` / `farmer123`

**Fallback Mock Users** (if backend is down):
- Email: `juan@example.com`, Password: `farmer123`
- Email: `maria@example.com`, Password: `farmer123`  
- Email: `pedro@example.com`, Password: `farmer123`

---

## What Changed 📝

### Before (Fake Data):
```typescript
// Generated random numbers
const basePh = 5.2 + Math.random() * 0.4;
const baseVolume = 15 + Math.random() * 8;
// ... fake everything
```

### After (Real API):
```typescript
// Fetches from PostgreSQL via API
const trees = await treesApi.getByFarmer(user.id);
const stats = await harvestApi.getFarmerStats(user.id);
// ... real data from database!
```

---

## New Features Added ✨

### 1. My Harvest Performance Card
Shows your real harvest statistics:
- **This Month**: Total volume harvested this month
- **This Week**: Total volume harvested this week
- **Today**: Total volume harvested today
- **Quality Rating**: Average quality score (out of 5)
- **Total All Time**: Career harvest volume
- **Total Harvests**: Number of harvests recorded

### 2. Action Buttons
Each tree card now has:
- **Mark as Harvested** - Records harvest in database, resets tree volume
- **Enable Sleep Mode** - Puts tree to sleep (resets sensors to 0)
- **Wake Up Tree** - Wakes up sleeping tree (resumes monitoring)

### 3. Auto-Refresh
- Updates every 5 seconds automatically
- Pull down to manually refresh
- Shows loading indicator while refreshing

---

## File Structure 📂

```
CocoSapMobile/
├── src/
│   ├── services/
│   │   └── api.ts              ← NEW: API service layer
│   ├── screens/
│   │   └── FarmerDashboardScreen.tsx  ← UPDATED: Now uses real API
│   └── contexts/
│       └── AuthContext.tsx     ← UPDATED: Stores JWT token
```

---

## API Endpoints Used 🔌

The mobile app calls these endpoints on your backend:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login` | POST | User login |
| `/api/trees/farmer/:id` | GET | Get trees assigned to farmer |
| `/api/trees` | GET | Get all trees (fallback) |
| `/api/trees/:id/harvest` | POST | Mark tree as harvested |
| `/api/trees/:id/sleep-mode` | PUT | Toggle sleep mode |
| `/api/harvest/farmer/:id/stats` | GET | Get farmer statistics |

---

## Troubleshooting 🔧

### "Unable to fetch tree data"
✅ **Fix:** Make sure backend server is running on port 3001

### No trees showing up
✅ **Fix:** 
1. Check if farmer has trees assigned in database
2. Look at console logs for errors
3. Verify `assigned_farmer_id` matches user ID

### Login not working
✅ **Fix:**
1. Check backend is running
2. Verify user exists in database
3. App will fallback to mock users if backend is down

---

## Testing Checklist ✅

Before using the app:

- [ ] Backend server running (`npm run dev` in `server/`)
- [ ] Database set up with farmers and trees
- [ ] Farmers have trees assigned (`assigned_farmer_id`)
- [ ] Harvest records table exists
- [ ] Mobile app started (`npm start` in `CocoSapMobile/`)

When logged in:

- [ ] Trees load from database (not random)
- [ ] "My Harvest Performance" shows real stats
- [ ] Can mark trees as harvested
- [ ] Can toggle sleep mode
- [ ] Data auto-refreshes every 5 seconds
- [ ] Pull-to-refresh works

---

## Key Differences from Web Version 📊

| Feature | Web App | Mobile App |
|---------|---------|------------|
| Data Source | PostgreSQL ✅ | PostgreSQL ✅ |
| Authentication | JWT ✅ | JWT ✅ |
| Real-time Updates | 5s polling ✅ | 5s polling ✅ |
| Harvest Actions | Yes ✅ | Yes ✅ |
| Sleep Mode | Yes ✅ | Yes ✅ |
| Offline Mode | No ❌ | Yes ✅ (fallback) |
| UI Framework | React + shadcn/ui | React Native |

**Both apps now show the SAME real-time data!** 🎉

---

## Example Workflow 🌴

1. **Start backend**: `cd server && npm run dev`
2. **Start mobile**: `cd CocoSapMobile && npm start`
3. **Login** as farmer: `juan@example.com` / `farmer123`
4. **View trees** assigned to you with REAL sensor data
5. **Check stats** in "My Harvest Performance" section
6. **Mark tree as harvested** when pH is optimal (5.0-5.5)
7. **Enable sleep mode** after harvest (resets sensors to 0)
8. **Wake up tree** when ready to resume collection

All actions are saved to your PostgreSQL database in real-time! 💾

---

## Need Help? 💡

### Check Console Logs
Look at the terminal where Expo is running for error messages.

### Check Backend Logs
Look at the terminal where the backend server is running.

### Verify Database
Make sure your PostgreSQL has:
- Users table with farmers
- Trees table with `assigned_farmer_id` column
- Harvest records table

### Test Backend Directly
Try accessing: `http://localhost:3001/api/health`
Should return: `{"status": "ok", "message": "Server is running"}`

---

## Summary 🎯

**Problem:** Mobile app showed fake random data instead of real backend data

**Solution:** Integrated API service to fetch real data from PostgreSQL

**Result:** Both web and mobile apps now show the same real-time data! ✨

You can now:
- ✅ Run web app and mobile app simultaneously
- ✅ See same data on both platforms
- ✅ Perform actions that sync across both apps
- ✅ Track harvest performance in real-time
- ✅ Monitor trees with accurate sensor data

**Enjoy your fully integrated SapSense mobile app!** 🥥🌴
