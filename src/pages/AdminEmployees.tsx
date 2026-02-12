/**
 * =============================================================================
 * AdminEmployees.tsx - Employee/Farmer Management Page
 * =============================================================================
 * 
 * PURPOSE:
 * This component handles all CRUD operations for employee/farmer management
 * in the admin dashboard. It connects to a PostgreSQL backend via REST API.
 * 
 * BACKEND ENDPOINTS USED (from /src/services/api.ts):
 * - GET    /api/employees       -> employeesApi.getAll()    - Fetch all employees
 * - POST   /api/employees       -> employeesApi.create()    - Create new employee
 * - PUT    /api/employees/:id   -> employeesApi.update()    - Update employee
 * - DELETE /api/employees/:id   -> employeesApi.delete()    - Delete employee
 * - POST   /api/auth/register   -> registerUser()          - Register user auth
 * 
 * DATABASE TABLES:
 * - employees: Stores employee data (name, email, phone, location, etc.)
 * - users: Stores authentication data (linked via user_id)
 * 
 * KEY FEATURES:
 * - Add, Edit, Delete farmers
 * - Search and filter farmers
 * - Sort by various fields
 * - Pagination
 * - Export to CSV
 * - View assigned trees
 * =============================================================================
 */

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { useAuth } from '@/contexts/AuthContext';
import { employeesApi, authApi, EmployeeData, CreateEmployeeData, treesApi, TreeData } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin, Phone, Mail, Plus, Edit, Trash2, Search, TreePine, Eye, EyeOff, Loader2, Download, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Farmer Interface - Frontend representation of employee data
 * Maps to the 'employees' table in PostgreSQL database
 */
interface Farmer {
  id: string;              // Primary key from database
  name: string;            // Full name of the farmer
  email: string;           // Email address (unique)
  phone: string;           // Contact phone number
  assignedTrees: string[]; // Array of container/tree IDs assigned
  status: 'active' | 'inactive'; // Employment status
  location: string;        // Work location (e.g., "Block A, Section 1")
  joinDate: string;        // Date when farmer joined (ISO format)
  totalHarvest: number;    // Total harvest amount in liters
  avgQuality: number;      // Average quality rating (0-5)
}

/**
 * FarmerFormData Interface - Form state for Add/Edit dialogs
 * Used for controlled form inputs
 */
interface FarmerFormData {
  name: string;            // Form input: Full name
  email: string;           // Form input: Email address
  phone: string;           // Form input: Phone number
  password: string;        // Form input: Password (required for new, optional for edit)
  location: string;        // Form input: Work location
  status: 'active' | 'inactive'; // Form select: Employment status
  assignedTrees: string;   // Form input: Comma-separated tree IDs
}

/** Initial form state - used to reset form after submission or dialog close */
const initialFormData: FarmerFormData = {
  name: '',
  email: '',
  phone: '',
  password: '',
  location: '',
  status: 'active',
  assignedTrees: '',
};

/** Available fields for sorting the farmers list */
type SortField = 'name' | 'location' | 'status' | 'joinDate' | 'totalHarvest' | 'avgQuality';
/** Sort direction */
type SortOrder = 'asc' | 'desc';

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const AdminEmployees = () => {
  // ---------------------------------------------------------------------------
  // HOOKS & CONTEXT
  // ---------------------------------------------------------------------------
  const { user, registerUser } = useAuth(); // Auth context: current user & registration function
  const { toast } = useToast();             // Toast notifications for user feedback

  // ---------------------------------------------------------------------------
  // STATE MANAGEMENT
  // ---------------------------------------------------------------------------
  
  /** Search term for filtering farmers by name or location */
  const [searchTerm, setSearchTerm] = useState('');
  /** Main data state: List of all farmers from PostgreSQL database */
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  /** Loading state: True while fetching data from backend */
  const [isLoadingFarmers, setIsLoadingFarmers] = useState(true);
  /** Saving state: True during create/update/delete operations */
  const [isSaving, setIsSaving] = useState(false);
  
  // --- Pagination State ---
  /** Current page number (1-indexed) */
  const [currentPage, setCurrentPage] = useState(1);
  /** Number of items to display per page */
  const [itemsPerPage, setItemsPerPage] = useState(6);
  
  // --- Sorting State ---
  /** Current field to sort by */
  const [sortField, setSortField] = useState<SortField>('name');
  /** Current sort direction */
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // ---------------------------------------------------------------------------
  // TREE MANAGEMENT STATE
  // ---------------------------------------------------------------------------
  /** List of all registered trees/prototypes from database */
  const [trees, setTrees] = useState<TreeData[]>([]);
  /** Loading state for trees */
  const [isLoadingTrees, setIsLoadingTrees] = useState(true);
  /** Controls visibility of "Add New Tree" dialog */
  const [isAddTreeDialogOpen, setIsAddTreeDialogOpen] = useState(false);
  /** Controls visibility of "Delete Tree" confirmation dialog */
  const [isDeleteTreeDialogOpen, setIsDeleteTreeDialogOpen] = useState(false);
  /** Currently selected tree for deletion */
  const [selectedTree, setSelectedTree] = useState<TreeData | null>(null);
  /** Form data for new tree */
  const [treeFormData, setTreeFormData] = useState({ name: '', location: '' });
  /** Selected trees for assignment (used in farmer add/edit dialogs) */
  const [selectedTreesForAssignment, setSelectedTreesForAssignment] = useState<string[]>([]);
  /** Saving state for tree operations */
  const [isSavingTree, setIsSavingTree] = useState(false);

  // ===========================================================================
  // BACKEND API: FETCH ALL EMPLOYEES
  // ===========================================================================
  /**
   * Fetches all employees from PostgreSQL backend
   * 
   * API ENDPOINT: GET /api/employees
   * SERVICE: employeesApi.getAll() from /src/services/api.ts
   * DATABASE QUERY: SELECT * FROM employees
   * 
   * FLOW:
   * 1. Set loading state to true
   * 2. Call employeesApi.getAll() to fetch from backend
   * 3. Map backend response (snake_case) to frontend format (camelCase)
   * 4. Update farmers state with mapped data
   * 5. Handle errors with toast notification
   */
  const fetchFarmers = async (showLoading = true) => {
    if (showLoading) setIsLoadingFarmers(true);
    try {
      // API CALL: Fetch all employees from PostgreSQL
      const employees = await employeesApi.getAll();
      
      // MAP: Convert backend response to frontend Farmer interface
      const mappedFarmers: Farmer[] = employees.map(emp => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        phone: emp.phone || '',
        assignedTrees: emp.assigned_trees || [],  // Backend uses snake_case
        status: emp.status || 'active',
        location: emp.location || '',
        joinDate: emp.join_date || new Date().toISOString().split('T')[0],
        totalHarvest: emp.total_harvest || 0,
        avgQuality: emp.avg_quality || 0,
      }));
      setFarmers(mappedFarmers);
    } catch (error) {
      // ERROR HANDLING: Log and show user-friendly toast (only on initial load)
      console.error('Error fetching farmers:', error);
      if (showLoading) {
        toast({
          title: 'Error',
          description: 'Failed to load employees from database. Make sure the server is running.',
          variant: 'destructive',
        });
      }
    } finally {
      if (showLoading) setIsLoadingFarmers(false);
    }
  };

  /** EFFECT: Initial data fetch on component mount */
  useEffect(() => {
    fetchFarmers();
    fetchTrees();
  }, []);

  /** EFFECT: Auto-refresh employee data every 10 seconds to reflect harvest updates */
  useEffect(() => {
    const interval = setInterval(() => {
      fetchFarmers(false); // Don't show loading on auto-refresh
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // ===========================================================================
  // BACKEND API: FETCH ALL TREES
  // ===========================================================================
  /**
   * Fetches all registered trees/prototypes from PostgreSQL backend
   * API ENDPOINT: GET /api/trees
   */
  const fetchTrees = async () => {
    setIsLoadingTrees(true);
    try {
      const treesData = await treesApi.getAll();
      setTrees(treesData);
    } catch (error) {
      console.error('Error fetching trees:', error);
      toast({
        title: 'Error',
        description: 'Failed to load trees from database.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingTrees(false);
    }
  };

  // ===========================================================================
  // TREE CRUD HANDLERS
  // ===========================================================================
  
  /**
   * Creates a new tree/prototype
   * API: POST /api/trees
   * Creates tree_containers entry and dynamic sensor_data table
   */
  const handleAddTree = async () => {
    if (!treeFormData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a tree name',
        variant: 'destructive',
      });
      return;
    }

    setIsSavingTree(true);
    try {
      const result = await treesApi.create({
        name: treeFormData.name.trim(),
        location: treeFormData.location.trim() || 'Not specified',
      });

      toast({
        title: 'Tree Added',
        description: `${result.name} has been registered. Sensor data table created.`,
      });

      await fetchTrees();
      setTreeFormData({ name: '', location: '' });
      setIsAddTreeDialogOpen(false);
    } catch (error: any) {
      console.error('Error adding tree:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add tree.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingTree(false);
    }
  };

  /**
   * Opens delete confirmation dialog for a tree
   */
  const handleOpenDeleteTree = (tree: TreeData) => {
    setSelectedTree(tree);
    setIsDeleteTreeDialogOpen(true);
  };

  /**
   * Deletes a tree/prototype
   * API: DELETE /api/trees/:id
   * Removes tree_containers entry and drops sensor_data table
   */
  const handleDeleteTree = async () => {
    if (!selectedTree) return;

    setIsSavingTree(true);
    try {
      const result = await treesApi.delete(selectedTree.id);

      toast({
        title: 'Tree Deleted',
        description: `${result.deletedTree} and its sensor data have been removed.`,
      });

      await fetchTrees();
      await fetchFarmers(); // Refresh farmers as tree assignments may have changed
      setSelectedTree(null);
      setIsDeleteTreeDialogOpen(false);
    } catch (error: any) {
      console.error('Error deleting tree:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete tree.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingTree(false);
    }
  };

  /**
   * Toggle tree selection for farmer assignment
   */
  const handleToggleTreeSelection = (treeId: string) => {
    setSelectedTreesForAssignment(prev => 
      prev.includes(treeId) 
        ? prev.filter(id => id !== treeId) 
        : [...prev, treeId]
    );
  };

  // ---------------------------------------------------------------------------
  // DIALOG STATE MANAGEMENT
  // ---------------------------------------------------------------------------
  /** Controls visibility of "Add New Farmer" dialog */
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  /** Controls visibility of "Edit Farmer" dialog */
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  /** Controls visibility of "Delete Confirmation" dialog */
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  /** Controls visibility of "View Trees" dialog */
  const [isViewTreesDialogOpen, setIsViewTreesDialogOpen] = useState(false);
  /** Currently selected farmer for edit/delete/view operations */
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  /** Form data state for Add/Edit dialogs */
  const [formData, setFormData] = useState<FarmerFormData>(initialFormData);
  /** Toggle password visibility in forms */
  const [showPassword, setShowPassword] = useState(false);

  // ---------------------------------------------------------------------------
  // FORM HANDLERS
  // ---------------------------------------------------------------------------
  /** Updates form field values as user types */
  const handleInputChange = (field: keyof FarmerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /** Generates unique ID (Note: Backend typically handles ID generation) */
  const generateId = () => `farmer-${Date.now()}`;

  // ===========================================================================
  // BACKEND API: CREATE NEW EMPLOYEE (ADD FARMER)
  // ===========================================================================
  /**
   * BUTTON: "Add Farmer" in Add Dialog
   * 
   * API ENDPOINTS:
   * 1. POST /api/auth/register - Creates user authentication record
   * 2. POST /api/employees - Creates employee record
   * 
   * DATABASE OPERATIONS:
   * 1. INSERT INTO users (email, password_hash, role, ...)
   * 2. INSERT INTO employees (user_id, name, email, phone, ...)
   */
  const handleAddFarmer = async () => {
    // VALIDATION: Check required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.location || !formData.password) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields including password',
        variant: 'destructive',
      });
      return;
    }

    // VALIDATION: Password minimum length
    if (formData.password.length < 6) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    // Use selected trees from checkboxes
    const treesArray = selectedTreesForAssignment;

    try {
      // API CALL 1: Register user in auth system (creates user in PostgreSQL users table)
      const registerResult = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'farmer',
        phone: formData.phone,
        assignedTrees: treesArray.length > 0 ? treesArray : [],
        location: formData.location,
      });

      // ERROR CHECK: Registration failed (e.g., email already exists)
      if (!registerResult.success) {
        toast({
          title: 'Registration Failed',
          description: registerResult.error || 'A user with this email may already exist.',
          variant: 'destructive',
        });
        setIsSaving(false);
        return;
      }

      // PREPARE: Employee data for PostgreSQL (snake_case for backend)
      const employeeData: CreateEmployeeData = {
        user_id: registerResult.userId,  // Link to auth user
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        assigned_trees: treesArray.length > 0 ? treesArray : [],
        location: formData.location,
        join_date: new Date().toISOString().split('T')[0],
        status: formData.status,
      };

      // API CALL 2: Create employee record in PostgreSQL employees table
      await employeesApi.create(employeeData);

      // SUCCESS: Show toast notification
      toast({
        title: 'Success',
        description: `Farmer ${formData.name} has been added successfully.`,
      });

      // REFRESH: Reload farmers list from database
      await fetchFarmers();

      // CLEANUP: Reset form and close dialog
      setFormData(initialFormData);
      setSelectedTreesForAssignment([]);
      setShowPassword(false);
      setIsAddDialogOpen(false);
    } catch (error: any) {
      // ERROR HANDLING: Log and show user-friendly error
      console.error('Error adding farmer:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add farmer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ===========================================================================
  // EDIT DIALOG HANDLER
  // ===========================================================================
  /**
   * BUTTON: "Edit" on farmer card
   * Opens Edit Dialog with pre-filled farmer data
   */
  const handleOpenEdit = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    setFormData({
      name: farmer.name,
      email: farmer.email,
      phone: farmer.phone,
      password: '', // Password is optional when editing
      location: farmer.location,
      status: farmer.status,
      assignedTrees: '', // Using checkboxes instead
    });
    setSelectedTreesForAssignment(farmer.assignedTrees || []);
    setIsEditDialogOpen(true);
  };

  // ===========================================================================
  // BACKEND API: UPDATE EMPLOYEE
  // ===========================================================================
  /**
   * BUTTON: "Save Changes" in Edit Dialog
   * 
   * API ENDPOINT: PUT /api/employees/:id
   * SERVICE: employeesApi.update() from /src/services/api.ts
   * DATABASE QUERY: UPDATE employees SET name=?, phone=?, ... WHERE id=?
   */
  const handleUpdateFarmer = async () => {
    if (!selectedFarmer) return;

    // VALIDATION: Check required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.location) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    // Use selected trees from checkboxes
    const treesArray = selectedTreesForAssignment;

    try {
      // API CALL: Update employee in PostgreSQL employees table
      await employeesApi.update(selectedFarmer.id, {
        name: formData.name,
        phone: formData.phone,
        assigned_trees: treesArray,
        status: formData.status,
        location: formData.location,
      });

      // SUCCESS: Show toast notification
      toast({
        title: 'Success',
        description: `Farmer ${formData.name} has been updated successfully.`,
      });

      // REFRESH: Reload farmers list from database
      await fetchFarmers();

      // CLEANUP: Reset form and close dialog
      setFormData(initialFormData);
      setSelectedFarmer(null);
      setSelectedTreesForAssignment([]);
      setShowPassword(false);
      setIsEditDialogOpen(false);
    } catch (error: any) {
      // ERROR HANDLING: Log and show user-friendly error
      console.error('Error updating farmer:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update farmer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ===========================================================================
  // DELETE HANDLERS
  // ===========================================================================
  /**
   * BUTTON: Trash icon on farmer card
   * Opens Delete Confirmation Dialog
   */
  const handleOpenDelete = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    setIsDeleteDialogOpen(true);
  };

  /**
   * BUTTON: "Delete" in Delete Confirmation Dialog
   * 
   * API ENDPOINT: DELETE /api/employees/:id
   * SERVICE: employeesApi.delete() from /src/services/api.ts
   * DATABASE QUERY: DELETE FROM employees WHERE id=?
   */
  const handleDeleteFarmer = async () => {
    if (!selectedFarmer) return;

    setIsSaving(true);

    try {
      // API CALL: Delete employee from PostgreSQL employees table
      await employeesApi.delete(selectedFarmer.id);

      // SUCCESS: Show toast notification
      toast({
        title: 'Success',
        description: `Farmer ${selectedFarmer.name} has been deleted.`,
      });

      // REFRESH: Reload farmers list from database
      await fetchFarmers();

      // CLEANUP: Reset selection and close dialog
      setSelectedFarmer(null);
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      // ERROR HANDLING: Log and show user-friendly error
      console.error('Error deleting farmer:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete farmer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ===========================================================================
  // VIEW TREES HANDLER
  // ===========================================================================
  /**
   * BUTTON: "View Trees" on farmer card
   * Opens View Trees Dialog (read-only, no API call)
   */
  const handleViewTrees = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    setIsViewTreesDialogOpen(true);
  };

  // ===========================================================================
  // DIALOG CLOSE HANDLER
  // ===========================================================================
  /**
   * BUTTONS: All "Cancel" and "Close" buttons in dialogs
   * Closes all dialogs and resets form state
   */
  const handleCloseDialog = () => {
    setFormData(initialFormData);
    setSelectedFarmer(null);
    setSelectedTree(null);
    setSelectedTreesForAssignment([]);
    setShowPassword(false);
    setTreeFormData({ name: '', location: '' });
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setIsViewTreesDialogOpen(false);
    setIsAddTreeDialogOpen(false);
    setIsDeleteTreeDialogOpen(false);
  };

  // ===========================================================================
  // DATA FILTERING & SORTING (CLIENT-SIDE)
  // ===========================================================================
  
  /** Filters farmers by search term (name or location) - client-side */
  const filteredFarmers = farmers.filter(farmer =>
    farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /** Sorts filtered farmers by selected field and order - client-side */
  const sortedFarmers = [...filteredFarmers].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];
    
    // Case-insensitive string comparison
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // ===========================================================================
  // PAGINATION (CLIENT-SIDE)
  // ===========================================================================
  /** Total number of pages */
  const totalPages = Math.ceil(sortedFarmers.length / itemsPerPage);
  /** Starting index for current page */
  const startIndex = (currentPage - 1) * itemsPerPage;
  /** Farmers to display on current page */
  const paginatedFarmers = sortedFarmers.slice(startIndex, startIndex + itemsPerPage);

  // ===========================================================================
  // SORT HANDLER
  // ===========================================================================
  /**
   * COMPONENT: Sort dropdown in Search/Sort card
   * Toggles sort order if same field, or sets new field with ascending
   */
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  // ===========================================================================
  // EXPORT TO CSV (CLIENT-SIDE)
  // ===========================================================================
  /**
   * BUTTON: "Export CSV" in header
   * Downloads CSV file of all filtered/sorted farmers
   * OUTPUT: employees_YYYY-MM-DD.csv
   */
  const handleExportCSV = () => {
    // CSV Headers
    const headers = ['Name', 'Email', 'Phone', 'Location', 'Status', 'Join Date', 'Assigned Trees', 'Total Harvest', 'Avg Quality'];
    
    // Convert farmer data to CSV rows
    const rows = sortedFarmers.map(f => [
      f.name,
      f.email,
      f.phone,
      f.location,
      f.status,
      f.joinDate,
      f.assignedTrees.join('; '), // Use semicolon to avoid CSV comma issues
      f.totalHarvest.toString(),
      f.avgQuality.toString()
    ]);
    
    // Generate CSV content with proper quoting
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `employees_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    // SUCCESS: Show toast notification
    toast({
      title: 'Export Successful',
      description: `Exported ${sortedFarmers.length} employees to CSV.`,
    });
  };

  /** EFFECT: Reset pagination when search term changes */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // ===========================================================================
  // COMPUTED STATISTICS (for Stats Cards)
  // ===========================================================================
  /** Count of farmers with 'active' status */
  const activeFarmers = farmers.filter(f => f.status === 'active').length;
  /** Total count of all assigned trees across all farmers */
  const totalTrees = farmers.reduce((sum, f) => sum + f.assignedTrees.length, 0);

  // ===========================================================================
  // RENDER
  // ===========================================================================

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader userName={user?.name} />
        
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* PAGE HEADER WITH ACTION BUTTONS */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">Employee Management</h1>
              <div className="flex flex-wrap gap-2">
                {/* 
                  BUTTON: Export CSV
                  HANDLER: handleExportCSV()
                  ACTION: Downloads CSV file of all filtered/sorted farmers
                  DISABLED: When no farmers exist
                */}
                <Button variant="outline" onClick={handleExportCSV} disabled={farmers.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                {/* 
                  BUTTON: Add New Farmer
                  HANDLER: Opens Add Dialog via setIsAddDialogOpen(true)
                  API: POST /api/auth/register + POST /api/employees (on submit)
                */}
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Farmer
                </Button>
              </div>
            </div>

            {/* 
              STATS CARDS SECTION
              Displays summary statistics calculated from farmers array
              Data source: Local state (no additional API calls)
              Auto-refreshes every 10 seconds to reflect harvest updates
            */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Farmers</div>
                  <div className="text-2xl font-bold text-green-800 dark:text-green-400">{farmers.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Farmers</div>
                  <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">{activeFarmers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Registered Trees</div>
                  <div className="text-2xl font-bold text-blue-800 dark:text-blue-400">{trees.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Assigned Trees</div>
                  <div className="text-2xl font-bold text-teal-800 dark:text-teal-400">{totalTrees}</div>
                </CardContent>
              </Card>
              <Card className="bg-orange-50 dark:bg-orange-900/20">
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Harvest</div>
                  <div className="text-2xl font-bold text-orange-800 dark:text-orange-400">
                    {farmers.reduce((sum, f) => sum + Number(f.totalHarvest || 0), 0).toFixed(1)}L
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Quality</div>
                  <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-400">
                    {farmers.length > 0 ? ((farmers.reduce((sum, f) => sum + Number(f.avgQuality || 0), 0) / farmers.length) * 100).toFixed(0) : '0'}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* =========================================================================
                TREES / PROTOTYPES MANAGEMENT SECTION
                =========================================================================
                Displays all registered trees and allows adding/deleting trees.
                Trees registered here will:
                - Appear in Real-Time Monitoring page
                - Be available for farmer assignment
                - Have their own sensor data table for storing readings
            */}
            <Card className="border-2 border-green-200 dark:border-green-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TreePine className="h-5 w-5 text-green-600" />
                    <CardTitle>Trees / Prototypes Management</CardTitle>
                  </div>
                  <Button 
                    className="bg-green-600 hover:bg-green-700" 
                    onClick={() => setIsAddTreeDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Tree
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingTrees ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                  </div>
                ) : trees.length === 0 ? (
                  <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <TreePine className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      No Trees Registered
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 mb-4">
                      Add your first tree to start monitoring. Trees added here will appear in Real-Time Monitoring.
                    </p>
                    <Button 
                      className="bg-green-600 hover:bg-green-700" 
                      onClick={() => setIsAddTreeDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Tree
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {trees.map((tree) => (
                      <Card key={tree.id} className="hover:shadow-md transition-shadow border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                <TreePine className="h-5 w-5 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">{tree.name}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{tree.location || 'No location'}</p>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleOpenDeleteTree(tree)}
                              title="Delete this tree"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="mt-3 pt-3 border-t text-xs space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Status:</span>
                              <Badge variant="outline" className={tree.status === 'critical' ? 'border-red-500 text-red-500' : tree.status === 'warning' ? 'border-yellow-500 text-yellow-500' : 'border-green-500 text-green-500'}>
                                {tree.status || 'healthy'}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">ID:</span>
                              <span className="font-mono text-gray-700 dark:text-gray-300 text-xs">{tree.id}</span>
                            </div>
                            {tree.current_ph !== undefined && tree.current_ph !== null && tree.current_ph !== 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">pH:</span>
                                <span className="text-gray-700 dark:text-gray-300">{tree.current_ph}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 
              SEARCH AND SORT CONTROLS
              - Search: Filters farmers by name or location (client-side)
              - Sort: Sorts by selected field (client-side)
            */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search farmers by name or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={sortField} onValueChange={(v) => handleSort(v as SortField)}>
                      <SelectTrigger className="w-[150px]">
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="location">Location</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                        <SelectItem value="joinDate">Join Date</SelectItem>
                        <SelectItem value="totalHarvest">Harvest</SelectItem>
                        <SelectItem value="avgQuality">Quality</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 
              FARMERS LIST (Paginated)
              Displays farmer cards with action buttons
              Data source: paginatedFarmers (filtered, sorted, paginated from state)
            */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {paginatedFarmers.map((farmer) => (
                <Card key={farmer.id} className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-800 font-semibold text-lg">
                            {farmer.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{farmer.name}</CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{farmer.location}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={farmer.status === 'active' ? 'default' : 'secondary'}
                        className={farmer.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}
                      >
                        {farmer.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Contact Info */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{farmer.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{farmer.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{farmer.assignedTrees.length} trees assigned</span>
                      </div>
                    </div>

                    {/* Performance Stats - Updates automatically every 10 seconds */}
                    <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Total Harvest</div>
                        <div className="font-semibold text-green-700 dark:text-green-400">
                          {Number(farmer.totalHarvest).toFixed(2)}L
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Avg Quality</div>
                        <div className={`font-semibold ${
                          Number(farmer.avgQuality) >= 0.9 ? 'text-green-700 dark:text-green-400' :
                          Number(farmer.avgQuality) >= 0.7 ? 'text-yellow-700 dark:text-yellow-400' :
                          'text-red-700 dark:text-red-400'
                        }`}>
                          {(Number(farmer.avgQuality) * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    {/* Assigned Trees */}
                    <div>
                      <div className="text-sm font-medium mb-2 dark:text-gray-200">Assigned Trees:</div>
                      <div className="flex flex-wrap gap-1">
                        {farmer.assignedTrees.map((tree) => (
                          <Badge key={tree} variant="outline" className="text-xs">
                            {tree.replace('container-', 'Tree ')}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* 
                      FARMER CARD ACTION BUTTONS
                      Each button operates on this specific farmer
                    */}
                    <div className="flex space-x-2 pt-2">
                      {/* 
                        BUTTON: Edit
                        HANDLER: handleOpenEdit(farmer)
                        ACTION: Opens Edit Dialog with pre-filled data
                        API (on save): PUT /api/employees/:id
                      */}
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenEdit(farmer)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      {/* 
                        BUTTON: View Trees
                        HANDLER: handleViewTrees(farmer)
                        ACTION: Opens View Trees Dialog (read-only, no API call)
                      */}
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewTrees(farmer)}>
                        <TreePine className="h-4 w-4 mr-1" />
                        View Trees
                      </Button>
                      {/* 
                        BUTTON: Delete (Trash Icon)
                        HANDLER: handleOpenDelete(farmer)
                        ACTION: Opens Delete Confirmation Dialog
                        API (on confirm): DELETE /api/employees/:id
                      */}
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleOpenDelete(farmer)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 
              PAGINATION CONTROLS
              - Items per page selector
              - Previous/Next page buttons
              - Page indicator
            */}
            {!isLoadingFarmers && sortedFarmers.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedFarmers.length)} of {sortedFarmers.length} farmers
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={itemsPerPage.toString()} onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}>
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4">4 / page</SelectItem>
                          <SelectItem value="6">6 / page</SelectItem>
                          <SelectItem value="10">10 / page</SelectItem>
                          <SelectItem value="20">20 / page</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center px-3 text-sm">
                          Page {currentPage} of {totalPages}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {isLoadingFarmers ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div>
                            <Skeleton className="h-5 w-32 mb-2" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <Skeleton className="h-3 w-20 mb-1" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                        <div>
                          <Skeleton className="h-3 w-20 mb-1" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                      </div>
                      <div>
                        <Skeleton className="h-4 w-28 mb-2" />
                        <div className="flex flex-wrap gap-1">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <Skeleton className="h-9 flex-1" />
                        <Skeleton className="h-9 flex-1" />
                        <Skeleton className="h-9 w-9" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : filteredFarmers.length === 0 ? (
              <Card className="col-span-full dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No farmers found matching your search.' : 'No farmers found in the database. Add a new farmer to get started.'}
                  </p>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </main>
      </div>

      {/* 
        =========================================================================
        ADD FARMER DIALOG
        =========================================================================
        PURPOSE: Create a new farmer/employee
        SUBMIT HANDLER: handleAddFarmer()
        API CALLS:
          1. POST /api/auth/register - Create user auth record
          2. POST /api/employees - Create employee record
        =========================================================================
      */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Farmer</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new farmer to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter farmer's full name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="farmer@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+63 912 345 6789"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Minimum 6 characters"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">Password must be at least 6 characters</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Block A, Section 1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Assigned Trees</Label>
              {trees.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No trees registered. Add trees in the Trees Management section first.</p>
              ) : (
                <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                  {trees.map((tree) => (
                    <div key={tree.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`add-tree-${tree.id}`}
                        checked={selectedTreesForAssignment.includes(tree.id)}
                        onCheckedChange={() => handleToggleTreeSelection(tree.id)}
                      />
                      <Label 
                        htmlFor={`add-tree-${tree.id}`} 
                        className="text-sm font-normal cursor-pointer flex items-center gap-2"
                      >
                        <TreePine className="h-4 w-4 text-green-600" />
                        {tree.name}
                        <span className="text-xs text-gray-400">({tree.location || 'No location'})</span>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500">{selectedTreesForAssignment.length} tree(s) selected</p>
            </div>
          </div>
          <DialogFooter>
            {/* BUTTON: Cancel - Closes dialog and resets form */}
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            {/* 
              BUTTON: Add Farmer (Submit)
              HANDLER: handleAddFarmer()
              API: POST /api/auth/register + POST /api/employees
              LOADING STATE: Shows spinner when isSaving=true
            */}
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleAddFarmer} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Farmer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 
        =========================================================================
        EDIT FARMER DIALOG
        =========================================================================
        PURPOSE: Update existing farmer/employee information
        SUBMIT HANDLER: handleUpdateFarmer()
        API CALL: PUT /api/employees/:id
        =========================================================================
      */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Farmer</DialogTitle>
            <DialogDescription>
              Update the farmer's information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter farmer's full name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="farmer@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone Number *</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+63 912 345 6789"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-password">New Password (Optional)</Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Leave blank to keep current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">Minimum 6 characters if changing</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-location">Location *</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Block A, Section 1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Assigned Trees</Label>
              {trees.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No trees registered. Add trees in the Trees Management section first.</p>
              ) : (
                <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                  {trees.map((tree) => (
                    <div key={tree.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-tree-${tree.id}`}
                        checked={selectedTreesForAssignment.includes(tree.id)}
                        onCheckedChange={() => handleToggleTreeSelection(tree.id)}
                      />
                      <Label 
                        htmlFor={`edit-tree-${tree.id}`} 
                        className="text-sm font-normal cursor-pointer flex items-center gap-2"
                      >
                        <TreePine className="h-4 w-4 text-green-600" />
                        {tree.name}
                        <span className="text-xs text-gray-400">({tree.location || 'No location'})</span>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500">{selectedTreesForAssignment.length} tree(s) selected</p>
            </div>
          </div>
          <DialogFooter>
            {/* BUTTON: Cancel - Closes dialog and resets form */}
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            {/* 
              BUTTON: Save Changes (Submit)
              HANDLER: handleUpdateFarmer()
              API: PUT /api/employees/:id
              LOADING STATE: Shows spinner when isSaving=true
            */}
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleUpdateFarmer} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 
        =========================================================================
        DELETE CONFIRMATION DIALOG
        =========================================================================
        PURPOSE: Confirm before deleting a farmer
        SUBMIT HANDLER: handleDeleteFarmer()
        API CALL: DELETE /api/employees/:id
        =========================================================================
      */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Farmer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedFarmer?.name}</strong>? This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* BUTTON: Cancel - Closes delete confirmation dialog */}
            <AlertDialogCancel onClick={handleCloseDialog}>Cancel</AlertDialogCancel>
            {/* 
              BUTTON: Delete (Confirm)
              HANDLER: handleDeleteFarmer()
              API: DELETE /api/employees/:id
              LOADING STATE: Shows "Deleting..." when isSaving=true
            */}
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteFarmer}
              disabled={isSaving}
            >
              {isSaving ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 
        =========================================================================
        VIEW TREES DIALOG
        =========================================================================
        PURPOSE: Display assigned trees for a farmer (read-only)
        API CALL: None - uses data from local state
        =========================================================================
      */}
      <Dialog open={isViewTreesDialogOpen} onOpenChange={setIsViewTreesDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <TreePine className="h-5 w-5 mr-2 text-green-600" />
              {selectedFarmer?.name}'s Assigned Trees
            </DialogTitle>
            <DialogDescription>
              View all trees assigned to this farmer with their current status.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedFarmer?.assignedTrees && selectedFarmer.assignedTrees.length > 0 ? (
              <div className="space-y-3">
                {selectedFarmer.assignedTrees.map((treeId) => {
                  const treeData = trees.find(t => t.id === treeId);
                  return (
                    <div
                      key={treeId}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                          <TreePine className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium dark:text-white">{treeData?.name || treeId}</p>
                          <p className="text-xs text-gray-500">
                            {treeData?.location || 'No location'} • ID: {treeId}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        className={treeData?.status === 'critical' ? 'bg-red-500' : treeData?.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}
                      >
                        {treeData?.status || 'healthy'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <TreePine className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No trees assigned to this farmer.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <div className="flex justify-between w-full">
              <p className="text-sm text-gray-500">
                Total: {selectedFarmer?.assignedTrees?.length || 0} trees
              </p>
              <Button variant="outline" onClick={handleCloseDialog}>
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          ADD NEW TREE DIALOG
          =========================================================================
          Creates a new tree in tree_containers table and a sensor_data table
      */}
      <Dialog open={isAddTreeDialogOpen} onOpenChange={setIsAddTreeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TreePine className="h-5 w-5 text-green-600" />
              Add New Tree / Prototype
            </DialogTitle>
            <DialogDescription>
              Register a new tree. This will create a sensor data table to store real-time readings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tree-name">Tree Name *</Label>
              <Input
                id="tree-name"
                value={treeFormData.name}
                onChange={(e) => setTreeFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Coconut Tree 01"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tree-location">Location</Label>
              <Input
                id="tree-location"
                value={treeFormData.location}
                onChange={(e) => setTreeFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Block A, Section 1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700" 
              onClick={handleAddTree} 
              disabled={isSavingTree}
            >
              {isSavingTree ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tree
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          DELETE TREE CONFIRMATION DIALOG
          =========================================================================
          Deletes tree and its sensor_data table from database
      */}
      <AlertDialog open={isDeleteTreeDialogOpen} onOpenChange={setIsDeleteTreeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Tree
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Are you sure you want to delete <strong>{selectedTree?.name}</strong>?</p>
              <p className="text-red-600 font-medium">This will permanently delete:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>The tree record</li>
                <li>All sensor data for this tree</li>
                <li>Any farmer assignments to this tree</li>
              </ul>
              <p className="text-red-600 font-bold">This action cannot be undone!</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseDialog}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteTree}
              disabled={isSavingTree}
            >
              {isSavingTree ? 'Deleting...' : 'Delete Tree'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminEmployees;
