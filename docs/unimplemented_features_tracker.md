# 📋 TrekPal Traveler App - Unimplemented & Mocked Features Tracker

This document tracks traveler mobile application features that are currently implemented as **visual mockups/placeholders** to match the new redesign, and need backend/database integrations later.

---

## 🏔️ Discover Hub (Explore Tab)

### 🔍 1. Tour Search & Filter Settings [COMPLETED]
- **Implementation State:** Fully integrated. Users can type search queries matching package titles/agencies/destinations, and press the tune icon to open a Modal Bottom Sheet to filter by Price, Duration, Seat Availability, and Sorting order.

### 🏷️ 2. Category Chips Filtering [COMPLETED]
- **Implementation State:** Fully integrated. Selecting activity chips (Trekking, Camping, etc.) filters package results in real-time by scanning keywords in titles, descriptions, and destinations.

### 🏨 3. Quick Portals (Hotels & Transport) [COMPLETED]
- **Implementation State:** Fully integrated. Tapping "Hotels" routes to `HotelsListPage` fetching live database entries via `HotelsProvider`. Tapping "Transport" routes to `VehiclesListPage` fetching active vehicle providers via `TransportProvider`. Both pages feature search, visual dark cards, and dynamic filter criteria.

### 🎟️ 4. Expedition Detail & Direct Booking
- **Current State:** Dynamic package cards fetched via `PackagesProvider` from the backend API. Tapping "Book" navigates to the real `PackageOfferDetailsPage` for that package.
- **Unimplemented Behavior:** Booking confirmation does not process credit cards or dynamic mobile wallets.
- **Future Integration:** Wire payment gateway systems (Stripe/easypaisa) inside `PackageOfferDetailsPage` checkout forms.

---

## 💬 Negotiation & Bidding Chat

### 🤝 1. Custom Bid Cards in Chat Stream
- **Current State:** Embedded proposal card displays inside the negotiation log showing bid pricing and inclusions.
- **Unimplemented Behavior:** "Accept Bid" and "Decline Bid" buttons are styled placeholders.
- **Future Integration:** Accept triggers a payment request and redirects to `BookingDetailsPage`. Decline sends status update to backend.

### ✏️ 2. Counter-Offer Form Submission
- **Current State:** Form fields (Budget input, stay/transport checkboxes, custom notes) display on active traveler turn.
- **Unimplemented Behavior:** The form lacks full form-validation and connection to the websocket counter-offer channel.
- **Future Integration:** Connect to Socket.io event `submit_counter_offer` to send updated specifications to the agency in real-time.
