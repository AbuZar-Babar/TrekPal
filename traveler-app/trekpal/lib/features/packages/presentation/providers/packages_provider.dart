import 'package:flutter/foundation.dart';

import '../../domain/entities/package_offer_entity.dart';
import '../../domain/usecases/apply_package_usecase.dart';
import '../../domain/usecases/get_packages_usecase.dart';

class PackagesProvider extends ChangeNotifier {
  PackagesProvider({
    required GetPackagesUseCase getPackagesUseCase,
    required ApplyPackageUseCase applyPackageUseCase,
  }) : _getPackagesUseCase = getPackagesUseCase,
       _applyPackageUseCase = applyPackageUseCase;

  final GetPackagesUseCase _getPackagesUseCase;
  final ApplyPackageUseCase _applyPackageUseCase;

  List<PackageOfferEntity> _packages = <PackageOfferEntity>[];
  bool _isLoading = false;
  String? _errorMessage;
  String? _applyingPackageId;

  List<PackageOfferEntity> get packages => _packages;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String? get applyingPackageId => _applyingPackageId;

  Future<void> fetchPackages({bool force = false}) async {
    if (_packages.isNotEmpty && !force) {
      return;
    }

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _packages = await _getPackagesUseCase();
    } catch (error) {
      _errorMessage = _readableError(error);
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<String> applyToPackage({
    required String packageId,
    required DateTime startDate,
  }) async {
    _applyingPackageId = packageId;
    _errorMessage = null;
    notifyListeners();

    try {
      return await _applyPackageUseCase(
        packageId: packageId,
        startDate: startDate,
      );
    } catch (error) {
      _errorMessage = _readableError(error);
      rethrow;
    } finally {
      _applyingPackageId = null;
      notifyListeners();
    }
  }

  String _readableError(Object error) {
    final String text = error.toString();
    if (text.startsWith('Exception: ')) {
      return text.substring('Exception: '.length);
    }
    return text;
  }
}
