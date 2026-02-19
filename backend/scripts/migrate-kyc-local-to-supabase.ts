import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { uploadKycFile } from '../src/services/kyc-storage.service';

type AgencyKycRecord = {
  id: string;
  cnicImageUrl: string | null;
  ownerPhotoUrl: string | null;
};

type KycField = 'cnicImageUrl' | 'ownerPhotoUrl';

type MigrationFailure = {
  agencyId: string;
  field: KycField;
  sourceUrl: string;
  reason: string;
};

const prisma = new PrismaClient();
const kycLocalDir = path.join(process.cwd(), 'uploads', 'kyc');
const localPrefixes = [
  'http://localhost:3000/uploads/kyc/',
  'http://127.0.0.1:3000/uploads/kyc/',
];

const cliArgs = new Set(process.argv.slice(2));
const shouldExecute = cliArgs.has('--execute') && !cliArgs.has('--dry-run');

const fields: KycField[] = ['cnicImageUrl', 'ownerPhotoUrl'];

const isLocalKycUrl = (value: string | null): value is string => {
  if (!value) {
    return false;
  }

  return localPrefixes.some((prefix) => value.startsWith(prefix));
};

const extractFilenameFromLocalUrl = (value: string): string | null => {
  try {
    const parsed = new URL(value);
    const filename = path.basename(parsed.pathname);
    return filename || null;
  } catch {
    return null;
  }
};

const inferMimeType = (filename: string): string => {
  const extension = path.extname(filename).toLowerCase();
  const mimeByExtension: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
  };
  return mimeByExtension[extension] || 'application/octet-stream';
};

const toObjectPath = (agencyId: string, filename: string): string => {
  return `agencies/${agencyId}/kyc/${filename}`;
};

const findAgenciesWithLocalKycUrls = async (): Promise<AgencyKycRecord[]> => {
  return prisma.agency.findMany({
    where: {
      OR: [
        { cnicImageUrl: { startsWith: localPrefixes[0] } },
        { ownerPhotoUrl: { startsWith: localPrefixes[0] } },
        { cnicImageUrl: { startsWith: localPrefixes[1] } },
        { ownerPhotoUrl: { startsWith: localPrefixes[1] } },
      ],
    },
    select: {
      id: true,
      cnicImageUrl: true,
      ownerPhotoUrl: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
};

const main = async (): Promise<void> => {
  const agencies = await findAgenciesWithLocalKycUrls();
  const failures: MigrationFailure[] = [];

  let agenciesUpdated = 0;
  let fieldsUpdated = 0;
  let uploadsPerformed = 0;

  for (const agency of agencies) {
    const updatePayload: Partial<Record<KycField, string>> = {};

    for (const field of fields) {
      const sourceUrl = agency[field];
      if (!isLocalKycUrl(sourceUrl)) {
        continue;
      }

      const filename = extractFilenameFromLocalUrl(sourceUrl);
      if (!filename) {
        failures.push({
          agencyId: agency.id,
          field,
          sourceUrl,
          reason: 'Could not parse filename from local URL',
        });
        continue;
      }

      const objectPath = toObjectPath(agency.id, filename);
      updatePayload[field] = objectPath;

      if (!shouldExecute) {
        continue;
      }

      const localFilePath = path.join(kycLocalDir, filename);
      let buffer: Buffer;
      try {
        buffer = await fs.readFile(localFilePath);
      } catch (error: any) {
        failures.push({
          agencyId: agency.id,
          field,
          sourceUrl,
          reason: `Local file not found/readable: ${localFilePath} (${error.message})`,
        });
        delete updatePayload[field];
        continue;
      }

      await uploadKycFile(buffer, inferMimeType(filename), objectPath);
      uploadsPerformed += 1;
    }

    const updatedFieldNames = Object.keys(updatePayload) as KycField[];
    if (updatedFieldNames.length === 0) {
      continue;
    }

    if (shouldExecute) {
      await prisma.agency.update({
        where: { id: agency.id },
        data: updatePayload,
      });
    }

    agenciesUpdated += 1;
    fieldsUpdated += updatedFieldNames.length;
  }

  console.log(
    JSON.stringify(
      {
        mode: shouldExecute ? 'execute' : 'dry-run',
        localDirectory: kycLocalDir,
        scannedAgencies: agencies.length,
        agenciesUpdated,
        fieldsUpdated,
        uploadsPerformed,
        failuresCount: failures.length,
        failures,
      },
      null,
      2
    )
  );
};

main()
  .catch((error) => {
    console.error('[migrate-kyc-local-to-supabase] Migration failed');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
