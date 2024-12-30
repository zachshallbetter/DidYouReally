import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const resume = await prisma.resume.update({
      where: { id: context.params.id },
      data: {
        status: 'archived',
        archivedAt: new Date(),
      },
    });
    return NextResponse.json(resume);
  } catch (error) {
    console.error('Failed to archive resume:', error);
    return NextResponse.json(
      { error: 'Failed to archive resume' },
      { status: 500 }
    );
  }
} 