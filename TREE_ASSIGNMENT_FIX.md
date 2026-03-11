# Mobile Dashboard Tree Assignment Fix

## Problem Description

Farmers using the mobile dashboard were not seeing trees assigned to them from the Admin panel. The mobile app showed "No Trees Assigned" even though trees were assigned in the admin panel.

## Root Cause

The tree assignment flow had a critical disconnect between two database tables:

### What Was Happening:
1. ✅ When admin assigns trees to a farmer → `employees.assigned_trees[]` was updated
2. ❌ BUT → `tree_containers.assigned_farmer_id` was **NOT** updated

### Why This Broke the Mobile App:

The mobile FarmerDashboard calls:
```
GET /api/trees/farmer/:farmerId
```

This backend query looks for:
```sql
SELECT * FROM tree_containers WHERE assigned_farmer_id = $1
```

Since `assigned_farmer_id` was never set on the trees, the query returned 0 results.

## Database Schema Context

### employees table:
- `id` - Employee ID (e.g., "emp-1234567890")
- `user_id` - Links to users table (e.g., "user-1234567890")
- `assigned_trees` - TEXT[] array of tree IDs (e.g., ["container-1", "container-2"])

### tree_containers table:
- `id` - Tree ID (e.g., "container-1")
- `assigned_farmer_id` - VARCHAR(50) REFERENCES users(id) 
- `assigned_farmer_name` - VARCHAR(100)

## Solution Implemented

Updated `/server/src/routes/employees.js` to sync both tables when assignments change.

### 1. Employee Creation (POST /api/employees)
When creating a new employee with tree assignments:
```javascript
// After inserting employee record
if (assigned_trees && assigned_trees.length > 0) {
  // Update tree_containers to link trees to this farmer's user_id
  await query(`
    UPDATE tree_containers SET 
      assigned_farmer_id = $1, 
      assigned_farmer_name = COALESCE($2, assigned_farmer_name),
      last_reading = NOW()
    WHERE id = ANY($3)
  `, [user_id, employeeName, assigned_trees]);
}
```

### 2. Employee Update (PUT /api/employees/:id)
When updating an employee's tree assignments:
```javascript
if (assigned_trees !== undefined) {
  // Get employee's user_id
  const empResult = await query('SELECT user_id FROM employees WHERE id = $1', [req.params.id]);
  const userId = empResult.rows[0].user_id;
  
  // Clear old assignments
  await query(
    'UPDATE tree_containers SET assigned_farmer_id = NULL, assigned_farmer_name = NULL WHERE assigned_farmer_id = $1',
    [userId]
  );
  
  // Set new assignments
  if (assigned_trees && assigned_trees.length > 0) {
    await query(`
      UPDATE tree_containers SET 
        assigned_farmer_id = $1, 
        assigned_farmer_name = COALESCE($2, assigned_farmer_name),
        last_reading = NOW()
      WHERE id = ANY($3)
    `, [userId, employeeName, assigned_trees]);
  }
}
```

## Data Flow After Fix

### Assigning Trees (Admin Panel):
```
Admin Panel → PUT /api/employees/:farmerId
  ├─→ Updates employees.assigned_trees[] ✅
  └─→ Updates tree_containers.assigned_farmer_id ✅
```

### Viewing Trees (Mobile App):
```
Farmer Mobile App → GET /api/trees/farmer/:farmerId
  └─→ Query: WHERE assigned_farmer_id = farmerId ✅ Returns correct trees
```

## Testing Steps

1. **Start the backend server:**
   ```bash
   cd server
   npm start
   ```

2. **Assign trees to a farmer via Admin Panel:**
   - Login as admin
   - Go to Employees page
   - Edit a farmer
   - Select trees to assign
   - Save changes

3. **Verify database update:**
   ```sql
   -- Check tree_containers
   SELECT id, name, assigned_farmer_id, assigned_farmer_name 
   FROM tree_containers 
   WHERE assigned_farmer_id IS NOT NULL;
   
   -- Should show trees with farmer's user_id
   ```

4. **Login as farmer on mobile app:**
   - Use farmer credentials (e.g., juan@sapsense.com / farmer123)
   - Dashboard should now show assigned trees

5. **Check API response:**
   ```bash
   curl http://localhost:3001/api/trees/farmer/farmer-1
   # Should return trees with assigned_farmer_id = "farmer-1"
   ```

## Files Modified

- `/server/src/routes/employees.js` - Added tree assignment synchronization logic

## Backward Compatibility

This fix maintains backward compatibility:
- Existing `employees.assigned_trees[]` data is preserved
- New logic only adds synchronization to `tree_containers.assigned_farmer_id`
- Mobile app already had fallback logic to filter by `assignedTrees` array

## Additional Notes

### Why Two Fields?
- `employees.assigned_trees[]` - Quick lookup of which trees belong to which employee
- `tree_containers.assigned_farmer_id` - Quick lookup of which farmer owns which tree (used by mobile app)

This dual-reference pattern is common in many-to-many relationships for query optimization.

### Data Migration Needed?

If you have existing farmers with assigned_trees that aren't showing up, you may need to run a one-time migration:

```sql
-- Example migration script (run with caution!)
-- This syncs all existing employee assignments to tree_containers

DO $$
DECLARE
    emp_record RECORD;
BEGIN
    FOR emp_record IN 
        SELECT e.user_id, e.name, e.assigned_trees 
        FROM employees e 
        WHERE e.assigned_trees IS NOT NULL 
          AND array_length(e.assigned_trees, 1) > 0
    LOOP
        -- Clear old assignments
        UPDATE tree_containers 
        SET assigned_farmer_id = NULL, assigned_farmer_name = NULL 
        WHERE assigned_farmer_id = emp_record.user_id;
        
        -- Set new assignments
        UPDATE tree_containers 
        SET assigned_farmer_id = emp_record.user_id,
            assigned_farmer_name = COALESCE(emp_record.name, assigned_farmer_name),
            last_reading = NOW()
        WHERE id = ANY(emp_record.assigned_trees);
    END LOOP;
END $$;
```

## Related Files

- Mobile Dashboard: `/CocoSapMobile/src/screens/FarmerDashboardScreen.tsx`
- Web Dashboard: `/src/pages/FarmerDashboard.tsx`
- Backend Route: `/server/src/routes/trees.js` (line 56-94)
- Auth Context: `/src/contexts/AuthContext.tsx`
