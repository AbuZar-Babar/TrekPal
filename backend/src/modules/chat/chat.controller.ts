import { Response } from 'express';

import { AuthRequest } from '../../middlewares/auth.middleware';
import { sendError, sendSuccess } from '../../utils/response.util';
import { chatService } from './chat.service';

const resolveStatusCode = (message: string): number => {
  const normalized = message.toLowerCase();
  if (normalized.includes('unauthorized')) {
    return 401;
  }
  if (normalized.includes('forbidden') || normalized.includes('pending approval')) {
    return 403;
  }
  if (normalized.includes('not found')) {
    return 404;
  }
  return 400;
};

export class ChatController {
  private async getActor(req: AuthRequest) {
    if (!req.user) {
      throw new Error('Unauthorized');
    }

    return chatService.resolveActorFromAuth(req.user.uid, req.user.role);
  }

  async listRooms(req: AuthRequest, res: Response): Promise<void> {
    try {
      const actor = await this.getActor(req);
      const rooms = await chatService.listRooms(actor);
      sendSuccess(res, rooms, 'Chat rooms retrieved successfully');
    } catch (error: any) {
      sendError(
        res,
        error.message || 'Failed to get chat rooms',
        resolveStatusCode(error.message || ''),
      );
    }
  }

  async getRoomByPackageId(req: AuthRequest, res: Response): Promise<void> {
    try {
      const actor = await this.getActor(req);
      const room = await chatService.getRoomByPackageId(req.params.packageId, actor);
      sendSuccess(res, room, 'Chat room retrieved successfully');
    } catch (error: any) {
      sendError(
        res,
        error.message || 'Failed to get chat room',
        resolveStatusCode(error.message || ''),
      );
    }
  }

  async getRoomById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const actor = await this.getActor(req);
      const room = await chatService.getRoomById(req.params.roomId, actor);
      sendSuccess(res, room, 'Chat room retrieved successfully');
    } catch (error: any) {
      sendError(
        res,
        error.message || 'Failed to get chat room',
        resolveStatusCode(error.message || ''),
      );
    }
  }

  async getMessages(req: AuthRequest, res: Response): Promise<void> {
    try {
      const actor = await this.getActor(req);
      const messages = await chatService.getMessages(req.params.roomId, actor);
      sendSuccess(res, messages, 'Messages retrieved successfully');
    } catch (error: any) {
      sendError(
        res,
        error.message || 'Failed to get messages',
        resolveStatusCode(error.message || ''),
      );
    }
  }
}

export const chatController = new ChatController();
