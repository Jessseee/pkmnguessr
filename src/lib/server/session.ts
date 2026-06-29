import { randomBytes } from 'crypto';
import type { Cookies } from '@sveltejs/kit';

export function getSessionId(cookies: Cookies) {
	let sessionId = cookies.get('session');
	if (!sessionId) {
		sessionId = randomBytes(16).toString('hex');
		cookies.set('session', sessionId, { path: '/' });
	}
	return sessionId;
}
