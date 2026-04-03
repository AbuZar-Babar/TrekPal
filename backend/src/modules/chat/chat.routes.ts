import { Router } from 'express';

import { authenticate } from '../../middlewares/auth.middleware';
import { chatController } from './chat.controller';

const router = Router();

router.use(authenticate);

router.get('/rooms', chatController.listRooms.bind(chatController));
router.get('/package/:packageId', chatController.getRoomByPackageId.bind(chatController));
router.get('/rooms/:roomId', chatController.getRoomById.bind(chatController));
router.get('/rooms/:roomId/messages', chatController.getMessages.bind(chatController));

export default router;
