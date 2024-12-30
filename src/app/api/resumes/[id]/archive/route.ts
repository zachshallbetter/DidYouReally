import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resume = await prisma.resume.update({
      where: { id: params.id },
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