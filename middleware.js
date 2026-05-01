import { NextResponse } from 'next/server';

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 30;

const store = new Map();

function getIP(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart > WINDOW_MS * 2) {
      store.delete(key);
    }
  }
}

export function middleware(request) {
  const ip = getIP(request);
  const now = Date.now();

  if (store.size > 5000) cleanup();

  const entry = store.get(ip);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    store.set(ip, { windowStart: now, count: 1 });
    return NextResponse.next();
  }

  entry.count += 1;

  if (entry.count > MAX_REQUESTS) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'تجاوزت الحد الأقصى للطلبات — يرجى الانتظار دقيقة والمحاولة مجدداً',
        },
        meta: {
          calculator: null,
          version: '1.0',
          computedAt: new Date().toISOString(),
          currency: 'MAD',
        },
        result: null,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Retry-After': '60',
        },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/labor', '/api/travail', '/api/avp-victime', '/api/avp-ayants-droit'],
};
