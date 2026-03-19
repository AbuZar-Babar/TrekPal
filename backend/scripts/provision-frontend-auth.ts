import { PrismaClient } from '@prisma/client';
import { APPROVAL_STATUS, ROLES } from '../src/config/constants';
import { getSupabaseAdminClient } from '../src/config/supabase';

const prisma = new PrismaClient();

const adminEmail = process.env.FRONTEND_ADMIN_EMAIL || 'admin@trekpal.com';
const adminName = process.env.FRONTEND_ADMIN_NAME || 'Admin User';
const adminPassword = process.env.FRONTEND_ADMIN_PASSWORD || 'password123';
const agencyPassword = process.env.FRONTEND_AGENCY_PASSWORD || 'password123';

const isDuplicateError = (error: unknown): boolean => {
  const message = String((error as { message?: string } | undefined)?.message || '').toLowerCase();
  return message.includes('already') || message.includes('exists') || message.includes('registered');
};

interface AuthUser {
  id: string;
  email?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}

async function findAuthUserByEmail(email: string): Promise<AuthUser | null> {
  const supabase = getSupabaseAdminClient();
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw error;
    }

    const existingUser = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return existingUser;
    }

    if (data.users.length < 200) {
      return null;
    }

    page += 1;
  }
}

async function ensureAuthUser(email: string, password: string, role: string, name: string): Promise<AuthUser> {
  const supabase = getSupabaseAdminClient();
  const existingUser = await findAuthUserByEmail(email);

  if (existingUser) {
    const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      email,
      password,
      email_confirm: true,
      app_metadata: {
        ...(existingUser.app_metadata || {}),
        role,
      },
      user_metadata: {
        ...(existingUser.user_metadata || {}),
        name,
      },
    });

    if (error || !data.user) {
      throw error || new Error(`Failed to update auth user for ${email}`);
    }

    console.log(`Updated auth user for ${email}`);
    return data.user;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role },
    user_metadata: { name },
  });

  if (error || !data.user) {
    if (isDuplicateError(error)) {
      const duplicateUser = await findAuthUserByEmail(email);
      if (!duplicateUser) {
        throw error;
      }

      const { data: updatedData, error: updateError } = await supabase.auth.admin.updateUserById(
        duplicateUser.id,
        {
          email,
          password,
          email_confirm: true,
          app_metadata: {
            ...(duplicateUser.app_metadata || {}),
            role,
          },
          user_metadata: {
            ...(duplicateUser.user_metadata || {}),
            name,
          },
        }
      );

      if (updateError || !updatedData.user) {
        throw updateError || new Error(`Failed to update duplicate auth user for ${email}`);
      }

      console.log(`Updated auth user for ${email}`);
      return updatedData.user;
    }

    throw error || new Error(`Failed to create auth user for ${email}`);
  }

  console.log(`Created auth user for ${email}`);
  return data.user;
}

async function main() {
  const adminAuthUser = await ensureAuthUser(adminEmail, adminPassword, ROLES.ADMIN, adminName);

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {
      authUid: adminAuthUser.id,
      name: adminName,
    },
    create: {
      authUid: adminAuthUser.id,
      email: adminEmail,
      name: adminName,
    },
  });

  const agencies = await prisma.agency.findMany({
    where: { status: APPROVAL_STATUS.APPROVED },
    select: { id: true, email: true, name: true },
    orderBy: { createdAt: 'asc' },
  });

  if (agencies.length === 0) {
    console.log('No approved agencies found to provision');
  }

  for (const agency of agencies) {
    const agencyAuthUser = await ensureAuthUser(agency.email, agencyPassword, ROLES.AGENCY, agency.name);
    await prisma.agency.update({
      where: { id: agency.id },
      data: { authUid: agencyAuthUser.id },
    });
  }

  console.log('');
  console.log('Frontend auth provisioning completed.');
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
  if (agencies.length > 0) {
    console.log(`Agency login: ${agencies[0].email} / ${agencyPassword}`);
  }
}

main()
  .catch((error) => {
    console.error('Failed to provision frontend auth:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
