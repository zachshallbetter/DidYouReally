import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
    const data = await request.json();
    const resume = await prisma.resume.update({
      where: { id },
      data: {
        jobTitle: data.jobTitle,
        companyId: data.companyId,
        status: data.status,
        metadata: data.metadata,
        layoutPreferences: data.layoutPreferences,
        tags: data.tags,
        companyType: data.companyType,
        jobLevel: data.jobLevel,
      },
    });
    return NextResponse.json(resume);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update resume' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
    await prisma.resume.delete({
      where: { id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete resume' },
      { status: 500 }
    );
  }
} 