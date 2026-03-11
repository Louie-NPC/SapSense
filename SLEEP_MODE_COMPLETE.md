# Sleep Mode Feature - Complete Implementation

## Overview
Complete implementation of automatic sleep mode after harvest with manual wake-up functionality. When a farmer marks a tree as harvested, the system automatically disables further harvesting, resets all sensor data to 0, and puts the tree to sleep. A "Wake Up" button is required to restore the tree's monitoring functionality.

## Key Features Implemented

### 1. Automatic Post-Harvest Behavior
✅ **Tree enters sleep mode** immediately after harvest
✅ **All sensor data reset to 0**:
   - `current_volume = 0`
   - `current_ph = 0`
   - `current_temperature = 0`
✅ **Status set to 'optimal'**
✅ **"Mark as Harvested" button disabled** - Cannot harvest again while sleeping
✅ **Sleep mode badge appears** on tree card

### 2. Wake Up Trigger
✅ **Manual button click required** to wake tree
✅ **Restores full functionality**:
   - Re-enables "Mark as Harvested" button
   - Resumes data collection and reporting
   - Removes sleep mode badge
   - Tree returns to active monitoring state

### 3. UI/UX Improvements
✅ **Admin Dashboard (Index.tsx)**:
   - Prominent blue "⏰ Wake Up Tree - Resume Data Collection" button when sleeping
   - "Mark as Harvested" hidden when tree is sleeping or has no volume
   - Yellow "Enable Sleep Mode" button when tree is active
   - Clear visual separation between sleep/wake states

✅ **Farmer Dashboard (FarmerDashboard.tsx)**:
   - Full-width blue "⏰ Wake Up Tree" button when sleeping
   - "Harvest" button only shows when status is 'harvest' AND not sleeping
   - "Enable Sleep" button available when active
   - Buttons dynamically change based on sleep state

## Technical Implementation

### Backend Changes

#### Database Schema (`server/src/database/setup.js`)
```sql
ALTER TABLE tree_containers 
ADD COLUMN sleep_mode BOOLEAN DEFAULT FALSE;
```

#### Harvest Route Update (`server/src/routes/trees.js`)
```javascript
// After successful harvest:
await client.query(
  `UPDATE tree_containers SET 
    current_volume = 0,
    current_ph = 0,
    current_temperature = 0,
    status = 'optimal',
    sleep_mode = TRUE,
    last_reading = NOW()
   WHERE id = $1`,
  [treeId]
);

res.json({ 
  message: 'Harvest recorded successfully. Tree entered sleep mode - wake it up to resume monitoring.',
  sleep_mode_enabled: true
});
```

### Frontend Changes

#### Admin Dashboard Button Logic
```typescript
{/* Show Wake Up button prominently when tree is sleeping */}
{container.sleep_mode && (
  <Button className="bg-blue-600 hover:bg-blue-700 text-white col-span-2">
    ⏰ Wake Up Tree - Resume Data Collection
  </Button>
)}

{/* Hide Mark as Harvested when sleeping */}
{container.status === 'harvest' && !container.sleep_mode && (
  <Button disabled={isHarvesting || container.volume <= 0}>
    Mark Harvested
  </Button>
)}
```

#### Farmer Dashboard Button Logic
```typescript
{container.sleep_mode ? (
  <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
    ⏰ Wake Up Tree
  </Button>
) : (
  <>
    <Button variant="outline" className="border-yellow-500">
      Enable Sleep
    </Button>
    {container.status === 'harvest' && (
      <Button className="flex-1 bg-emerald-600">
        Harvest
      </Button>
    )}
  </>
)}
```

## User Workflows

### Farmer Workflow

1. **Tree Ready for Harvest** (pH 5.0-5.5)
   - Status shows "Harvest" badge
   - "Harvest" button visible and enabled
   - Sensor data showing current readings

2. **Mark as Harvested**
   - Click "Harvest" button
   - Confirmation dialog (if implemented)
   - Success toast: "Harvested 5.5L from Tree-1. Quality: 95%. Tree is now sleeping with data reset."

3. **After Harvest - Tree Sleeping**
   - All sensor readings show 0
   - "Sleep Mode" badge appears
   - "Harvest" button disappears
   - Blue "⏰ Wake Up Tree" button appears
   - Cannot harvest again until woken up

4. **Wake Up Tree**
   - Click "⏰ Wake Up Tree" button
   - Confirmation dialog appears
   - Success toast: "🍃 Tree Woken Up! Tree-1 is now actively monitoring and collecting data again."
   - Tree resumes normal operation
   - "Harvest" button reappears when pH reaches harvest range

### Admin Workflow

1. **Monitor Trees**
   - View all trees in Monitoring page
   - See which trees are sleeping (yellow badge)
   - See which trees are active

2. **Wake Up Sleeping Trees**
   - Click on sleeping tree to open detail modal
   - See prominent blue "⏰ Wake Up Tree - Resume Data Collection" button
   - Click to confirm
   - Tree returns to active monitoring

3. **Put Active Trees to Sleep** (Optional)
   - Click "Enable Sleep Mode" button (yellow border)
   - Confirm action
   - Tree enters sleep mode
   - All sensor data preserved

## Visual Design

### Color Scheme
- **Blue** (`bg-blue-600`, `text-blue-600`): Wake Up action - primary call-to-action when sleeping
- **Yellow** (`border-yellow-500`, `text-yellow-600`): Enable Sleep action - secondary action when active
- **Emerald/Green** (`bg-emerald-600`): Harvest action - only available when ready and active
- **Badge**: Secondary variant with yellow-500 background for sleep indicator

### Button States

**When Tree is SLEEPING:**
```
┌─────────────────────────────────────┐
│ ⏰ Wake Up Tree              [Blue] │
└─────────────────────────────────────┘
```

**When Tree is ACTIVE:**
```
┌──────────────────┐ ┌──────────────┐
│ Enable Sleep     │ │   Harvest    │
│ [Yellow Outline] │ │   [Green]    │
└──────────────────┘ └──────────────┘
```

## Toast Notifications

### After Harvest
```
Title: Harvest Recorded
Message: Harvested 5.5L from Tree-1. Quality: 95%. Tree is now sleeping with data reset.
```

### After Wake Up
```
Title: 🍃 Tree Woken Up!
Message: Tree-1 is now actively monitoring and collecting data again.
```

### After Enable Sleep
```
Title: 😴 Sleep Mode Enabled
Message: Tree-1 is now sleeping. All sensor data reset. Click 'Wake Up Tree' when ready to resume collection.
```

## Testing Checklist

- [ ] Run database migration to add `sleep_mode` column
- [ ] Mark a tree as harvested (pH must be 5.0-5.5)
- [ ] Verify all sensor data resets to 0 (volume, pH, temperature)
- [ ] Verify "Mark as Harvested" button disappears
- [ ] Verify "Sleep Mode" badge appears
- [ ] Verify "Wake Up Tree" button appears (blue, prominent)
- [ ] Click "Wake Up Tree" and confirm dialog
- [ ] Verify tree returns to active state
- [ ] Verify "Mark as Harvested" button reappears when pH in range
- [ ] Test from both Admin and Farmer dashboards
- [ ] Test optional "Enable Sleep Mode" button on active trees
- [ ] Verify data persists correctly in database
- [ ] Check toast notifications display correct messages

## API Endpoints

### Toggle Sleep Mode
```
PUT /api/trees/:id/sleep-mode
Body: { "sleep_mode": true/false }
Response: { "message": "Sleep mode updated", "sleep_mode": boolean }
```

### Harvest Tree (Auto-enables sleep mode)
```
POST /api/trees/:id/harvest
Response: { 
  "message": "Harvest recorded successfully. Tree entered sleep mode - wake it up to resume monitoring.",
  "sleep_mode_enabled": true 
}
```

## Files Modified

### Backend
- ✅ `server/src/database/setup.js` - Added sleep_mode column
- ✅ `server/src/routes/trees.js` - Reset all sensor data + auto-sleep on harvest
- ✅ `server/src/database/migrations/add-sleep-mode-to-trees.sql` - Migration script

### Frontend
- ✅ `src/services/api.ts` - toggleSleepMode method
- ✅ `src/pages/Index.tsx` - Admin dashboard with sleep/wake logic
- ✅ `src/pages/FarmerDashboard.tsx` - Farmer dashboard with sleep/wake logic

## Benefits

1. **Prevents Double Harvesting**: Tree cannot be harvested again until woken up
2. **Data Integrity**: All sensor data properly reset after harvest
3. **Clear User Feedback**: Visual indicators and toast notifications keep users informed
4. **Intentional Reactivation**: Requires manual action to resume monitoring
5. **Resource Efficiency**: Sleeping trees don't consume monitoring resources
6. **Workflow Clarity**: Clear separation between harvest, sleep, and wake states
