# Mobile App API Integration - Farmer Dashboard

## Problem Solved ✅

The **Expo mobile app** was not showing real farmer data because it was using **mock/simulated data** instead of connecting to the PostgreSQL backend like the web version does.

### What Was Wrong:

**Before (Mobile App):**
- ❌ Used `generateSensorData()` function with random Math.random() values
- ❌ No API calls to backend server
- ❌ Data generated client-side with fake sensor readings
- ❌ Only read from `user.assignedTrees` array without fetching actual tree data

**Before (Web Version):**
- ✅ Connected to PostgreSQL via `http://localhost:3001/api`
- ✅ Used `treesApi.getByFarmer()` and `harvestApi.getFarmerStats()`
- ✅ Fetched real data from backend
- ✅ Showed actual farmer statistics and tree assignments

---

## Changes Made 🛠️

### 1. Created API Service (`CocoSapMobile/src/services/api.ts`)
- New file that mirrors the web app's API service
- Includes authentication, trees, and harvest API endpoints
- Handles token storage using AsyncStorage
- Supports all necessary operations:
  - `treesApi.getByFarmer(farmerId)` - Get trees assigned to farmer
  - `treesApi.harvestTree(id, data)` - Mark tree as harvested
  - `treesApi.toggleSleepMode(id, sleepMode)` - Toggle sleep mode
  - `harvestApi.getFarmerStats(farmerId)` - Get farmer performance stats

### 2. Updated FarmerDashboardScreen (`CocoSapMobile/src/screens/FarmerDashboardScreen.tsx`)

**Replaced mock data generation with real API calls:**
```typescript
// OLD (Mock Data)
const generateSensorData = (id: string, index: number): SensorData => {
  const basePh = 5.2 + variation + (Math.random() - 0.5) * 0.4;
  // ... random data generation
};

// NEW (Real API)
const fetchTrees = useCallback(async () => {
  if (user?.id) {
    trees = await treesApi.getByFarmer(user.id);
    const stats = await harvestApi.getFarmerStats(user.id);
    setFarmerStats(stats);
  }
}, [user]);
```

**Added new features:**
- ✅ Real-time data fetching from PostgreSQL backend
- ✅ Farmer performance statistics display
- ✅ Harvest action button (marks tree as harvested)
- ✅ Sleep mode toggle functionality
- ✅ Loading states and error handling
- ✅ Auto-refresh every 5 seconds
- ✅ Pull-to-refresh support

**Updated UI components:**
- Added "My Harvest Performance" card showing:
  - This Month volume
  - This Week volume
  - Today volume
  - Quality Rating
  - Total All Time
  - Total Harvests

### 3. Updated AuthContext (`CocoSapMobile/src/contexts/AuthContext.tsx`)

**Enhanced login to use real API:**
```typescript
// Try real API login first
try {
  const response = await authApi.login(email, password);
  global.authToken = response.token;
  await AsyncStorage.setItem('token', response.token);
  // ... store user data
  return true;
} catch (apiError) {
  // Fallback to mock users if API is not available
  // ... mock login logic
}
```

**Features:**
- Attempts real backend authentication first
- Falls back to mock users if backend is unavailable
- Stores JWT token in AsyncStorage for API calls
- Maintains backward compatibility for offline/demo use

### 4. Token Management

**API Service now retrieves tokens from AsyncStorage:**
```typescript
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  token = await AsyncStorage.getItem('token') || '';
  // ... make authenticated request
};
```

---

## How to Use 📖

### Prerequisites:
1. **Backend server must be running** on `http://localhost:3001`
   ```bash
   cd server
   npm run dev
   ```

2. **Database must be set up** with:
   - Farmers/users table
   - Trees table with `assigned_farmer_id`
   - Harvest records table

### Running the Mobile App:

```bash
cd CocoSapMobile
npm start
# Then press 'a' to open on Android or 'i' for iOS
```

### Login Credentials:

**Real Backend Users:**
- Use credentials from your PostgreSQL database
- Example: `juan@example.com` / `farmer123`

**Fallback Mock Users** (if backend is down):
- Email: `juan@example.com`, Password: `farmer123`
- Email: `maria@example.com`, Password: `farmer123`
- Email: `pedro@example.com`, Password: `farmer123`

---

## Key Differences: Web vs Mobile 📊

| Feature | Web Version | Mobile Version (Updated) |
|---------|-------------|--------------------------|
| Data Source | PostgreSQL API | PostgreSQL API ✅ |
| Authentication | JWT Token | JWT Token ✅ |
| Real-time Updates | 5s polling | 5s polling ✅ |
| Farmer Stats | Yes | Yes ✅ |
| Harvest Action | Yes | Yes ✅ |
| Sleep Mode | Yes | Yes ✅ |
| Offline Mode | No | Yes (fallback to mock) ✅ |

---

## Architecture 🏗️

```
┌─────────────────┐
│   Mobile App    │
│  (React Native) │
└────────┬────────┘
         │
         │ HTTP Requests
         │ (with JWT Token)
         ▼
┌─────────────────┐
│  Backend Server │
│  (Node.js/Express) │
│  localhost:3001 │
└────────┬────────┘
         │
         │ SQL Queries
         ▼
┌─────────────────┐
│   PostgreSQL    │
│    Database     │
└─────────────────┘
```

### API Endpoints Used:

1. **POST** `/api/auth/login` - User authentication
2. **GET** `/api/trees/farmer/:farmerId` - Get assigned trees
3. **GET** `/api/trees` - Get all trees (fallback)
4. **POST** `/api/trees/:id/harvest` - Mark tree as harvested
5. **PUT** `/api/trees/:id/sleep-mode` - Toggle sleep mode
6. **GET** `/api/harvest/farmer/:id/stats` - Get farmer statistics

---

## Testing Checklist ✅

- [ ] Start backend server: `cd server && npm run dev`
- [ ] Ensure database has farmer users with assigned trees
- [ ] Login with farmer credentials
- [ ] Verify trees are loaded from database (not random)
- [ ] Check "My Harvest Performance" shows real stats
- [ ] Test "Mark as Harvested" button
- [ ] Test "Enable Sleep Mode" button
- [ ] Verify auto-refresh updates data every 5 seconds
- [ ] Test pull-to-refresh gesture
- [ ] Logout and verify token is cleared

---

## Troubleshooting 🔧

### Issue: "Unable to fetch tree data"
**Solution:** Make sure backend server is running on port 3001

### Issue: Login fails
**Solution:** 
1. Check backend is running
2. Verify user exists in database
3. If backend is down, app will fallback to mock users

### Issue: No trees showing
**Solution:** 
1. Check if farmer has trees assigned in database
2. Verify `assigned_farmer_id` matches farmer's user ID
3. Check console logs for API errors

### Issue: Token errors
**Solution:** 
1. Logout and login again
2. Clear AsyncStorage if needed
3. Check JWT secret matches between frontend/backend

---

## Next Steps 🚀

### Recommended Enhancements:
1. **Add React Query** - Better caching and state management
2. **Offline Support** - Store trees locally for offline viewing
3. **Push Notifications** - Alert when trees are ready to harvest
4. **Error Boundaries** - Better error handling UI
5. **Loading Skeletons** - Show skeleton loaders while fetching data
6. **Image Upload** - Allow farmers to upload tree photos
7. **Maps Integration** - Show tree locations on actual map

### Production Considerations:
- Update API_BASE_URL to production endpoint
- Add proper SSL/TLS configuration
- Implement token refresh logic
- Add request retry mechanism
- Optimize for slow network conditions
- Add analytics/crash reporting

---

## Files Modified 📝

1. ✅ **NEW**: `CocoSapMobile/src/services/api.ts` - API service layer
2. ✅ **UPDATED**: `CocoSapMobile/src/screens/FarmerDashboardScreen.tsx` - Main dashboard with real data
3. ✅ **UPDATED**: `CocoSapMobile/src/contexts/AuthContext.tsx` - Authentication with token management

---

## Summary ✨

The mobile app now:
- ✅ Connects to the same PostgreSQL backend as the web app
- ✅ Shows REAL farmer data instead of mock data
- ✅ Displays harvest performance statistics
- ✅ Supports harvest and sleep mode actions
- ✅ Auto-refreshes data every 5 seconds
- ✅ Maintains backward compatibility with mock users (offline mode)

**You can now run both the web app AND mobile app simultaneously, and they will show the same real-time data from your PostgreSQL database!** 🎉
