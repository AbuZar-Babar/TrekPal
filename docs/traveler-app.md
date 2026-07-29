# 📱 TrekPal Traveler App

The Traveler App is a cross-platform mobile application designed for tourists and travelers to browse tours, request custom trip packages, chat with agencies, and manage their trips.

## 🛠️ Technology Stack
* **Framework**: Flutter SDK (v3.x)
* **Language**: Dart
* **State Management**: Provider
* **API Client**: HTTP package
* **Real-time**: Socket.io Client (Dart)

## 🔄 How it Works
1. **Explore & Book**: Travelers browse trips published by agencies and book predefined packages.
2. **Custom Bidding Requests**: Travelers can submit custom tour requests (specifying duration, budget, hotel preferences, and destinations). Registered agencies bid on these requests.
3. **Interactive Messenger**: Integrated live chat lets travelers message bidding agencies directly to negotiate package details.
4. **Offline Caching**: Caches user sessions and core configurations using shared preferences.

## 🚀 Setup & Launch

### Run in Emulator/Device
1. Fetch packages:
   ```bash
   flutter pub get
   ```
2. Build and launch:
   ```bash
   flutter run
   ```
*Configure `API_BASE_URL` in launch configuration settings to toggle between localhost and production Render backends.*
