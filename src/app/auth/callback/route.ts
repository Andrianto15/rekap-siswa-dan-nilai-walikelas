import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function sanitizeRedirectPath(path: string | null): string {
  if (!path || typeof path !== 'string') return '/dashboard';
  // Must start with exactly one '/' and not protocol-relative ('//', '/\') or external protocol
  if (path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\') && !path.includes(':')) {
    return path;
  }
  return '/dashboard';
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = sanitizeRedirectPath(searchParams.get('next'));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return user to login page on auth error
  return NextResponse.redirect(`${origin}/login?error=auth_exchange_failed`);
}
