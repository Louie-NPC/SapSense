# Sleep Mode Feature Implementation

## Overview
Sleep mode feature for trees with automatic activation after harvest and manual wake-up button. Both farmers and admins can control sleep mode with popup confirmation dialogs.

**Key Workflow:**
- 🌾 **After Harvest**: Tree automatically enters sleep mode (stops active monitoring)
- 😴 **Sleep Mode**: Tree rests in optimal state with volume reset to 0
- ⏰ **Wake Up Button**: Manual click required to bring tree back to available state

## Changes Made

### 1. Database Schema (`server/src/database/setup.js`)
- Added `sleep_mode BOOLEAN DEFAULT FALSE` column to `tree_containers` table
- Migration script created: `server/src/database/migrations/add-sleep-mode-to-trees.sql`

### 2. Backend API (`server/src/routes/trees.js`)

#### Updated Harvest Endpoint
- **Endpoint**: `POST /api/trees/:id/harvest`
- **Auto-Sleep Feature**: After successful harvest, tree automatically:
  - Volume reset to 0
  - Status set to 'optimal'
  - `sleep_mode` set to `TRUE`
- **Response**: Includes `sleep_mode_enabled: true` flag

```javascript
// Response example
{
  message: "Harvest recorded successfully. Tree entered sleep mode - wake it up to resume monitoring.",
  harvest_id: "harvest-123",
  volume: 5.5,
  quality: 0.95,
  farmer_id: "farmer-123",
  farmer_name: "John Doe",
  sleep_mode_enabled: true
}
```

#### Toggle Sleep Mode Endpoint
- **Endpoint**: `PUT /api/trees/:id/sleep-mode`
- **Request Body**: `{ "sleep_mode": true/false }`
- **Response**: `{ "message": "Sleep mode updated", "sleep_mode": true/false }`

### 3. Frontend API Service (`src/services/api.ts`)
- Updated `TreeData` interface to include `sleep_mode?: boolean`
- Added `treesApi.toggleSleepMode(id, sleepMode)` method

### 4. Admin Monitoring Page (`src/pages/Index.tsx`)
- **Button in Tree Detail Modal**: 
  - Shows **"Enable Sleep"** when tree is active (yellow border)
  - Shows **"Wake Up Tree"** when tree is sleeping (blue border)
- **Visual Indicators**: 
  - Yellow badge/button when enabling sleep
  - Blue badge/button when waking up
- **Confirmation Dialog**: Explains what happens when toggling sleep mode
- **Toast Notifications**: 
  - "Sleep Mode Enabled" - Tree will rest until you wake it up
  - "Tree Woken Up!" - Tree is now actively monitoring again

### 5. Farmer Dashboard (`src/pages/FarmerDashboard.tsx`)
- **Button on Each Tree Card**: Positioned at bottom of card
- **Sleep Badge**: Shows "Sleep Mode" badge when tree is sleeping
- **Button Styling**:
  - Yellow border when tree is active (Enable Sleep)
  - Blue border when tree is sleeping (Wake Up Tree)
- **Confirmation Dialog**: Same as admin with clear messaging
- **Toast Notifications**: Success/error messages after operation

## Features

### Automatic Sleep Mode
✅ **Post-Harvest Sleep**: Tree automatically enters sleep mode after being marked as harvested
✅ **Volume Reset**: Tree volume resets to 0 during harvest
✅ **Status Update**: Tree status changes to 'optimal' after harvest

### User Interface
✅ **Confirmation Dialog**: Both admin and farmer see a confirmation popup before toggling sleep mode
✅ **Visual Indicators**: 
   - Yellow "Sleep Mode" badge when active
   - Blue button styling when waking up tree
   - Yellow button styling when putting tree to sleep
✅ **Loading States**: Spinner shown during API calls
✅ **Toast Notifications**: Success/error messages after operation

### Safety Features
✅ **Confirmation Required**: Users must confirm before toggling sleep mode
✅ **Clear Messaging**: Dialog explains what sleep mode does
✅ **Cancel Option**: Users can cancel the operation

## How to Use

### For Admins:
1. Go to Monitoring page
2. Click on any tree to open detail modal
3. Look at the button text:
   - **"Enable Sleep"** (yellow) - Tree is active, you can put it to sleep
   - **"Wake Up Tree"** (blue) - Tree is sleeping, click to wake it up
4. Click the button
5. Confirm the action in the popup dialog
6. See success notification

### For Farmers:
1. View assigned trees in dashboard
2. Find the tree card you want to modify
3. Look at the button at the bottom of the card:
   - **"Enable Sleep"** (yellow border) - Tree is active
   - **"Wake Up Tree"** (blue border) - Tree is sleeping (shows "Sleep" badge)
4. Click the button
5. Confirm the action in the popup dialog
6. See success notification

### Automatic Workflow:
1. Farmer marks tree as harvested
2. Tree volume resets to 0
3. Tree automatically enters sleep mode
4. Tree shows "Sleep Mode" badge
5. Button changes to "Wake Up Tree" (blue)
6. Admin or farmer can wake up the tree when ready

## Database Migration

To add the sleep_mode column to an existing database, run:

```bash
psql -U your_username -d sapsense_db -f server/src/database/migrations/add-sleep-mode-to-trees.sql
```

Or manually execute the SQL in the migration file.

## API Usage Example

```javascript
// Wake up a sleeping tree
await treesApi.toggleSleepMode('tree-123', false);

// Put an active tree to sleep
await treesApi.toggleSleepMode('tree-123', true);

// Harvest automatically enables sleep mode
const result = await treesApi.harvestTree('tree-123');
console.log(result.sleep_mode_enabled); // true
```

## Files Modified

### Backend:
- `server/src/database/setup.js` - Added sleep_mode column
- `server/src/routes/trees.js` - Auto-sleep on harvest + toggle endpoint
- `server/src/database/migrations/add-sleep-mode-to-trees.sql` (new)

### Frontend:
- `src/services/api.ts` - Added toggleSleepMode method
- `src/pages/Index.tsx` - Admin monitoring with wake/sleep toggle
- `src/pages/FarmerDashboard.tsx` - Farmer dashboard with wake/sleep toggle

## Testing Checklist
- [ ] Run database migration
- [ ] Mark a tree as harvested
- [ ] Verify tree automatically enters sleep mode
- [ ] Verify "Sleep Mode" badge appears
- [ ] Click "Wake Up Tree" button (blue)
- [ ] Verify confirmation dialog appears
- [ ] Confirm and verify toast notification
- [ ] Verify tree returns to active state
- [ ] Test putting tree back to sleep with "Enable Sleep" button (yellow)
- [ ] Test from both Admin and Farmer dashboards
- [ ] Verify data persists in database

## UI Color Scheme
- **Yellow** (border-yellow-500, text-yellow-600): Enable Sleep action
- **Blue** (border-blue-500, text-blue-600): Wake Up Tree action
- **Badge**: Secondary variant with yellow-500 background for sleep mode indicator
