import {
  TimeSpan,
  verifyRequestOrigin,
  type CookieAttributes,
  type User,
} from 'lucia';
import { number, object, parse, picklist, string, type Output } from 'valibot';
import {
  sendRedirect,
  updateSession,
  useSession,
  type HTTPEvent,
} from 'vinxi/server';

import { useLucia } from '~/server/auth/lucia';
import { SESSION_COOKIE } from '~/server/const';
import type { DatabaseUserProfile } from '~/server/db/schema';

import { env } from '../env';

/**
 * Creates new auth session and stores it in cookie with other user basic user info.
 * @throws {ValiError} if user info provided is not correct.
 * @throws {Error} if auth/database issues.
 */
export async function createUserSession(
  event: HTTPEvent,
  {
    id: userId,
    locale,
    measurementSystem,
  }: {
    id: UserSession['userId'];
    locale: UserSession['locale'];
    measurementSystem: UserSession['measurementSystem'];
  },
) {
  const lucia = useLucia();
  const authSession = await lucia.createSession(userId, {});
  await updateRequestUser(
    event!,
    {
      userId,
      locale,
      measurementSystem,
      sessionId: authSession.id,
    },
    {
      // for --host debugging on real device
      secure: env.PROD,
    },
  );
}

/**
 * Validates current auth session.
 * @throws {Error} if auth/database issues.
 */
export async function validateAuthSession(
  event: HTTPEvent,
): Promise<User | null> {
  if (env.PROD) {
    const originHeader = event.headers.get('Origin');
    const hostHeader = event.headers.get('Host');
    if (
      !originHeader ||
      !hostHeader ||
      !verifyRequestOrigin(originHeader, [hostHeader])
    ) {
      throw new Error('Request Origin is not matching');
    }
  }
  const lucia = useLucia();
  const userSession = await useUserSession();

  if (!userSession.id) {
    // Cleanup just in case
    await deleteUserSession();
    return null;
  }

  const { session, user } = await lucia.validateSession(userSession.id);

  if (!session) {
    // Cleanup just in case
    await deleteUserSession();
    return null;
  }

  // the session has been updated, update the cookie expiration date
  if (session.fresh) {
    const sessionCookie = lucia.createSessionCookie(session.id);
    updateRequestUser(
      event,
      { ...userSession.data, sessionId: session.id },
      sessionCookie.attributes,
    );
  }

  return user;
}

/**
 * Logs user out, invalidating DB session and all associated cookies.
 */
export async function deleteUserSession() {
  const session = await useUserSession();
  await useLucia().invalidateSession(session.data.sessionId);
  await session.clear();
}
export type UserSession = Output<typeof userCookieSchema>;

export async function useUserSession() {
  const session = await useSession<UserSession>({
    name: SESSION_COOKIE,
    password: env.SESSION_SECRET,
  });
  if (!session.data) {
    throw sendRedirect('/app/login');
  }
  return session;
}

const userCookieSchema = object({
  userId: number(),
  sessionId: string(),
  locale: string('locale cannot be empty'),
  // timeZone: date(),
  measurementSystem: picklist(['imperial', 'metrical'] as const satisfies Array<
    DatabaseUserProfile['measurementSystem']
  >),
});

/**
 * Sets current user to the cookies.
 * @throws {ValiError} when provided user data is invalid.
 */
export async function updateRequestUser(
  event: HTTPEvent,
  user: UserSession,
  config?: CookieAttributes,
) {
  const { sessionId } = user;
  await updateSession(
    event,
    {
      generateId: () => sessionId,
      name: SESSION_COOKIE,
      password: env.SESSION_SECRET,
      maxAge: new TimeSpan(30, 'd').seconds(),
      cookie: config,
    },
    parse(userCookieSchema, user),
  );
}
