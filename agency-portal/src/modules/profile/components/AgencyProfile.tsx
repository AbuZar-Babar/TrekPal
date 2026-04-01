import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchAgencyBids } from '../../bids/store/bidsSlice';
import { fetchBookings } from '../../bookings/store/bookingsSlice';
import { fetchHotels } from '../../hotels/store/hotelsSlice';
import { fetchVehicles } from '../../transport/store/transportSlice';
import { RootState } from '../../../store';
import { formatCompactNumber, formatDate, formatShortId } from '../../../shared/utils/formatters';

const AgencyProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { vehicles } = useSelector((state: RootState) => state.transport);
  const { hotels } = useSelector((state: RootState) => state.hotels);
  const { bids } = useSelector((state: RootState) => state.bids);
  const { bookings } = useSelector((state: RootState) => state.bookings);

  useEffect(() => {
    dispatch(fetchVehicles({ limit: 100 }) as any);
    dispatch(fetchHotels({ limit: 100 }) as any);
    dispatch(fetchAgencyBids({ limit: 100 }) as any);
    dispatch(fetchBookings({ limit: 100 }) as any);
  }, [dispatch]);

  const overview = [
    {
      label: 'Active offer threads',
      value: formatCompactNumber(bids.filter((bid) => bid.status === 'PENDING').length),
    },
    {
      label: 'Managed inventory',
      value: formatCompactNumber(vehicles.length + hotels.length),
    },
    {
      label: 'Bookings handled',
      value: formatCompactNumber(bookings.length),
    },
  ];

  const operationalNotes = [
    `${vehicles.filter((vehicle) => vehicle.status === 'APPROVED').length} approved vehicle listings ready for transport packaging.`,
    `${hotels.filter((hotel) => hotel.status === 'APPROVED').length} approved hotel properties available for bundling into offers.`,
    `${bids.filter((bid) => bid.awaitingActionBy === 'AGENCY' && bid.status === 'PENDING').length} negotiations are waiting on an agency response.`,
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="app-card px-6 py-6 md:px-8 md:py-8">
          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="app-section-label">Agency profile</div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text)]">Business identity and access</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--text-muted)]">
                This view anchors the current agency session, operational capacity, and live marketplace readiness based on the data already present in the portal.
              </p>
            </div>
            <div className="app-pill app-pill-success">Approved access</div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="app-card-subtle px-5 py-5">
              <div className="app-section-label">Primary identity</div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--text-muted)]">Agency name</span>
                  <span className="font-semibold text-[var(--text)]">{user?.name || 'Agency workspace'}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--text-muted)]">Email</span>
                  <span className="font-semibold text-[var(--text)]">{user?.email || 'Not available'}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--text-muted)]">Portal role</span>
                  <span className="font-semibold text-[var(--text)]">{user?.role || 'AGENCY'}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--text-muted)]">Profile ID</span>
                  <span className="font-semibold text-[var(--text)]">{formatShortId(user?.id)}</span>
                </div>
              </div>
            </div>

            <div className="app-card-subtle px-5 py-5">
              <div className="app-section-label">Operational snapshot</div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {overview.map((item) => (
                  <div key={item.label} className="rounded-2xl bg-[var(--panel)] px-4 py-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-[var(--text-soft)]">{item.label}</div>
                    <div className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text)]">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="app-panel-dark px-6 py-6">
          <div className="app-section-label text-white/55">Readiness</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Current business posture</h2>
          <div className="mt-6 space-y-3">
            {operationalNotes.map((note) => (
              <div key={note} className="rounded-[22px] border border-white/8 bg-white/6 px-4 py-4 text-sm leading-7 text-white/78">
                {note}
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-[24px] border border-white/8 bg-white/6 px-4 py-4 text-sm leading-7 text-white/65">
            Session last refreshed on {formatDate(new Date(), { month: 'long', day: 'numeric', year: 'numeric' })}.
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="app-table-shell">
          <div className="border-b border-[var(--border)] px-6 py-5">
            <div className="app-section-label">Operational coverage</div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--text)]">Marketplace capability map</h2>
          </div>
          <div className="grid gap-4 px-6 py-6 md:grid-cols-2">
            <div className="app-card-subtle px-5 py-5">
              <div className="text-sm font-semibold text-[var(--text)]">Inventory depth</div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--text-muted)]">Vehicles listed</span>
                  <span className="font-semibold text-[var(--text)]">{vehicles.length}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--text-muted)]">Hotels listed</span>
                  <span className="font-semibold text-[var(--text)]">{hotels.length}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--text-muted)]">Approved inventory</span>
                  <span className="font-semibold text-[var(--text)]">
                    {vehicles.filter((vehicle) => vehicle.status === 'APPROVED').length + hotels.filter((hotel) => hotel.status === 'APPROVED').length}
                  </span>
                </div>
              </div>
            </div>
            <div className="app-card-subtle px-5 py-5">
              <div className="text-sm font-semibold text-[var(--text)]">Commercial motion</div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--text-muted)]">Pending offer threads</span>
                  <span className="font-semibold text-[var(--text)]">{bids.filter((bid) => bid.status === 'PENDING').length}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--text-muted)]">Confirmed bookings</span>
                  <span className="font-semibold text-[var(--text)]">{bookings.filter((booking) => booking.status === 'CONFIRMED').length}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--text-muted)]">Completed trips</span>
                  <span className="font-semibold text-[var(--text)]">{bookings.filter((booking) => booking.status === 'COMPLETED').length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="app-card px-6 py-6">
          <div className="app-section-label">Access notes</div>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--text)]">Portal status guidance</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-[var(--text-muted)]">
            <p>
              Logged-in agency sessions are already admin-approved. If business documentation changes outside this portal, update the backend-admin workflow before relying on the current approval state for compliance checks.
            </p>
            <p>
              The profile surface focuses on operations data available to the portal today. Deep business-document editing can be added later once the backend exposes a full agency profile endpoint.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AgencyProfile;
