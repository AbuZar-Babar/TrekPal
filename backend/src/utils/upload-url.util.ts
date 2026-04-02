import { Request } from 'express';

export const buildUploadUrl = (req: Request, relativePath: string): string => {
  const forwardedProto = req.header('x-forwarded-proto');
  const protocol = forwardedProto?.split(',')[0]?.trim() || req.protocol;
  const normalizedPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;

  return `${protocol}://${req.get('host')}${normalizedPath}`;
};
