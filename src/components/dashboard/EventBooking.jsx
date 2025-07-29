import { Button } from '@/components/ui/button';
import Card from '@/components/common/Card';
import StatusBadge from '@/components/common/StatusBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MoreHorizontal, RefreshCw } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Mock data for event bookings
const bookings = [
  {
    id: 1,
    type: 'event',
    title: 'Wedding Ceremony',
    description: 'Booking #5678 for Rahul Sharma',
    time: '10 minutes ago',
    status: 'Confirmed',
    customer: { name: 'Rahul S', initials: 'RS' },
    eventDate: '2025-05-15',
  },
  {
    id: 2,
    type: 'event',
    title: 'Corporate Seminar',
    description: 'Booking #5677 for Priya M',
    time: '1 hour ago',
    status: 'Completed',
    customer: { name: 'Priya M', initials: 'PM' },
    eventDate: '2025-04-10',
  },
  {
    id: 3,
    type: 'event',
    title: 'Birthday Party',
    description: 'Booking #5676 for Aarav Singh',
    time: '3 hours ago',
    status: 'Pending',
    customer: { name: 'Aarav S', initials: 'AS' },
    eventDate: '2025-06-05',
  },
  {
    id: 4,
    type: 'event',
    title: 'Product Launch',
    description: 'Booking #5675 for System',
    time: '5 hours ago',
    status: 'Cancelled',
    customer: { name: 'System', initials: 'SY' },
    eventDate: '2025-03-20',
  },
];

const getStatusVariant = (status) => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'confirmed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'cancelled':
      return 'destructive';
    default:
      return 'default';
  }
};

const EventBooking = () => {
  return (
    <Card 
      title="Event Bookings" 
      description="Latest event bookings and updates"
      headerAction={
        <Button variant="ghost" size="sm" className="gap-1">
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      }
    >
      <div className="space-y-5">
        {bookings.map((booking) => (
          <div key={booking.id} className="flex gap-4">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary">
                {booking.customer.initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{booking.title}</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View details</DropdownMenuItem>
                    <DropdownMenuItem>Cancel booking</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-sm text-muted-foreground">{booking.description}</p>
              <div className="flex items-center gap-2 pt-1">
                <StatusBadge status={booking.status} variant={getStatusVariant(booking.status)} />
                <span className="text-xs text-muted-foreground">{booking.time}</span>
              </div>
              <div className="pt-1">
                <p className="text-xs text-muted-foreground">Event Date: {booking.eventDate}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default EventBooking;