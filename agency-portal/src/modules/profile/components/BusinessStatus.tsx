import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchAgencyBids } from '../../bids/store/bidsSlice';
import { fetchBookings } from '../../bookings/store/bookingsSlice';
import { fetchHotels } from '../../hotels/store/hotelsSlice';
import { fetchVehicles } from '../../transport/store/transportSlice';
import { RootState } from '../../../store';
import { formatDate } from '../../../shared/utils/formatters';

const BusinessStatus = () => {
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

  const checks = [
    {
      title: 'Account approval',
      description: 'Agency login access is active and marketplace operations are unlocked.',
      complete: user?.role === 'AGENCY',
    },
    {
      title: 'Hotel inventory',
      description: 'At least one hotel should be listed so stay-inclusive offers can be packaged quickly.',
      complete: hotels.length > 0,
    },
    {
      title: 'Vehicle inventory',
      description: 'Fleet coverage improves transport bundling and commercial response speed.',
      complete: vehicles.length > 0,
    },
    {
      title: 'Negotiation flow',
      description: 'Open bid threads show the agency can respond to traveler negotiations in the marketplace.',
      complete: bids.length > 0,
    },
    {
      title: 'Booking operations',
      description: 'Confirmed or completed bookings indicate downstream servicing is established.',
      complete: bookings.some((booking) => booking.status === 'CONFIRMED' || booking.status === 'COMPLETED'),
    },
  ];

  const completionCount = checks.filter((item) => item.complete).length;

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="app-card px-6 py-6 md:px-8 md:py-8">
          <div className="app-section-label">Business status</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text)]">Operational readiness and business posture</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-muted)]">
            This status board mirrors the Stitch business-status surface: one place to verify that access, inventory, negotiation, and booking operations are all in a healthy state.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="app-card-subtle px-5 py-5">
              <div className="app-section-label">Completion</div>
              <div className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text)]">{completionCount}/5</div>
              <div className="mt-2 text-sm text-[var(--text-muted)]">Readiness checks satisfied</div>
            </div>
            <div className="app-card-subtle px-5 py-5">
              <div className="app-section-label">Awaiting response</div>
              <div className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text)]">
                {bids.filter((bid) => bid.awaitingActionBy === 'AGENCY' && bid.status === 'PENDING').length}
              </div>
              <div className="mt-2 text-sm text-[var(--text-muted)]">Negotiations currently on the agency</div>
            </div>
            <div className="app-card-subtle px-5 py-5">
              <div className="app-section-label">Last reviewed</div>
              <div className="mt-2 text-lg font-semibold tracking-tight text-[var(--text)]">
                {formatDate(new Date(), { month: 'long', day: 'numeric' })}
              </div>
              <div className="mt-2 text-sm text-[var(--text-muted)]">Local dashboard snapshot</div>
            </div>
          </div>
        </div>

        <div className="app-panel-dark px-6 py-6">
          <div className="app-section-label text-white/55">Agency access</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Active session</h2>
          <p className="mt-4 text-sm leading-7 text-white/70">
            This workspace has active marketplace access, so quoting, booking execution, and inventory management are available from the same session.
          </p>

          <div className="mt-6 space-y-3">
            <div className="rounded-[22px] border border-white/8 bg-white/6 px-4 py-4 text-sm leading-7 text-white/76">
              Hotels listed: {hotels.length}
            </div>
            <div className="rounded-[22px] border border-white/8 bg-white/6 px-4 py-4 text-sm leading-7 text-white/76">
              Vehicles listed: {vehicles.length}
            </div>
            <div className="rounded-[22px] border border-white/8 bg-white/6 px-4 py-4 text-sm leading-7 text-white/76">
              Confirmed bookings: {bookings.filter((booking) => booking.status === 'CONFIRMED').length}
            </div>
          </div>
        </div>
      </section>

      <section className="app-table-shell">
        <div className="border-b border-[var(--border)] px-6 py-5">
          <div className="app-section-label">Readiness checklist</div>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--text)]">Business operations checks</h2>
        </div>

        <div className="grid gap-4 px-6 py-6">
          {checks.map((item) => (
            <div key={item.title} className="app-card-subtle flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div
                  className={`mt-1 flex h-10 w-10 items-center justify-center rounded-full ${
                    item.complete ? 'bg-[var(--success-bg)] text-[var(--success-text)]' : 'bg-[var(--warning-bg)] text-[var(--warning-text)]'
                  }`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {item.complete ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                    )}
                  </svg>
                </div>
                <div>
                  <div className="text-base font-semibold tracking-tight text-[var(--text)]">{item.title}</div>
                  <div className="mt-1 text-sm leading-7 text-[var(--text-muted)]">{item.description}</div>
                </div>
              </div>

              <div className={`app-pill ${item.complete ? 'app-pill-success' : 'app-pill-warning'}`}>
                {item.complete ? 'Ready' : 'Needs attention'}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BusinessStatus;
