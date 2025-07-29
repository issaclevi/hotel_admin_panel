import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Eye, Trash } from 'lucide-react';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { getAllSpaceType, updateSpaceType, createSpaceType, deleteSpaceType } from '../services/spaceType';

const SpaceType = () => {

    const { toast } = useToast();
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isViewing, setIsViewing] = useState(false);
    const [editData, setEditData] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteData, setDeleteData] = useState(null);

    const queryClient = useQueryClient();

    const { data: spaceTypeResponce = { data: [] }, isLoading } = useQuery({
        queryKey: ['spaceType'],
        queryFn: getAllSpaceType,
    });

    const spaceType = spaceTypeResponce?.data || [];

    const form = useForm({
        defaultValues: {
            name: '',
            description: '',
            allowedSlots: [],
            isActive: true,
        },
    });

    const handleView = (item) => {
        setSelectedUser(item);
        setIsViewing(true);
    };

    const handleEdit = (row) => {
        setEditData(row);
        form.setValue('name', row.name);
        form.setValue('description', row.description);
        form.setValue('allowedSlots', row.allowedSlots);
        setIsEditing(true);
    };

    const handleDelete = (row) => {
        setDeleteData(row);
        setIsDeleting(true);
    };

    const handleSave = async (data) => {
        let payload;
        let response;

        if (isEditing && editData?._id) {
            response = await updateSpaceType(editData._id, {
                name: data.name,
                description: data.description,
                allowedSlots: data.allowedSlots
            });
        } else {
            payload = {
                name: data.name,
                description: data.description,
                allowedSlots: data.allowedSlots,
                isActive: true,
                bookingsCount: 0,
                lastBookedAt: null,
            };
            response = await createSpaceType(payload);
        }

        if (response?.statusCode === 200) {
            toast({
                title: `SpaceType ${isEditing ? 'Updated' : 'Added'}`,
                description: `${data.name} ${isEditing ? 'updated' : 'created'}.`
            });
            queryClient.invalidateQueries(['spaceType']);
            setIsAdding(false);
            setIsEditing(false);
            form.reset();
            setEditData(null);
        }
    };

    const handleConfirmDelete = async () => {
        if (deleteData?._id) {
            const response = await deleteSpaceType(deleteData._id);
            if (response?.statusCode === 200) {
                toast({
                    title: 'SpaceType Deleted',
                    description: `${deleteData.name} has been removed.`,
                });
                queryClient.invalidateQueries(['spaceType']);
            }
        }
        setIsDeleting(false);
        setDeleteData(null);
    };

    const columns = [
        { header: 'Name', accessor: 'name' },
        { header: 'Description', accessor: 'description' },
        {
            header: 'Allowed Slots',
            accessor: 'allowedSlots',
            Cell: ({ value }) => (
                <span className="text-blue-600 truncate">
                    {Array.isArray(value) ? value.join(', ') : ''}
                </span>
            )
        },
        {
            header: 'Bookings Count', accessor: 'bookingsCount',
            cell: (row) => (
                <span className="text-gray-600">
                    {row?.bookingsCount || 'No bookings'}
                </span>
            )
        },
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
                    <Eye onClick={() => handleView(row)} className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    <Edit onClick={() => handleEdit(row)} className="h-4 w-4 text-blue-800 cursor-pointer" />
                    <Trash onClick={() => handleDelete(row)} className="h-4 w-4 text-red-500 cursor-pointer" />
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">SpaceType Management</h1>
                <Button onClick={() => setIsAdding(true)} className="bg-green-600 hover:bg-green-800">Add SpaceType</Button>
            </div>

            <Card className="p-4">
                <DataTable
                    data={spaceType}
                    columns={columns}
                    searchable={true}
                    searchField="name"
                    isLoading={isLoading}
                />
            </Card>

            <Dialog open={isAdding || isEditing} onOpenChange={(open) => { setIsAdding(false); setIsEditing(false); }}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit SpaceType' : 'Add New SpaceType'}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="SpaceType Name" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="description" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Description" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="allowedSlots" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Allowed Slots</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g. 4H,6H,8H"
                                                value={field.value?.join(', ')}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    field.onChange(value.split(',').map(s => s.trim()));
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" type="button" onClick={() => { setIsAdding(false); setIsEditing(false); form.reset(); setEditData(null); }}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-green-600 hover:bg-green-800">
                                    {isEditing ? 'Update' : 'Add'} SpaceType
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog open={isViewing} onOpenChange={setIsViewing}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>SpaceType Details</DialogTitle>
                        <DialogDescription>
                            Detailed information about {selectedUser?.name}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label>Name</Label>
                                <p className="font-medium">{selectedUser.name}</p>
                            </div>
                            <div>
                                <Label>Description</Label>
                                <p className="font-medium">{selectedUser.description}</p>
                            </div>
                            <div>
                                <Label>Allowed Slots</Label>
                                <p className="font-medium">{selectedUser?.allowedSlots?.join(', ') || 'N/A'}</p>
                            </div>
                            <div>
                                <Label>Status</Label>
                                <p className={`font-semibold ${selectedUser.isActive ? 'text-green-600' : 'text-red-500'}`}>
                                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setIsViewing(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{deleteData?.name}</strong>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleting(false)}>Cancel</Button>
                        <Button
                            onClick={handleConfirmDelete}
                            className="bg-red-600 hover:bg-red-800"
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default SpaceType;
