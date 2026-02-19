import 'dotenv/config';
import { env } from '../src/config/env';
import { getSupabaseAdminClient } from '../src/config/supabase';

const main = async (): Promise<void> => {
  const supabase = getSupabaseAdminClient();
  const bucketName = env.SUPABASE_STORAGE_BUCKET_KYC;

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    throw new Error(`Failed to list buckets: ${listError.message}`);
  }

  const existing = buckets?.find((bucket) => bucket.name === bucketName);
  if (existing) {
    console.log(
      JSON.stringify(
        {
          status: 'exists',
          bucket: bucketName,
          public: existing.public,
        },
        null,
        2
      )
    );
    return;
  }

  const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
    public: false,
  });

  if (createError) {
    throw new Error(`Failed to create bucket "${bucketName}": ${createError.message}`);
  }

  console.log(
    JSON.stringify(
      {
        status: 'created',
        bucket: bucketName,
        id: data?.id || null,
      },
      null,
      2
    )
  );
};

main().catch((error) => {
  console.error('[ensure-kyc-bucket] Failed');
  console.error(error);
  process.exitCode = 1;
});
