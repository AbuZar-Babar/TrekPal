$content = Get-Content 'backend\src\modules\auth\auth.controller.ts' -Raw
$newMethod = @"
  /**
   * Register a new independent hotel
   * POST /api/auth/register/hotel
   * Content-Type: multipart/form-data
   */
  async registerHotel(req: AuthRequest, res: Response): Promise<void> {
    const uploadedObjectPaths: string[] = [];
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const input = req.body;
      
      const requiredFiles: HotelRegistrationFileField[] = ['locationImage', 'businessDoc'];
      const missingRequiredFiles = requiredFiles.filter(
        (fieldName) => !files?.[fieldName]?.[0]
      );

      if (missingRequiredFiles.length > 0) {
        sendError(
          res,
          \`Missing required documents: \${missingRequiredFiles.map((field) => hotelDocumentLabels[field]).join(', ')}\`,
          400
        );
        return;
      }

      const uploadBatchId = \`hotels-\${Date.now()}-\${Math.round(Math.random() * 1e9)}\`;
      const uploadedDocuments: Partial<Record<HotelRegistrationFileField, string>> = {};

      for (const fieldName of hotelRegistrationFileFields) {
        const file = files?.[fieldName]?.[0];
        if (!file) continue;

        const originalExt = path.extname(file.originalname || '').toLowerCase();
        const extension = originalExt || inferKycExtensionFromMimeType(file.mimetype);
        const objectPath = \`hotels/pending/\${uploadBatchId}/\${fieldName}\${extension}\`;

        await uploadKycFile(
          file.buffer,
          resolveKycMimeType(file.mimetype, file.originalname),
          objectPath,
        );
        uploadedObjectPaths.push(objectPath);
        uploadedDocuments[fieldName] = objectPath;
      }

      const result = await authService.registerHotel({
        ...input,
        locationImageUrl: uploadedDocuments.locationImage,
        businessDocUrl: uploadedDocuments.businessDoc,
      });

      sendSuccess(
        res,
        result,
        'Hotel registered successfully. Pending admin approval.',
        201
      );
    } catch (error: any) {
      if (uploadedObjectPaths.length > 0) {
        await Promise.allSettled(
          uploadedObjectPaths.map((objectPath) => deleteKycFile(objectPath))
        );
      }

      console.error('[Auth Controller] registerHotel error:', error.message || error);
      if (error.code === 'auth/email-already-exists') {
        sendError(res, 'Email already registered', 409);
      } else {
        sendError(res, error.message || 'Registration failed', 400);
      }
    }
  }

"@

# Find the end of registerAgency and insert before login
if ($content -match 'registerAgency error:.*?\}\s*\}\s*\}\s*\r?\n\r?\n\s+/\*\*') {
    $content = $content -replace '(registerAgency error:.*?\}\s*\}\s*\}\s*\r?\n\r?\n)(\s+/\*\*)', "`$1$newMethod`$2"
    $content | Set-Content 'backend\src\modules\auth\auth.controller.ts' -NoNewline
    Write-Host "Success"
} else {
    Write-Host "Failed to match insertion point"
}
