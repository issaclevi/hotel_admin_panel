import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Barcode, Edit, Eye, Trash } from 'lucide-react';
import { FaGoogle, FaApple, FaUser } from 'react-icons/fa';
import { useToast } from '@/hooks/use-toast';
import DataTable from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { getAllUsers } from '../services/user';

const UserManagement = () => {

    const { toast } = useToast();
    const [isAdding, setIsAdding] = useState(false);
    const [imageFiles, setImageFiles] = useState([]);
    const [isViewing, setIsViewing] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);

    const queryClient = useQueryClient();

    const { data: userResponce = { data: [] }, isLoading } = useQuery({
        queryKey: ['user'],
        queryFn: getAllUsers,
    });

    const user = userResponce?.data || [];

    const form = useForm({
        defaultValues: {
            name: '',
            productCode: '',
            barcode: '',
            hsnCode: '',
            rackNo: '',
            packing: '',
            units: '',
            categoryType: '',
            saltComposition: '',
            saltSynonyms: '',
            schedule: '',
            therapeuticUse: '',
            AiTips: '',
        },
    });

    const handleViewMedicine = (medicine) => {
        setSelectedUser(medicine);
        setIsViewing(true);
    };

    const handleImageUpload = (e) => {
        if (e.target.files) {
            setImageFiles(Array.from(e.target.files));
        }
    };

    const removeImage = (index) => {
        setImageFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleAddUser = async (data) => {
        const payload = {
            name: data.name,
            productCode: data.productCode,
            barcode: data.barcode,
            hsnCode: data.hsnCode,
            rackNo: data.rackNo,
            packing: data.packing,
            units: data.units,
            categoryType: data.categoryType,
            saltComposition: data.saltComposition,
            saltSynonyms: data.saltSynonyms,
            schedule: data.schedule,
            therapeuticUse: data.therapeuticUse,
            AiTips: data.AiTips,
            medicinePhotos: imageFiles,
        };
        // const [status, response] = await addMedicine(payload);
        if (status === 200) {
            toast({
                title: 'Medicine Added',
                description: `${data.name} added with ${imageFiles.length} image(s).`,
            });
            getMedicines();
            setIsAdding(false);
            form.reset();
            setImageFiles([]);
        }
    };

    const handleDeleteClick = (id) => {
        setSelectedUserId(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedUserId) return;
        try {
            // const response = await deleteMedicine({ id: selectedUserId });
            if (response[0] === 200) {
                toast({ title: 'Deleted', description: 'medicine deleted successfully.' });
                await queryClient.invalidateQueries({ queryKey: ['medicine'] });
            } else {
                toast({ title: 'Error', description: 'Failed to delete store', variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Delete failed', variant: 'destructive' });
        } finally {
            setDeleteDialogOpen(false);
            setSelectedUserId(null);
        }
    };

    const columns = [
        { header: 'User ID', accessor: '_id' },
        {
            header: 'Profile',
            accessor: 'profilePic',
            cell: (row) => (
                <img
                    src={row?.profilePic || '/default-avatar.png'}
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover"
                />
            ),
        },
        { header: 'Name', accessor: 'name' },
        { header: 'Email', accessor: 'email' },
        { header: 'Phone Number', accessor: 'phoneNumber' },
        {
            header: 'Role',
            accessor: 'role',
            cell: (row) => <span className="text-blue-600">{row?.role}</span>,
        },
        {
            header: 'Login Type',
            accessor: 'loginType',
            cell: (row) => {
                switch (row?.loginType) {
                    case 'google':
                        return <FaGoogle className="text-blue-500" title="Google Login" />
                    case 'apple':
                        return <FaApple className="text-black" title="Apple Login" />
                    case 'manual':
                    default:
                        return <FaUser className="text-gray-600" title="Manual Login" />
                }
            },
        },
        // { header: 'LoginType ID', accessor: 'loginTypeId' },
        { header: 'Device ID', accessor: 'deviceToken' },
        {
            header: 'Status',
            accessor: 'isActive',
            cell: (row) =>
                row?.isActive ? (
                    <span className="text-green-600 font-semibold">Active</span>
                ) : (
                    <span className="text-red-500 font-semibold">Inactive</span>
                ),
        },
        {
            header: 'Actions',
            accessor: '',
            cell: (row) => (
                <div className="text-right flex items-center justify-center gap-2">
                    <Eye
                        onClick={() => handleViewMedicine(row)}
                        className="h-4 w-4 text-muted-foreground cursor-pointer"
                    />
                    <Link to={`/medicines/${row._id}`} className="text-blue-600 hover:text-blue-800">
                        <Edit className="h-4 w-4 text-blue-800 cursor-pointer" />
                    </Link>
                    <Trash
                        // onClick={() => handleDeleteClick(row?._id)}
                        className="h-4 w-4 text-red-500 cursor-pointer"
                    />
                </div>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">User Management</h1>
                <Button onClick={() => setIsAdding(true)} className="bg-green-600 hover:bg-green-800">Add User</Button>
            </div>

            <Card className="p-4">
                <DataTable
                    data={user}
                    columns={columns}
                    searchable={true}
                    searchField="name"
                    isLoading={isLoading}
                />
            </Card>

            {/* Add user Dialog */}
            <Dialog open={isAdding} onOpenChange={setIsAdding}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAddUser)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Basic Text Fields */}
                                {[
                                    { name: 'name', label: 'Name' },
                                    { name: 'email', label: 'Email' },
                                    { name: 'phoneNumber', label: 'Phone Number' },
                                    { name: 'password', label: 'Password' },
                                    // { name: 'loginTypeId', label: 'Login Type ID' },
                                    { name: 'deviceToken', label: 'Device Token' },
                                    { name: 'profilePic', label: 'Profile Picture URL' },
                                ].map(({ name, label }) => (
                                    <FormField key={name} control={form.control} name={name} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{label}</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder={label} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                ))}

                                {/* Role Select */}
                                <FormField control={form.control} name="role" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="user">User</SelectItem>
                                                <SelectItem value="moderator">Moderator</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                {/* Login Type Select */}
                                <FormField control={form.control} name="loginType" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Login Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select login type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="manual">Manual</SelectItem>
                                                <SelectItem value="google">Google</SelectItem>
                                                <SelectItem value="apple">Apple</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                            </div>

                            <DialogFooter>
                                <Button variant="outline" type="button" onClick={() => setIsAdding(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-green-600 hover:bg-green-800">
                                    Add User
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this medicine? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="bg-red-600 hover:bg-red-800" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View user Dialog */}
            <Dialog open={isViewing} onOpenChange={setIsViewing}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                        <DialogDescription>
                            Detailed information about {selectedUser?.name}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedUser && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <Label>Name</Label>
                                    <p className="font-medium">{selectedUser.name}</p>
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <p className="font-medium">{selectedUser.email}</p>
                                </div>
                                <div>
                                    <Label>Phone Number</Label>
                                    <p className="font-medium">{selectedUser.phoneNumber}</p>
                                </div>
                                <div>
                                    <Label>Role</Label>
                                    <Badge variant="default" className="capitalize ml-3">{selectedUser.role}</Badge>
                                </div>
                                <div>
                                    <Label>Login Type</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        {selectedUser.loginType === 'google' && (
                                            <FaGoogle className="text-blue-500 h-4 w-4" title="Google" />
                                        )}
                                        {selectedUser.loginType === 'apple' && (
                                            <FaApple className="text-black h-4 w-4" title="Apple" />
                                        )}
                                        {selectedUser.loginType === 'manual' && (
                                            <FaUser className="text-gray-600 h-4 w-4" title="Manual" />
                                        )}
                                        <Badge variant="outline" className="capitalize">{selectedUser.loginType}</Badge>
                                    </div>
                                </div>
                                <div>
                                    <Label>Status</Label>
                                    <p className={`font-semibold ${selectedUser.isActive ? 'text-green-600' : 'text-red-500'}`}>
                                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label>Login Type ID</Label>
                                    <p className="font-medium">{selectedUser.loginTypeId || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label>Device Id</Label>
                                    <p className="font-medium break-all">{selectedUser.deviceToken || 'N/A'}</p>
                                </div>
                                {selectedUser.profilePic && (
                                    <div className="md:col-span-2">
                                        <Label>Profile Picture</Label>
                                        <div className="mt-2">
                                            <img
                                                src={selectedUser.profilePic}
                                                alt={selectedUser.name}
                                                className="h-40 w-40 object-cover rounded-full border"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button onClick={() => setIsViewing(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserManagement;
