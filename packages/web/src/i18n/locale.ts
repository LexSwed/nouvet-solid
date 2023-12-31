'use server';

import { type RequestEvent } from 'solid-js/web';
import { getHeader } from 'vinxi/server';

// import { getRequestUser } from '~/server/auth/user-session';

// TODO: take into account the cookie when start support async in createHandler
export function getLocale(event: RequestEvent): Intl.Locale {
  try {
    for (const fn of [header]) {
      const locale = fn(event);
      if (locale) {
        return locale;
      }
    }
  } catch (error) {
    console.error(error);
  }
  return new Intl.Locale('en');
}

/**
 * Attempts to get preferred language from cookies, for when the user manually updated it from the UI.
 */
// async function cookie(event: RequestEvent): Promise<Intl.Locale | null> {
//   try {
//     const user = await getRequestUser(event);
//     return new Intl.Locale(user?.locale!);
//   } catch (error) {
//     // TODO: if the app is migrated to new values, where does invalidation of cookies happen?
//     return null;
//   }
// }

/**
 * Attempts to get preferred language from Accept-Language header.
 * Verifies it's a correct language. Matches only to one of the supported locales.
 */
function header(event: RequestEvent): Intl.Locale | null {
  /** @example en-GB,en;q=0.9,en-US;q=0.8,es;q=0.7. */
  const rawHeader = getHeader(event, 'Accept-Language');
  if (!rawHeader) return null;
  const maybeMatching = rawHeader
    .split(',')
    .reduce(
      (res, lang) => {
        /**
         * Split with priority en-GB;q=0.9 -> en-GB, 0.9.
         * First language might not have q, getting 1.0 assigned.
         */
        const [code, priority = 1] = lang.split(';q=');
        try {
          /**
           * Verify it's a correct language and matches supported one. See
           * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/language
           */
          const locale = new Intl.Locale(code);
          res.push([locale, Number(priority)] as const);
        } catch {
          // Skip
        }
        return res;
      },
      [] as unknown as Array<readonly [Intl.Locale, number]>,
    )
    .toSorted((a, b) => b[1] - a[1])
    .find(([locale]) => {
      try {
        // @ts-expect-error thanks TypeScript
        return acceptedLocaleLanguageTag.includes(locale.language);
      } catch (error) {
        return false;
      }
    });

  if (maybeMatching) {
    return maybeMatching[0];
  }
  return null;
}

export const acceptedLocaleLanguageTag = ['en', 'es'] as const satisfies Array<
  Intl.Locale['language']
>;
