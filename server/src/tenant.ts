import { prisma } from './db';

export async function resolveTenant(slug = 'grao-origem') {
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: {
      themeSettings: true,
      saasSubscription: {
        include: {
          plan: true,
        },
      },
    },
  });

  if (!tenant) {
    throw Object.assign(new Error(`Tenant not found: ${slug}`), { statusCode: 404 });
  }

  return tenant;
}

export function getTenantSlugFromRequest(req: { headers: Record<string, string | string[] | undefined>; query: Record<string, unknown> }) {
  const queryTenant = typeof req.query.tenant === 'string' ? req.query.tenant : undefined;
  const headerTenant = req.headers['x-tenant-slug'];
  const normalizedHeader = Array.isArray(headerTenant) ? headerTenant[0] : headerTenant;

  return queryTenant ?? normalizedHeader ?? 'grao-origem';
}
