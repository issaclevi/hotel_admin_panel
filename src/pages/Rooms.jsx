import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Eye, Trash, Upload, Plus, X, Loader2 } from 'lucide-react';
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
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { createRoom, deleteRoom, getAllRooms, updateRoom } from '../services/room';
import { uploadImage } from '../services/upload';
import { getAllSpaceType } from '../services/spaceType';

const currencyOptions = [
    {
        code: "INR",
        symbol: "₹",
        name: "Indian Rupee"
    },
    {
        code: "USD",
        symbol: "$",
        name: "US Dollar"
    },
    {
        code: "EUR",
        symbol: "€",
        name: "Euro"
    }
];

const Rooms = () => {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isViewing, setIsViewing] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const queryClient = useQueryClient();

    const { data: roomResponse = { data: [] }, isLoading } = useQuery({
        queryKey: ['room'],
        queryFn: getAllRooms,
    });

    const { data: spaceTypeResponse = { data: [] }, isLoading: spaceTypeLoading } = useQuery({
        queryKey: ['spaceType'],
        queryFn: getAllSpaceType,
    });

    const rooms = roomResponse?.data || [];
    const spaceType = spaceTypeResponse?.data || [];

    const form = useForm({
        defaultValues: {
            name: '',
            description: '',
            location: '',
            pricePerHour: '',
            spaceTypeId: '',
            capacity: '',
            currency: currencyOptions[0],
            imageUrl: '',
            amenities: [],
            openingHours: {
                monday: { open: '', close: '' },
                tuesday: { open: '', close: '' },
                wednesday: { open: '', close: '' },
                thursday: { open: '', close: '' },
                friday: { open: '', close: '' },
                saturday: { open: '', close: '' },
                sunday: { open: '', close: '' },
            }
        },
    });

    const handleViewRoom = (room) => {
        setSelectedRoom(room);
        setIsViewing(true);
    };

    const handleAddClick = () => {
        form.reset({
            name: '',
            description: '',
            location: '',
            pricePerHour: '',
            spaceTypeId: '',
            capacity: '',
            currency: currencyOptions[0],
            imageUrl: '',
            amenities: [],
            openingHours: {
                monday: { open: '', close: '' },
                tuesday: { open: '', close: '' },
                wednesday: { open: '', close: '' },
                thursday: { open: '', close: '' },
                friday: { open: '', close: '' },
                saturday: { open: '', close: '' },
                sunday: { open: '', close: '' },
            }
        });
        setIsEditing(false);
        setSelectedRoom(null);
        setIsDialogOpen(true);
    };

    const handleEditClick = (room) => {
        form.reset({
            name: room.name,
            description: room.description,
            location: room.location,
            pricePerHour: room.pricePerHour,
            capacity: room.capacity,
            spaceTypeId: room.spaceType?._id || '',
            currency: room.currency,
            imageUrl: room.imageUrl,
            amenities: room.amenities || []
        });
        setSelectedRoom(room);
        setIsEditing(true);
        setIsDialogOpen(true);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const uploadedUrl = await uploadImage(file);
            form.setValue('imageUrl', uploadedUrl);
            toast({ title: 'Success', description: 'Image uploaded successfully' });
        } catch (error) {
            console.error('Upload failed:', error);
            toast({
                title: 'Upload Error',
                description: error.message || 'Failed to upload image',
                variant: 'destructive'
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleAmenityImageUpload = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const uploadedUrl = await uploadImage(file);
            form.setValue(`amenities.${index}.imageUrl`, uploadedUrl);
            toast({ title: 'Success', description: 'Amenity image uploaded successfully' });
        } catch (error) {
            console.error('Upload failed:', error);
            toast({
                title: 'Upload Error',
                description: error.message || 'Failed to upload amenity image',
                variant: 'destructive'
            });
        } finally {
            setIsUploading(false);
        }
    };

    const removeImage = () => {
        form.setValue('imageUrl', '');
    };

    const removeAmenityImage = (index) => {
        form.setValue(`amenities.${index}.imageUrl`, '');
    };

    const handleSubmit = async (data) => {
        try {

            console.log('Room Data:', data);

            const pricePerHour = Number(data.pricePerHour);
            if (isNaN(pricePerHour)) {
                toast({
                    title: 'Validation Error',
                    description: 'Price per hour must be a valid number',
                    variant: 'destructive'
                });
                return;
            }

            const roomData = {
                name: data.name.trim(),
                description: data.description.trim(),
                location: data.location.trim(),
                pricePerHour: pricePerHour,
                capacity: data.capacity,
                roomSize: data.roomSize,
                currency: data.currency,
                spaceTypeId: data.spaceTypeId,
                imageUrl: data.imageUrl.trim(),
                amenities: (data.amenities || [])
                    .filter(amenity => amenity.name.trim())
                    .map(amenity => ({
                        name: amenity.name.trim(),
                        isFree: amenity.isFree || false,
                        price: amenity.isFree ? '0' : String(amenity.price).trim(),
                        imageUrl: amenity.imageUrl.trim()
                    })),
                openingHours: data?.openingHours ?? {
                    monday: { open: '', close: '' },
                    tuesday: { open: '', close: '' },
                    wednesday: { open: '', close: '' },
                    thursday: { open: '', close: '' },
                    friday: { open: '', close: '' },
                    saturday: { open: '', close: '' },
                    sunday: { open: '', close: '' },
                },
            };

            let response;
            if (isEditing && selectedRoom) {
                response = await updateRoom(selectedRoom._id, roomData);
            } else {
                response = await createRoom(roomData);
            }

            if (response.statusCode === 400) {
                toast({
                    title: 'Something went wrong',
                    description: response.data.message || 'Failed to process room',
                    variant: 'destructive'
                });
                return;
            }

            if (response?.status === 200 || response?.statusCode === 200) {
                toast({
                    title: isEditing ? 'Room Updated' : 'Room Added',
                    description: `${data.name} ${isEditing ? 'updated' : 'added'} successfully.`,
                });
                queryClient.invalidateQueries({ queryKey: ['room'] });
                setIsDialogOpen(false);
                form.reset();
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message || 'Something went wrong',
                variant: 'destructive'
            });
        }
    };

    const handleDeleteClick = (id) => {
        setSelectedRoomId(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedRoomId) return;
        try {
            const response = await deleteRoom(selectedRoomId);
            if (response.statusCode === 200) {
                toast({ title: 'Deleted', description: 'Room deleted successfully.' });
                queryClient.invalidateQueries({ queryKey: ['room'] });
            } else {
                toast({ title: 'Error', description: 'Failed to delete room', variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Delete failed', variant: 'destructive' });
        } finally {
            setDeleteDialogOpen(false);
            setSelectedRoomId(null);
        }
    };

    const columns = [
        {
            header: 'Image',
            accessor: 'imageUrl',
            cell: (row) => (
                <img
                    src={row?.imageUrl || '/default-room.png'}
                    alt="Room"
                    className="h-20 w-40 rounded-md object-cover"
                />
            ),
        },
        { header: 'Name', accessor: 'name' },
        { header: 'Description', accessor: 'description' },
        { header: 'Location', accessor: 'location' },
        {
            header: 'Price Per Hour',
            accessor: 'pricePerHour',
            cell: (row) => (
                <span>
                    {row?.currency?.symbol || '₹'}
                    {row?.pricePerHour}
                </span>
            ),
        },
        {
            header: 'Amenities',
            accessor: 'amenities',
            cell: (row) => (
                <div className="flex flex-wrap gap-2">
                    {row?.amenities?.map((item, index) => (
                        <Tooltip key={index}>
                            <TooltipTrigger>
                                <img
                                    src={item.imageUrl || '/default-amenity.png'}
                                    alt={item.name}
                                    className="h-6 w-6 rounded-full object-cover"
                                />
                            </TooltipTrigger>
                            <TooltipContent>{item.name}</TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            ),
        },
        {
            header: 'Actions',
            accessor: '',
            cell: (row) => (
                <div className="text-right flex items-center justify-center gap-2">
                    <Eye
                        onClick={() => handleViewRoom(row)}
                        className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-blue-500"
                    />
                    <Edit
                        onClick={() => handleEditClick(row)}
                        className="h-4 w-4 text-blue-800 cursor-pointer hover:text-blue-600"
                    />
                    <Trash
                        onClick={() => handleDeleteClick(row?._id)}
                        className="h-4 w-4 text-red-500 cursor-pointer hover:text-red-700"
                    />
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Room Management</h1>
                <Button onClick={handleAddClick} className="bg-green-600 hover:bg-green-800">
                    Add Room
                </Button>
            </div>

            <Card className="p-4">
                <DataTable
                    data={rooms}
                    columns={columns}
                    searchable={true}
                    searchField="name"
                    isLoading={isLoading}
                />
            </Card>

            {/* Add/Edit Room Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Room' : 'Add New Room'}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="e.g Conference Room A"
                                                    required
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Location *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Floor 3, Building B"
                                                    required
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="e.g Spacious meeting room with projector"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="pricePerHour"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price Per Hour *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    min="1"
                                                    placeholder="100"
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        field.onChange(value === "" ? "" : Number(value));
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="capacity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Capacity*</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    min="1"
                                                    placeholder="10"
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        field.onChange(value === "" ? "" : Number(value));
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="roomSize"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Room Size*</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    min="1"
                                                    placeholder="0"
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        field.onChange(value === "" ? "" : Number(value));
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="currency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Currency *</FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    const selected = currencyOptions.find(c => c.code === value);
                                                    field.onChange(selected);
                                                }}
                                                value={field.value?.code}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select currency" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {currencyOptions.map((currency) => (
                                                        <SelectItem key={currency.code} value={currency.code}>
                                                            {currency.name} ({currency.symbol})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="spaceTypeId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Space Type *</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(value)}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Space Type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {spaceType?.map((sp) => (
                                                        <SelectItem key={sp._id} value={sp._id}>
                                                            {sp.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-2">
                                    <Label>Room Image *</Label>
                                    <div className="flex items-center gap-4">
                                        {form.watch('imageUrl') ? (
                                            <div className="relative">
                                                <img
                                                    src={form.watch('imageUrl')}
                                                    alt="Room preview"
                                                    className="h-32 w-48 rounded-md object-cover"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    className="absolute -top-2 -right-2 p-1 rounded-full"
                                                    onClick={removeImage}
                                                    disabled={isUploading}
                                                >
                                                    ×
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="border-2 border-dashed rounded-md p-4 w-full">
                                                <Label htmlFor="imageUpload" className="flex flex-col items-center gap-2 cursor-pointer">
                                                    <Upload className="h-6 w-6" />
                                                    <span>Upload Image</span>
                                                    {isUploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
                                                </Label>
                                                <Input
                                                    id="imageUpload"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleImageUpload}
                                                    disabled={isUploading}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 md:col-span-2">
                                    <Label className="text-base font-semibold">Opening Hours</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((day) => (
                                            <div key={day} className="border rounded-md p-3 bg-gray-50">
                                                <p className="capitalize font-medium mb-2">{day}</p>
                                                <div className="flex gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`openingHours.${day}.open`}
                                                        render={({ field }) => (
                                                            <FormItem className="flex-1">
                                                                <FormLabel>Open</FormLabel>
                                                                <FormControl>
                                                                    <Input type="time" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name={`openingHours.${day}.close`}
                                                        render={({ field }) => (
                                                            <FormItem className="flex-1">
                                                                <FormLabel>Close</FormLabel>
                                                                <FormControl>
                                                                    <Input type="time" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4 md:col-span-2">
                                    <Label>Amenities</Label>
                                    <div className="space-y-4">
                                        {form.watch('amenities')?.map((amenity, index) => (
                                            <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Amenity Name */}
                                                    <FormField
                                                        control={form.control}
                                                        name={`amenities.${index}.name`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Name {amenity.imageUrl && '*'}</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        placeholder="Wi-Fi, Projector, etc."
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name={`amenities.${index}.isFree`}
                                                        render={({ field }) => (
                                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                                                                <FormControl>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={field.value}
                                                                        onChange={field.onChange}
                                                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                    />
                                                                </FormControl>
                                                                <div className="space-y-1 leading-none">
                                                                    <FormLabel>
                                                                        This amenity is free
                                                                    </FormLabel>
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    {!form.watch(`amenities.${index}.isFree`) && (
                                                        <FormField
                                                            control={form.control}
                                                            name={`amenities.${index}.price`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Price {amenity.imageUrl && '*'}</FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            type="number"
                                                                            {...field}
                                                                            placeholder="Price"
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )}

                                                    <FormField
                                                        control={form.control}
                                                        name={`amenities.${index}.imageUrl`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Image</FormLabel>
                                                                <FormControl>
                                                                    <div className="flex items-center gap-2">
                                                                        {field.value ? (
                                                                            <div className="relative">
                                                                                <img
                                                                                    src={field.value}
                                                                                    alt="Amenity preview"
                                                                                    className="h-10 w-10 rounded-md object-cover"
                                                                                />
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="destructive"
                                                                                    size="sm"
                                                                                    className="absolute -top-2 -right-2 p-1 rounded-full"
                                                                                    onClick={() => removeAmenityImage(index)}
                                                                                    disabled={isUploading}
                                                                                >
                                                                                    ×
                                                                                </Button>
                                                                            </div>
                                                                        ) : (
                                                                            <>
                                                                                <Label htmlFor={`amenity-upload-${index}`} className="cursor-pointer">
                                                                                    <div className="flex items-center gap-2 px-3 py-2 border rounded-md">
                                                                                        <Upload className="h-4 w-4" />
                                                                                        <span>Upload</span>
                                                                                    </div>
                                                                                </Label>
                                                                                <Input
                                                                                    id={`amenity-upload-${index}`}
                                                                                    type="file"
                                                                                    accept="image/*"
                                                                                    className="hidden"
                                                                                    onChange={(e) => handleAmenityImageUpload(e, index)}
                                                                                    disabled={isUploading}
                                                                                />
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="mt-8 text-red-500"
                                                    onClick={() => {
                                                        const currentAmenities = form.getValues('amenities');
                                                        form.setValue(
                                                            'amenities',
                                                            currentAmenities.filter((_, i) => i !== index)
                                                        );
                                                    }}
                                                    disabled={isUploading}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}

                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => {
                                                const currentAmenities = form.getValues('amenities') || [];
                                                form.setValue('amenities', [
                                                    ...currentAmenities,
                                                    { name: '', imageUrl: '', isFree: false }
                                                ]);
                                            }}
                                            disabled={isUploading}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Amenity
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => setIsDialogOpen(false)}
                                    disabled={isUploading || form.formState.isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-800"
                                    disabled={isUploading || form.formState.isSubmitting}
                                >
                                    {form.formState.isSubmitting ? (
                                        <span className="flex items-center">
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {isEditing ? 'Updating...' : 'Creating...'}
                                        </span>
                                    ) : (
                                        isEditing ? 'Update Room' : 'Add Room'
                                    )}
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
                            Are you sure you want to delete this room? This action cannot be undone.
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

            {/* View Room Dialog */}
            <Dialog open={isViewing} onOpenChange={setIsViewing}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Room Details</DialogTitle>
                        <DialogDescription>
                            Detailed information about {selectedRoom?.name}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRoom && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <Label className="font-bold">Name</Label>
                                    <p>{selectedRoom.name}</p>
                                </div>
                                <div>
                                    <Label className="font-bold">Description</Label>
                                    <p>{selectedRoom.description}</p>
                                </div>
                                <div>
                                    <Label className="font-bold">Location</Label>
                                    <p>{selectedRoom.location}</p>
                                </div>
                                <div className='flex gap-10'>
                                    <div>
                                        <Label className="font-bold">Price Per Hour</Label>
                                        <p>
                                            {selectedRoom.currency?.symbol || '₹'}
                                            {selectedRoom.pricePerHour}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="font-bold">Capacity</Label>
                                        <p>
                                            {selectedRoom.capacity}
                                        </p>
                                    </div>
                                </div>
                                <div className='flex gap-10'>
                                    <div>
                                        <Label className="font-bold">Room Slot</Label>
                                        <p>
                                            {selectedRoom?.roomSize}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="font-bold">Space Type</Label>
                                        <p>
                                            {selectedRoom?.spaceTypeId?.name}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4 md:col-span-2">
                                    <div>
                                        <Label className="text-base font-bold">Opening Hours</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                            {Object.entries(selectedRoom.openingHours || {}).map(([day, time], idx) => (
                                                <div key={idx} className="border p-3 rounded-md bg-gray-50">
                                                    <p className="capitalize font-medium">{day}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {time.open && time.close
                                                            ? `${time.open} - ${time.close}`
                                                            : 'Closed'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label className="font-bold">Room Image</Label>
                                    <img
                                        src={selectedRoom?.imageUrl || '/default-room.png'}
                                        alt={selectedRoom?.name}
                                        className="h-48 w-full object-cover rounded-md mt-2"
                                    />
                                </div>
                                <div>
                                    <Label className="font-bold">Amenities</Label>
                                    {selectedRoom?.amenities?.some(item => item.isFree) && (
                                        <div className="mt-4">
                                            <h4 className="text-sm font-medium mb-2">Free Amenities</h4>
                                            <div className="flex flex-wrap gap-4">
                                                {selectedRoom?.amenities
                                                    ?.filter(item => item?.isFree)
                                                    .map((item, index) => (
                                                        <div key={`free-${index}`} className="flex flex-col items-center">
                                                            <img
                                                                src={item?.imageUrl || '/default-amenity.png'}
                                                                alt={item?.name}
                                                                className="h-5 w-5 object-cover rounded-full"
                                                            />
                                                            <span className="text-sm mt-1">{item?.name}</span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                    {selectedRoom.amenities?.some(item => !item?.isFree) && (
                                        <div className="mt-4">
                                            <h4 className="text-sm font-medium mb-2">Paid Amenities</h4>
                                            <div className="flex flex-wrap gap-4">
                                                {selectedRoom.amenities
                                                    ?.filter(item => !item?.isFree)
                                                    .map((item, index) => (
                                                        <div key={`paid-${index}`} className="flex flex-col items-center">
                                                            <img
                                                                src={item.imageUrl || '/default-amenity.png'}
                                                                alt={item.name}
                                                                className="h-5 w-5 object-cover rounded-full"
                                                            />
                                                            <span className="text-sm mt-1">{item.name} - ₹{item.price}</span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
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

export default Rooms;