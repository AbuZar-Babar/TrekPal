class CancelBookingUseCase {
  const CancelBookingUseCase();

  Never call(String bookingId) {
    throw UnsupportedError(
      'Traveler booking cancellation is not available in the current backend flow.',
    );
  }
}
