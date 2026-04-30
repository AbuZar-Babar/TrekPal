import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchAgencyBids } from '../../bids/store/bidsSlice';
import { fetchBookings } from '../../bookings/store/bookingsSlice';
import { fetchHotels } from '../../hotels/store/hotelsSlice';
import { fetchPackages } from '../../packages/store/packagesSlice';
import { fetchTripRequests } from '../../tripRequests/store/tripRequestsSlice';
import { fetchVehicles } from '../../transport/store/transportSlice';
import { RootState } from '../../../store';
import { formatCurrency } from '../../../shared/utils/formatters';

const Dashboard = () => {
  const dispatch = useDispatch();

  const { user } = useSelector((state: RootState) => state.auth);
  const { vehicles } = useSelector((state: RootState) => state.transport);
  const { hotels } = useSelector((state: RootState) => state.hotels);
  const { packages } = useSelector((state: RootState) => state.packages);
  const { bids } = useSelector((state: RootState) => state.bids);
  const { bookings } = useSelector((state: RootState) => state.bookings);
  const { tripRequests } = useSelector((state: RootState) => state.tripRequests);

  useEffect(() => {
    dispatch(fetchVehicles({ limit: 100 }) as any);
    dispatch(fetchHotels({ limit: 100 }) as any);
    dispatch(fetchPackages({ limit: 100 }) as any);
    dispatch(fetchAgencyBids({ limit: 100 }) as any);
    dispatch(fetchBookings({ limit: 100 }) as any);
    dispatch(fetchTripRequests({ limit: 100 }) as any);
  }, [dispatch]);

  const activeOffers = packages.filter((item) => item.isActive);
  const liveBookings = bookings.filter((item) => item.status !== 'CANCELLED');
  const urgentNegotiations = bids.filter((bid) => bid.awaitingActionBy === 'AGENCY' && bid.status === 'PENDING');
  const availableVehicles = vehicles.filter((vehicle) => vehicle.isAvailable);
  const confirmedRevenue = bookings
    .filter((booking) => booking.status === 'CONFIRMED' || booking.status === 'COMPLETED')
    .reduce((sum, booking) => sum + booking.totalAmount, 0);
  const totalRooms = hotels.reduce(
    (sum, hotel) => sum + (hotel.rooms || []).reduce((roomSum, room) => roomSum + (room.quantity || 0), 0),
    0
  );
  const totalAvailableRooms = hotels.reduce(
    (sum, hotel) =>
      sum +
      (hotel.rooms || []).reduce(
        (roomSum, room) => roomSum + (room.availableQuantity ?? room.quantity ?? 0),
        0
      ),
    0
  );
  const bookedRooms = Math.max(0, totalRooms - totalAvailableRooms);
  const roomOccupancy = totalRooms > 0 ? Math.round((bookedRooms / totalRooms) * 100) : 0;
  const vehicleUtilization =
    vehicles.length > 0 ? Math.round(((vehicles.length - availableVehicles.length) / vehicles.length) * 100) : 0;
  const bookingStatusCounts = {
    CONFIRMED: bookings.filter((booking) => booking.status === 'CONFIRMED').length,
    PENDING: bookings.filter((booking) => booking.status === 'PENDING').length,
    COMPLETED: bookings.filter((booking) => booking.status === 'COMPLETED').length,
    CANCELLED: bookings.filter((booking) => booking.status === 'CANCELLED').length,
  };
  const maxBookingStatusCount = Math.max(1, ...Object.values(bookingStatusCounts));

  const stats = [
    { label: 'Traveler requests', value: tripRequests.length, note: `${urgentNegotiations.length} need a reply` },
    { label: 'Published offers', value: activeOffers.length, note: `${packages.length - activeOffers.length} still hidden` },
    { label: 'Live bookings', value: liveBookings.length, note: `${formatCurrency(confirmedRevenue)} secured` },
    { label: 'Ready inventory', value: hotels.length + availableVehicles.length, note: `${availableVehicles.length} vehicles available` },
  ];

  return (
    <div className="space-y-6">
      <section className="section-title-row">
        <h2 className="section-title">
          Welcome back, {user?.name || 'Agency'}
        </h2>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="surface flex flex-col items-center justify-center p-5 text-center">
            <div className="text-3xl font-bold text-[var(--text)]">{stat.value}</div>
            <div className="mt-2 text-sm font-medium text-[var(--text-soft)]">{stat.label}</div>
            <div className="mt-1 text-xs text-[var(--text-muted)]">{stat.note}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="surface p-5">
          <h3 className="text-lg font-semibold text-[var(--text)]">Booking Analytics</h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Current distribution by booking status.</p>
          <div className="mt-6 space-y-4">
            {Object.entries(bookingStatusCounts).map(([status, count]) => {
              const width = Math.max(8, Math.round((count / maxBookingStatusCount) * 100));
              return (
                <div key={status}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-semibold tracking-wide text-[var(--text-soft)]">{status}</span>
                    <span className="text-[var(--text)]">{count}</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-[var(--panel-subtle)]">
                    <div
                      className="h-2.5 rounded-full bg-[var(--primary)]"
                      style={{ width: `${count === 0 ? 0 : width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="surface p-5">
          <h3 className="text-lg font-semibold text-[var(--text)]">Inventory Utilization</h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">How much hotel and fleet capacity is actively in use.</p>
          <div className="mt-6 space-y-5">
            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-semibold tracking-wide text-[var(--text-soft)]">Room occupancy</span>
                <span className="text-[var(--text)]">{roomOccupancy}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[var(--panel-subtle)]">
                <div className="h-2.5 rounded-full bg-emerald-500" style={{ width: `${roomOccupancy}%` }} />
              </div>
              <div className="mt-1 text-xs text-[var(--text-muted)]">
                {bookedRooms} booked of {totalRooms} total rooms
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-semibold tracking-wide text-[var(--text-soft)]">Vehicle utilization</span>
                <span className="text-[var(--text)]">{vehicleUtilization}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[var(--panel-subtle)]">
                <div className="h-2.5 rounded-full bg-amber-500" style={{ width: `${vehicleUtilization}%` }} />
              </div>
              <div className="mt-1 text-xs text-[var(--text-muted)]">
                {vehicles.length - availableVehicles.length} in use of {vehicles.length} vehicles
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Dashboard;
