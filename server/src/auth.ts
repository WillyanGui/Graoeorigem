import { NextFunction, Request, Response } from 'express';
import { prisma } from './db';
import { getTenantSlugFromRequest, resolveTenant } from './tenant';
import { signToken, verifyPassword, verifyToken } from './security';

const fallbackJwtSecret = 'grao-origem-local-dev-secret';

export function jwtSecret() {
  return process.env.JWT_SECRET ?? fallbackJwtSecret;
}

export async function loginHandler(req: Request, res: Response) {
  const tenant = await resolveTenant(String(req.body.tenant ?? getTenantSlugFromRequest(req)));
  const identifier = String(req.body.username ?? req.body.email ?? '').trim();
  const password = String(req.body.password ?? '');

  if (!identifier || !password) {
    res.status(400).json({ error: 'Usuario e senha sao obrigatorios.' });
    return;
  }

  const user = await prisma.user.findFirst({
    where: {
      tenantId: tenant.id,
      OR: [
        { username: identifier },
        { email: identifier },
      ],
    },
  });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ error: 'Usuario ou senha invalidos.' });
    return;
  }

  const token = signToken(
    {
      sub: user.id,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      role: user.role,
    },
    jwtSecret(),
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    tenant: {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.displayName,
    },
  });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : '';
  const payload = token ? verifyToken(token, jwtSecret()) : null;

  if (!payload) {
    res.status(401).json({ error: 'Sessao invalida ou expirada.' });
    return;
  }

  res.locals.auth = payload;
  next();
}
