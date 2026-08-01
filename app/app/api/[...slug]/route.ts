import { NextRequest } from 'next/server';
import { handleApiRouteRequest } from '../../../lib/api-handler';

export async function GET(req: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  return handleApiRouteRequest(req, context.params);
}

export async function POST(req: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  return handleApiRouteRequest(req, context.params);
}
