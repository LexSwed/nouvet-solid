'use server';

import { createHmac, randomBytes } from 'node:crypto';
import { getRequestEvent } from 'solid-js/web';

import { getRequestUser } from '~/server/auth/request-user';
import {
  createFamilyInvite as dbCreateFamilyInvite,
  getFamilyInvite as dbGetFamilyInvite,
  getFamilyInvitationInfo,
} from '~/server/db/queries/familyInvite';

import { env } from '../env';

// TODO: Heavily rate limit this
export async function getFamilyInvite() {
  try {
    const user = await getRequestUser();
    const event = getRequestEvent();

    let invite = await dbGetFamilyInvite(user.userId);

    if (!invite) {
      const inviteCode = randomBytes(8).toString('hex');
      const hash = createHash(inviteCode);
      invite = await dbCreateFamilyInvite(user.userId, inviteCode, hash);
    }

    const url = new URL(
      `${new URL(event!.request.url).origin}/app/family/invite/${invite.inviteCode}`,
    );

    // 1 hour
    const expiresIn = Math.floor((invite.expiresAt - Date.now() / 1000) / 60);

    return {
      url: url.toString(),
      qrString: invite.invitationHash,
      expiresIn: new Intl.RelativeTimeFormat(user.locale, {
        style: 'long',
        numeric: 'auto',
      }).format(expiresIn, 'minutes'),
    };
  } catch (error) {
    console.error(error);
    return { failed: true };
  }
}

export async function checkFamilyInvite(inviteCode: string) {
  const invite = await getFamilyInvitationInfo(inviteCode);
  return invite;
}

function createHash(code: string) {
  return createHmac('sha256', env.INVITES_SECRET).update(code).digest('hex');
}
