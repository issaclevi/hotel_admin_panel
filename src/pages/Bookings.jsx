import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronLeft, ChevronRight, Edit, Trash } from 'lucide-react';
import { deleteBookings, getAllBookings } from '../services/booking';

// Skeleton loader
const SkeletonBox = () => (
  <div className="h-20 border bg-gray-200 animate-pulse rounded"></div>
);

const views = ['week', 'month', 'year'];

function getGridDates(view, baseDate) {
  const dates = [];
  if (view === 'day') {
    dates.push(baseDate);
  } else if (view === 'week') {
    const startOfWeek = new Date(baseDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    for (let i = 0; i < 7; i++) {
      dates.push(new Date(startOfWeek.getTime() + i * 86400000));
    }
  } else if (view === 'month') {
    const startOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
    const endOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay();
    let date = new Date(startOfMonth);
    date.setDate(date.getDate() - startDay);
    for (let i = 0; i < 42; i++) {
      dates.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
  } else if (view === 'year') {
    for (let i = 0; i < 12; i++) {
      dates.push(new Date(baseDate.getFullYear(), i, 1));
    }
  }
  return dates;
}

const bookingColors = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500',
  'bg-pink-500', 'bg-yellow-500', 'bg-indigo-500',
  'bg-red-500', 'bg-teal-500',
];

const Bookings = () => {

  const [view, setView] = useState('month');
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const res = await getAllBookings();
      if (!res?.success) throw new Error(res?.message || 'Failed to fetch bookings');
      const result = res.data;

      return result.map((b, index) => ({
        ...b,
        id: b._id,
        notes: b.title || '',
        name: b.name,
        day: format(parseISO(b.start_date), 'yyyy-MM-dd'),
        start: b.timeRanges?.[0] || 'N/A',
        end: b.timeRanges?.[b.timeRanges.length - 1] || 'N/A',
        startDate: b.start_date,
        endDate: b.end_date,
        color: bookingColors[index % bookingColors.length],
      }));
    },
  });

  const changeDate = (direction) => {
    const newDate = new Date(currentDate);
    if (view === 'day') newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    else if (view === 'week') newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    else if (view === 'month') newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    else if (view === 'year') newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const datesToShow = getGridDates(view, currentDate);

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setShowDeleteDialog(true);
  };

  const queryClient = useQueryClient();

  const deleteBookingMutation = useMutation({
    mutationFn: async (id) => {
      const response = await deleteBookings(id);
      if (response.statusCode !== 200) {
        throw new Error('Failed to delete booking');
      }
      return response;
    },
    onSuccess: () => {
      toast({ title: 'Deleted', description: 'Booking deleted successfully.' });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setShowDeleteDialog(false);
      setSelectedId(null);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete booking', variant: 'destructive' });
    },
  });

  return (
    <div className="p-4 border-2">
      <h2 className="text-2xl font-bold mb-4">Bookings</h2>

      <div className="flex justify-between items-center flex-wrap mb-4 gap-2">
        <div className="flex items-center gap-2">
          <button onClick={() => changeDate('prev')} className="px-3 py-1 rounded text-sm">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-lg font-bold">
            {format(currentDate, view === 'year' ? 'yyyy' : view === 'month' ? 'MMMM yyyy' : 'MMM d, yyyy')}
          </span>
          <button onClick={() => changeDate('next')} className="px-3 py-1 rounded text-sm">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-2">
          {views.map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 rounded text-sm ${view === v ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-800'}`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {view !== 'year' && (
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-sm font-semibold text-gray-700">
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
            <div key={day} className="bg-gray-100 py-2 rounded">{day}</div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-7 gap-2 min-w-full">
          {Array.from({ length: view === 'year' ? 12 : view === 'week' ? 7 : view === 'day' ? 1 : 42 }).map((_, idx) => (
            <SkeletonBox key={idx} />
          ))}
        </div>
      ) : (
        <div className={`grid ${view === 'year' ? 'grid-cols-4' : 'grid-cols-7'} gap-2 min-w-full`}>
          {datesToShow.map((date, idx) => (
            <div key={idx} className="border p-2 min-h-[80px] relative">
              {view !== 'year' ? (
                <div className="text-xs font-semibold text-right">{format(date, 'd')}</div>
              ) : (
                <div className="text-center font-bold">{format(date, 'MMM')}</div>
              )}

              {view !== 'year' &&
                bookings
                  .filter((b) => {
                    const start = new Date(b.startDate);
                    const end = new Date(b.endDate);
                    return date >= start && date <= end;
                  })
                  .map((booking, idx2) => (
                    <DropdownMenu key={idx2}>
                      <DropdownMenuTrigger asChild>
                        <div className={`${booking.color} text-white text-xs px-2 py-1 rounded mt-1 cursor-pointer`}>
                          <p className="font-semibold truncate">{booking?.roomId?.name}</p>
                          <p className="truncate">{booking?.name}</p>
                          <p className="text-[10px]">{`${booking?.start}, ${booking?.end}`}</p>
                          <p className="text-[10px]">
                            {`${format(parseISO(booking.start_date), 'dd EEE MMM yyyy')} - ${format(parseISO(booking.end_date), 'dd EEE MMM yyyy')}`}
                          </p>
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[500px] p-0" align="start">
                        <div className="flex">
                          <div className="w-1/2 p-4 border-r">
                            <div className={`${booking.color} text-white px-3 py-2 rounded mb-3`}>
                              <h3 className="font-semibold">Booking Details</h3>
                              <p className="text-xs opacity-80">
                                {format(parseISO(booking.start_date), 'dd EEE MMM yyyy')} - {booking?.start_time}
                              </p>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between"><span className="font-medium text-gray-600">Booking ID:</span><span>{booking.bookingId}</span></div>
                              <div className="flex justify-between"><span className="font-medium text-gray-600">Location:</span><span>{booking?.roomId?.location}</span></div>
                              <div className="flex justify-between"><span className="font-medium text-gray-600">Room:</span><span>{booking.roomId?.name}</span></div>
                              <div className="flex justify-between"><span className="font-medium text-gray-600">Space Type:</span><span>{booking.spaceType?.name}</span></div>
                              <div className="flex justify-between">
                                <span className="font-medium text-gray-600">Duration:</span>
                                <span>
                                  {booking.timeRanges.length > 0
                                    ? `${booking.timeRanges[0]} to ${booking.timeRanges[booking.timeRanges.length - 1]}`
                                    : 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="w-1/2 p-4">
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between"><span className="font-medium text-gray-600">Name:</span><span>{booking?.userId?.name}</span></div>
                              <div className="flex justify-between"><span className="font-medium text-gray-600">Email:</span><span>{booking?.userId?.email}</span></div>
                              <div className="flex justify-between"><span className="font-medium text-gray-600">Guests:</span><span>{booking?.guests} Member</span></div>
                              <div className="flex justify-between"><span className="font-medium text-gray-600">Price/Hour:</span><span>₹{booking?.roomId?.pricePerHour}</span></div>
                              <div className="flex justify-between"><span className="font-medium text-gray-600">Fees & Tax:</span><span>₹{booking?.serviceFeeAndTax}</span></div>
                              <div className="flex justify-between pt-2 border-t mt-2"><span className="font-semibold">Total:</span><span className="font-semibold text-green-600">₹{booking.totalAmount}</span></div>
                            </div>
                          </div>
                        </div>
                        <div className="border-t p-3 flex justify-between items-center gap-2">
                          <div className={`px-2 py-1 rounded-md mb-3 ${booking?.status === 'Booked' ? 'bg-green-100 text-green-800'
                            : booking?.status === 'Pending' ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                            }`}>
                            <span className="font-semibold capitalize text-xs">{booking?.status}</span>
                          </div>
                          <div className="flex gap-2">
                            <Edit className="h-4 w-4 text-blue-800 cursor-pointer" />
                            <Trash
                              className="h-4 w-4 text-red-500 cursor-pointer"
                              onClick={() => handleDeleteClick(booking?._id)}
                            />
                          </div>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ))}
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedId) {
                  deleteBookingMutation.mutate(selectedId);
                }
              }}
              disabled={deleteBookingMutation.isLoading}
            >
              {deleteBookingMutation.isLoading ? 'Deleting...' : 'Delete'}
            </Button>

          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Bookings;