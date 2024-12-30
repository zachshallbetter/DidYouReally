import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const resume = await prisma.resume.update({
      where: { id: params.id },
      data: {
        jobTitle: data.jobTitle,
        companyId: data.companyId,
        jobListingUrl: data.jobListingUrl,
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(resume);
  } catch (error) {
    console.error('Failed to update resume:', error);
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
    await prisma.resume.delete({
      where: { id: params.id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete resume:', error);
    return NextResponse.json(
      { error: 'Failed to delete resume' },
      { status: 500 }
    );
  }
} 