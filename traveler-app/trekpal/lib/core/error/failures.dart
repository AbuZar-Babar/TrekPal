// TODO: Implement failure classes
// ServerFailure, NetworkFailure, CacheFailure, etc.

sealed class Failure {
  const Failure(this.message);

  final String message;
}

class ApiFailure extends Failure {
  const ApiFailure(super.message);
}

class NetworkFailure extends Failure {
  const NetworkFailure(super.message);
}

class ValidationFailure extends Failure {
  const ValidationFailure(super.message);
}
