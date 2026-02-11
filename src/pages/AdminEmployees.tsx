import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { useAuth } from '@/contexts/AuthContext';
import { employeesApi, authApi, EmployeeData, CreateEmployeeData } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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

interface Farmer {
  id: string;
  name: string;
  email: string;
  phone: string;
  assignedTrees: string[];
  status: 'active' | 'inactive';
  location: string;
  joinDate: string;
  totalHarvest: number;
  avgQuality: number;
}

interface FarmerFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  location: string;
  status: 'active' | 'inactive';
  assignedTrees: string;
}

const initialFormData: FarmerFormData = {
  name: '',
  email: '',
  phone: '',
  password: '',
  location: '',
  status: 'active',
  assignedTrees: '',
};

type SortField = 'name' | 'location' | 'status' | 'joinDate' | 'totalHarvest' | 'avgQuality';
type SortOrder = 'asc' | 'desc';

const AdminEmployees = () => {
  const { user, registerUser } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [isLoadingFarmers, setIsLoadingFarmers] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Fetch employees from PostgreSQL backend
  const fetchFarmers = async () => {
    setIsLoadingFarmers(true);
    try {
      const employees = await employeesApi.getAll();
      const mappedFarmers: Farmer[] = employees.map(emp => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        phone: emp.phone || '',
        assignedTrees: emp.assigned_trees || [],
        status: emp.status || 'active',
        location: emp.location || '',
        joinDate: emp.join_date || new Date().toISOString().split('T')[0],
        totalHarvest: emp.total_harvest || 0,
        avgQuality: emp.avg_quality || 0,
      }));
      setFarmers(mappedFarmers);
    } catch (error) {
      console.error('Error fetching farmers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load employees from database. Make sure the server is running.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingFarmers(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewTreesDialogOpen, setIsViewTreesDialogOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [formData, setFormData] = useState<FarmerFormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);

  // Handle form input changes
  const handleInputChange = (field: keyof FarmerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Generate unique ID for new farmer
  const generateId = () => `farmer-${Date.now()}`;

  // Add new farmer
  const handleAddFarmer = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.location || !formData.password) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields including password',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    const treesArray = formData.assignedTrees
      .split(',')
      .map(t => t.trim())
      .filter(t => t !== '');

    try {
      // Register the user in the auth system (creates user in PostgreSQL)
      const registerResult = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'farmer',
        phone: formData.phone,
        assignedTrees: treesArray.length > 0 ? treesArray : [],
        location: formData.location,
      });

      if (!registerResult.success) {
        toast({
          title: 'Registration Failed',
          description: registerResult.error || 'A user with this email may already exist.',
          variant: 'destructive',
        });
        setIsSaving(false);
        return;
      }

      // Create employee record in PostgreSQL
      const employeeData: CreateEmployeeData = {
        user_id: registerResult.userId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        assigned_trees: treesArray.length > 0 ? treesArray : [],
        location: formData.location,
        join_date: new Date().toISOString().split('T')[0],
        status: formData.status,
      };

      await employeesApi.create(employeeData);

      toast({
        title: 'Success',
        description: `Farmer ${formData.name} has been added successfully.`,
      });

      // Refresh the farmers list from database
      await fetchFarmers();

      setFormData(initialFormData);
      setShowPassword(false);
      setIsAddDialogOpen(false);
    } catch (error: any) {
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

  // Open edit dialog
  const handleOpenEdit = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    setFormData({
      name: farmer.name,
      email: farmer.email,
      phone: farmer.phone,
      password: '', // Password is optional when editing
      location: farmer.location,
      status: farmer.status,
      assignedTrees: farmer.assignedTrees.join(', '),
    });
    setIsEditDialogOpen(true);
  };

  // Update farmer
  const handleUpdateFarmer = async () => {
    if (!selectedFarmer) return;

    if (!formData.name || !formData.email || !formData.phone || !formData.location) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    const treesArray = formData.assignedTrees
      .split(',')
      .map(t => t.trim())
      .filter(t => t !== '');

    try {
      // Update employee in PostgreSQL
      await employeesApi.update(selectedFarmer.id, {
        name: formData.name,
        phone: formData.phone,
        assigned_trees: treesArray.length > 0 ? treesArray : selectedFarmer.assignedTrees,
        status: formData.status,
        location: formData.location,
      });

      toast({
        title: 'Success',
        description: `Farmer ${formData.name} has been updated successfully.`,
      });

      // Refresh the farmers list from database
      await fetchFarmers();

      setFormData(initialFormData);
      setSelectedFarmer(null);
      setShowPassword(false);
      setIsEditDialogOpen(false);
    } catch (error: any) {
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

  // Open delete confirmation
  const handleOpenDelete = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    setIsDeleteDialogOpen(true);
  };

  // Delete farmer
  const handleDeleteFarmer = async () => {
    if (!selectedFarmer) return;

    setIsSaving(true);

    try {
      // Delete employee from PostgreSQL
      await employeesApi.delete(selectedFarmer.id);

      toast({
        title: 'Success',
        description: `Farmer ${selectedFarmer.name} has been deleted.`,
      });

      // Refresh the farmers list from database
      await fetchFarmers();

      setSelectedFarmer(null);
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
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

  // View Trees
  const handleViewTrees = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    setIsViewTreesDialogOpen(true);
  };

  // Close dialogs and reset form
  const handleCloseDialog = () => {
    setFormData(initialFormData);
    setSelectedFarmer(null);
    setShowPassword(false);
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setIsViewTreesDialogOpen(false);
  };

  // Filter farmers
  const filteredFarmers = farmers.filter(farmer =>
    farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort farmers
  const sortedFarmers = [...filteredFarmers].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate farmers
  const totalPages = Math.ceil(sortedFarmers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFarmers = sortedFarmers.slice(startIndex, startIndex + itemsPerPage);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Location', 'Status', 'Join Date', 'Assigned Trees', 'Total Harvest', 'Avg Quality'];
    const rows = sortedFarmers.map(f => [
      f.name,
      f.email,
      f.phone,
      f.location,
      f.status,
      f.joinDate,
      f.assignedTrees.join('; '),
      f.totalHarvest.toString(),
      f.avgQuality.toString()
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `employees_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast({
      title: 'Export Successful',
      description: `Exported ${sortedFarmers.length} employees to CSV.`,
    });
  };

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const activeFarmers = farmers.filter(f => f.status === 'active').length;
  const totalTrees = farmers.reduce((sum, f) => sum + f.assignedTrees.length, 0);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader userName={user?.name} />
        
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">Employee Management</h1>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleExportCSV} disabled={farmers.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Farmer
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Assigned Trees</div>
                  <div className="text-2xl font-bold text-blue-800 dark:text-blue-400">{totalTrees}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Quality</div>
                  <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-400">
                    {farmers.length > 0 ? (farmers.reduce((sum, f) => sum + f.avgQuality, 0) / farmers.length).toFixed(1) : '0.0'}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Sort */}
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

            {/* Farmers List */}
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

                    {/* Performance Stats */}
                    <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Total Harvest</div>
                        <div className="font-semibold text-green-700 dark:text-green-400">{farmer.totalHarvest}L</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Avg Quality</div>
                        <div className="font-semibold text-yellow-700 dark:text-yellow-400">{farmer.avgQuality}/5.0</div>
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

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenEdit(farmer)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewTrees(farmer)}>
                        <TreePine className="h-4 w-4 mr-1" />
                        View Trees
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleOpenDelete(farmer)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
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

      {/* Add Farmer Dialog */}
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
              <Label htmlFor="assignedTrees">Assigned Trees</Label>
              <Input
                id="assignedTrees"
                value={formData.assignedTrees}
                onChange={(e) => handleInputChange('assignedTrees', e.target.value)}
                placeholder="container-1, container-2, container-3"
              />
              <p className="text-xs text-gray-500">Separate multiple trees with commas</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
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

      {/* Edit Farmer Dialog */}
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
              <Label htmlFor="edit-assignedTrees">Assigned Trees</Label>
              <Input
                id="edit-assignedTrees"
                value={formData.assignedTrees}
                onChange={(e) => handleInputChange('assignedTrees', e.target.value)}
                placeholder="container-1, container-2, container-3"
              />
              <p className="text-xs text-gray-500">Separate multiple trees with commas</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Farmer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedFarmer?.name}</strong>? This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseDialog}>Cancel</AlertDialogCancel>
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

      {/* View Trees Dialog */}
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
                {selectedFarmer.assignedTrees.map((tree, index) => (
                  <div
                    key={tree}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <TreePine className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{tree.replace('container-', 'Tree ')}</p>
                        <p className="text-xs text-gray-500">Container ID: {tree}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500">Active</Badge>
                  </div>
                ))}
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
    </div>
  );
};

export default AdminEmployees;
