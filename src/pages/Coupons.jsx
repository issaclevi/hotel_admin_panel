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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { getAllCoupons, updateCoupon, createCoupon, deleteCoupon } from '../services/coupon';
import { getAllUsers } from '../services/user';
import { getAllRooms } from '../services/room';
import { getAllSpaceType } from '../services/spaceType';

const Coupons = () => {

    const { toast } = useToast();
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isViewing, setIsViewing] = useState(false);
    const [editData, setEditData] = useState(null);
    const [selectedData, setSelectedData] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteData, setDeleteData] = useState(null);

    const queryClient = useQueryClient();

    const { data: couponsResponce = { data: [] }, isLoading } = useQuery({
        queryKey: ['coupons'],
        queryFn: getAllCoupons,
    });

    const { data: userResponce = { data: [] } } = useQuery({
        queryKey: ['users'],
        queryFn: getAllUsers,
    });

    const { data: roomResponce = { data: [] } } = useQuery({
        queryKey: ['rooms'],
        queryFn: getAllRooms,
    });

    const { data: spaceTypeResponce = { data: [] } } = useQuery({
        queryKey: ['spaceTypes'],
        queryFn: getAllSpaceType,
    });

    const coupons = couponsResponce?.data || [];
    const users = userResponce?.data || [];
    const rooms = roomResponce?.data || [];
    const spaceTypes = spaceTypeResponce?.data || [];

    const form = useForm({
        defaultValues: {
            code: '',
            description: '',
            discountType: '',
            discountValue: 0,
            maxDiscount: null,
            minPurchaseAmount: 0,
            expiryDate: '',
            usageLimit: 1,
            usedCount: 0,
            applicableSpaceTypes: [],
            applicableRooms: [],
            applicableUsers: [],
            isActive: true,
        },
    });

    const handleView = (item) => {
        setSelectedData(item);
        setIsViewing(true);
    };

    const handleEdit = (row) => {
        setEditData(row);

        form.setValue('code', row?.code || '');
        form.setValue('description', row?.description || '');
        form.setValue('discountType', row?.discountType || '');
        form.setValue('discountValue', row?.discountValue || 0);
        form.setValue('maxDiscount', row?.maxDiscount ?? null);
        form.setValue('minPurchaseAmount', row?.minPurchaseAmount || 0);
        form.setValue('expiryDate', row?.expiryDate ? row.expiryDate.substring(0, 10) : '');
        form.setValue('usageLimit', row?.usageLimit || 1);
        form.setValue('applicableSpaceTypes', row?.applicableSpaceTypes || []);
        form.setValue('applicableRooms', row?.applicableRooms || []);
        form.setValue('applicableUsers', row?.applicableUsers || []);
        form.setValue('isActive', row?.isActive ?? true);

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
            payload = {
                code: data.code,
                description: data.description,
                discountType: data.discountType,
                discountValue: data.discountValue,
                maxDiscount: data.maxDiscount || null,
                minPurchaseAmount: data.minPurchaseAmount || 0,
                expiryDate: data.expiryDate,
                usageLimit: data.usageLimit || 1,
                applicableSpaceTypes: data.applicableSpaceTypes || [],
                applicableRooms: data.applicableRooms || [],
                applicableUsers: data.applicableUsers || [],
                isActive: data.isActive ?? true,
            };
            response = await updateCoupon(editData._id, payload);
        } else {
            payload = {
                code: data.code,
                description: data.description,
                discountType: data.discountType,
                discountValue: data.discountValue,
                maxDiscount: data.maxDiscount || null,
                minPurchaseAmount: data.minPurchaseAmount || 0,
                expiryDate: data.expiryDate,
                usageLimit: data.usageLimit || 1,
                applicableSpaceTypes: data.applicableSpaceTypes || [],
                applicableRooms: data.applicableRooms || [],
                applicableUsers: data.applicableUsers || [],
                isActive: true,
                usedCount: 0,
            };
            response = await createCoupon(payload);
        }

        if (response?.statusCode === 200) {
            toast({
                title: `Coupon ${isEditing ? 'Updated' : 'Added'}`,
                description: `${data.code} ${isEditing ? 'updated' : 'created'} successfully.`,
            });
            queryClient.invalidateQueries(['coupons']);
            setIsAdding(false);
            setIsEditing(false);
            form.reset();
            setEditData(null);
        }
    };

    const handleConfirmDelete = async () => {
        if (deleteData?._id) {
            const response = await deleteCoupon(deleteData._id);
            if (response?.statusCode === 200) {
                toast({
                    title: 'Coupon Deleted',
                    description: `${deleteData?.code} has been removed.`,
                });
                queryClient.invalidateQueries(['coupons']);
            }
        }
        setIsDeleting(false);
        setDeleteData(null);
    };

    const columns = [
        {
            header: 'Coupon Code', accessor: 'code',
            cell: (row) => (
                <span className="border-dashed border rounded px-2 py-1 border-green-600 text-green-600 font-bold">
                    {row?.code}
                </span>
            )
        },
        { header: 'Description', accessor: 'description' },
        {
            header: 'Discount Type',
            accessor: 'discountType'
        },
        {
            header: 'Usage Limit',
            accessor: 'usageLimit'
        },
        {
            header: 'Used Count',
            accessor: 'usedCount',
            cell: (row) => (
                <span>
                    {row?.usedCount || 0}
                </span>
            )
        },
        {
            header: 'Expiry Date',
            accessor: 'expiryDate',
            cell: (row) => {
                if (!row?.expiryDate) {
                    return <span className="text-gray-600">N/A</span>;
                }

                const expiryDate = new Date(row.expiryDate);
                const today = new Date();
                const timeDiff = expiryDate.getTime() - today.getTime();
                const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

                const isExpiringSoon = daysDiff <= 10 && daysDiff >= 0;

                const formattedDate = expiryDate.toLocaleDateString('en-US', {
                    day: 'numeric',
                    weekday: 'short',
                    month: 'short',
                    year: 'numeric'
                });

                return (
                    <span className={isExpiringSoon ? 'text-red-500 font-medium' : 'text-gray-600'}>
                        {formattedDate}
                        {isExpiringSoon && (
                            <span className="ml-1 text-xs text-red-500">(Expiring soon)</span>
                        )}
                    </span>
                );
            }
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
                <h1 className="text-2xl font-bold">Coupon Management</h1>
                <Button onClick={() => setIsAdding(true)} className="bg-green-600 hover:bg-green-800">Add Coupon</Button>
            </div>

            <Card className="p-4">
                <DataTable
                    data={coupons}
                    columns={columns}
                    searchable={true}
                    searchField="name"
                    isLoading={isLoading}
                />
            </Card>

            <Dialog open={isAdding || isEditing} onOpenChange={(open) => { setIsAdding(false); setIsEditing(false); }}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Coupon' : 'Add New Coupon'}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="code" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Coupon Code</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="SUMMER2025" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="description" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Short discount summary..." />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField
                                    control={form.control}
                                    name="discountType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Discount Type</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(value)}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select discount type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Amount">Amount</SelectItem>
                                                    <SelectItem value="Percentage">Percentage</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField control={form.control} name="discountValue" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Discount Value</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} placeholder="e.g. 500 or 20" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="maxDiscount" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Max Discount (Optional)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} placeholder="Max discount in ₹ (optional)" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="minPurchaseAmount" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Minimum Purchase</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} placeholder="₹ Minimum order to apply coupon" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="expiryDate" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Expiry Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="usageLimit" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Usage Limit</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} placeholder="e.g. 1 or 5" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="applicableSpaceTypes" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Applicable Space Types</FormLabel>
                                        <FormControl>
                                            <Select
                                                multiple
                                                onValueChange={(value) => field.onChange(value)}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select space types..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {spaceTypes.map((space) => (
                                                        <SelectItem key={space._id} value={space._id}>
                                                            {space.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="applicableRooms" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Applicable Rooms</FormLabel>
                                        <FormControl>
                                            <Select
                                                multiple
                                                onValueChange={(value) => field.onChange(value)}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select rooms..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {rooms.map((room) => (
                                                        <SelectItem key={room._id} value={room._id}>
                                                            {room.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="applicableUsers" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Applicable Users</FormLabel>
                                        <FormControl>
                                            <Select
                                                multiple
                                                onValueChange={(value) => field.onChange(value)}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select users..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {users.map((user) => (
                                                        <SelectItem key={user._id} value={user._id}>
                                                            {user.name} - {user.email}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => {
                                        setIsAdding(false);
                                        setIsEditing(false);
                                        form.reset();
                                        setEditData(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-green-600 hover:bg-green-800">
                                    {isEditing ? 'Update' : 'Add'} Coupon
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog open={isViewing} onOpenChange={setIsViewing}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Coupon Details</DialogTitle>
                        <DialogDescription>
                            Detailed information about {selectedData?.code}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedData && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <Label>Coupon Code</Label>
                                <p className="border-dashed border rounded px-2 py-1 border-green-600 text-green-600 font-bold">{selectedData?.code}</p>
                            </div>
                            <div>
                                <Label>Description</Label>
                                <p className="font-medium">{selectedData.description}</p>
                            </div>
                            <div>
                                <Label>Allowed Slots</Label>
                                <p className="font-medium">{selectedData?.allowedSlots?.join(', ') || 'N/A'}</p>
                            </div>
                            <div>
                                <Label>Status</Label>
                                <p className={`font-semibold ${selectedData.isActive ? 'text-green-600' : 'text-red-500'}`}>
                                    {selectedData.isActive ? 'Active' : 'Inactive'}
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
                            Are you sure you want to delete <strong>{deleteData?.code}</strong>? This action cannot be undone.
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

export default Coupons;