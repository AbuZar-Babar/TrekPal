import 'package:flutter/foundation.dart';

import '../../domain/entities/package_offer_entity.dart';
import '../../domain/usecases/apply_package_usecase.dart';
import '../../domain/usecases/get_package_by_id_usecase.dart';
import '../../domain/usecases/get_packages_usecase.dart';

class PackagesProvider extends ChangeNotifier {
  PackagesProvider({
    required GetPackagesUseCase getPackagesUseCase,
    required GetPackageByIdUseCase getPackageByIdUseCase,
    required ApplyPackageUseCase applyPackageUseCase,
  }) : _getPackagesUseCase = getPackagesUseCase,
       _getPackageByIdUseCase = getPackageByIdUseCase,
       _applyPackageUseCase = applyPackageUseCase;

  final GetPackagesUseCase _getPackagesUseCase;
  final GetPackageByIdUseCase _getPackageByIdUseCase;
  final ApplyPackageUseCase _applyPackageUseCase;

  List<PackageOfferEntity> _packages = <PackageOfferEntity>[];
  PackageOfferEntity? _selectedPackage;
  String? _activePackageId;
  bool _isLoading = false;
  String? _errorMessage;
  String? _applyingPackageId;

  List<PackageOfferEntity> get packages => _packages;
  PackageOfferEntity? get selectedPackage => _selectedPackage;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String? get applyingPackageId => _applyingPackageId;

  void setActivePackage(String? packageId) {
    _activePackageId = packageId;
  }

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

  Future<PackageOfferEntity> fetchPackageById(
    String packageId, {
    bool force = false,
  }) async {
    if (!force) {
      final PackageOfferEntity? existing = _packages.cast<PackageOfferEntity?>()
          .firstWhere(
            (PackageOfferEntity? item) => item?.id == packageId,
            orElse: () => null,
          );
      if (existing != null) {
        _selectedPackage = existing;
        notifyListeners();
      }
    }

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final PackageOfferEntity packageOffer = await _getPackageByIdUseCase(
        packageId,
      );
      _selectedPackage = packageOffer;

      final int index = _packages.indexWhere((item) => item.id == packageId);
      if (index == -1) {
        _packages = <PackageOfferEntity>[packageOffer, ..._packages];
      } else {
        final List<PackageOfferEntity> updated = List<PackageOfferEntity>.from(
          _packages,
        );
        updated[index] = packageOffer;
        _packages = updated;
      }

      return packageOffer;
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
  }) async {
    _applyingPackageId = packageId;
    _errorMessage = null;
    notifyListeners();

    try {
      return await _applyPackageUseCase(
        packageId: packageId,
      );
    } catch (error) {
      _errorMessage = _readableError(error);
      rethrow;
    } finally {
      _applyingPackageId = null;
      notifyListeners();
    }
  }

  Future<void> refreshPackagesFromLiveEvent({String? packageId}) async {
    await fetchPackages(force: true);

    final String? targetPackageId = packageId ?? _activePackageId;
    if (targetPackageId == null) {
      return;
    }

    final bool shouldRefreshSelected =
        _selectedPackage?.id == targetPackageId ||
        _activePackageId == targetPackageId;

    if (!shouldRefreshSelected) {
      return;
    }

    try {
      await fetchPackageById(targetPackageId, force: true);
    } catch (_) {}
  }

  String _readableError(Object error) {
    final String text = error.toString();
    if (text.startsWith('Exception: ')) {
      return text.substring('Exception: '.length);
    }
    return text;
  }
}
