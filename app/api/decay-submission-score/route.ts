import type { NextRequest } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic'; // static by default, unless reading the request
 
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }
 
  // TODO
}