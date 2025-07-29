import Stats from "@/components/dashboard/Stats";
import EventBooking from "@/components/dashboard/EventBooking";
import Card from "@/components/common/Card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink } from "lucide-react";

// Mock data for events and meeting room bookings
const eventBookings = [
  {
    id: 1,
    title: "Corporate Meeting",
    description: "Booking #1234 for Rahul Sharma",
    status: "Confirmed",
    customer: { name: "Rahul S", initials: "RS" },
    eventDate: "2025-05-15",
    room: "Conference Room 1",
  },
  {
    id: 2,
    title: "Product Launch",
    description: "Booking #1235 for Priya M",
    status: "Completed",
    customer: { name: "Priya M", initials: "PM" },
    eventDate: "2025-04-10",
    room: "Conference Room 2",
  },
  {
    id: 3,
    title: "Team Building Activity",
    description: "Booking #1236 for Aarav Singh",
    status: "Pending",
    customer: { name: "Aarav S", initials: "AS" },
    eventDate: "2025-06-05",
    room: "Meeting Room 1",
  },
  {
    id: 4,
    title: "Workshop",
    description: "Booking #1237 for System",
    status: "Cancelled",
    customer: { name: "System", initials: "SY" },
    eventDate: "2025-03-20",
    room: "Meeting Room 2",
  },
];

const meetingRoomsData = [
  {
    id: 1,
    name: "Meeting Room A",
    bookings: 25,
    revenue: "₹50,000",
    status: "available",
  },
  {
    id: 2,
    name: "Meeting Room B",
    bookings: 15,
    revenue: "₹30,000",
    status: "booked",
  },
  {
    id: 3,
    name: "Meeting Room C",
    bookings: 8,
    revenue: "₹16,000",
    status: "available",
  },
  {
    id: 4,
    name: "Meeting Room D",
    bookings: 5,
    revenue: "₹10,000",
    status: "maintenance",
  },
];

// Mock data for charts
const salesData = [
  { name: "Jan", total: 4000 },
  { name: "Feb", total: 3000 },
  { name: "Mar", total: 5000 },
  { name: "Apr", total: 4500 },
  { name: "May", total: 6000 },
  { name: "Jun", total: 5500 },
  { name: "Jul", total: 7000 },
];

const getStatusVariant = (status) => {
  switch (status.toLowerCase()) {
    case "completed":
    case "confirmed":
      return "success";
    case "pending":
      return "warning";
    case "cancelled":
      return "destructive";
    case "available":
      return "default";
    case "booked":
      return "info";
    case "maintenance":
      return "default";
    default:
      return "default";
  }
};

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
        <p className="text-muted-foreground">
          Here's an overview of your event and meeting room bookings
        </p>
      </div>

      <Stats />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card
          title="Monthly Revenue"
          description="Overview of event bookings and meeting room reservations"
          className="lg:col-span-2 xl:col-span-1"
        >
          <Tabs defaultValue="bar">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="bar">Bar Chart</TabsTrigger>
                <TabsTrigger value="line">Line Chart</TabsTrigger>
              </TabsList>
              <Button variant="outline" size="sm" className="gap-1">
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Export</span>
              </Button>
            </div>

            <TabsContent value="bar" className="mt-0">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesData}
                    margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.4} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tickMargin={10}
                      interval="preserveStartEnd"
                      padding={{ left: 20, right: 20 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip
                      formatter={(value) => [`₹${value}`, "Revenue"]}
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderColor: "#e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                      }}
                    />
                    <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="line" className="mt-0">
              <div className="h-80 bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData} margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.4} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tickMargin={10}
                      interval="preserveStartEnd"
                      padding={{ left: 20, right: 20 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip
                      formatter={(value) => [`₹${value}`, "Revenue"]}
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderColor: "#e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2, fill: "#fff" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        <EventBooking />

        <Card title="Top Meeting Rooms">
          <div className="space-y-4">
            {meetingRoomsData.map((room) => (
              <div
                key={room.id}
                className="flex items-center gap-4 p-3 rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={`https://avatar.vercel.sh/${room.id}.png`}
                      alt={room.name}
                    />
                    <AvatarFallback>
                      {room.name.split(" ")[0][0]}
                      {room.name.split(" ")[1]?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium truncate">{room.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{room.bookings} bookings this month</p>
                    </div>
                    <p className="text-sm font-semibold">{room.revenue}</p>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      room.status === "available" ? "bg-green-500" : room.status === "booked" ? "bg-blue-500" : "bg-gray-500"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full mt-4">
            View All Meeting Rooms
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;