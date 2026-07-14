import { randomBytes } from 'crypto';
import { dev } from '$app/environment';
import type { Cookies } from '@sveltejs/kit';

export function getOrSetSessionId(cookies: Cookies) {
	let sessionId = cookies.get('session');
	if (!sessionId) {
		sessionId = randomBytes(16).toString('hex');
		cookies.set('session', sessionId, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev,
			maxAge: 60 * 60 * 24 * 365 // 1 year
		});
	}
	return sessionId;
}
