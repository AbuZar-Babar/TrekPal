import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireAgency, requireTraveler } from '../../middlewares/roleGuard.middleware';
import { packagesController } from './packages.controller';

const router = Router();

router.use(authenticate);

router.get('/', packagesController.getPackages.bind(packagesController));
router.get('/:id', packagesController.getPackageById.bind(packagesController));
router.post('/:id/apply', requireTraveler, packagesController.applyToPackage.bind(packagesController));
router.post('/', requireAgency, packagesController.createPackage.bind(packagesController));
router.put('/:id', requireAgency, packagesController.updatePackage.bind(packagesController));
router.delete('/:id', requireAgency, packagesController.deletePackage.bind(packagesController));

export default router;
