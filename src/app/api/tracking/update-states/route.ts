import { NextResponse } from 'next/server';
import { updateAllResumeStates, updateResumeMetrics } from '@/lib/resume-state';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get('id');

    if (resumeId) {
      // Update single resume
      await updateResumeMetrics(resumeId);
      await updateAllResumeStates();
      return NextResponse.json({ message: `Updated state for resume ${resumeId}` });
    } else {
      // Update all resumes
      await updateAllResumeStates();
      return NextResponse.json({ message: 'Updated all resume states' });
    }
  } catch (error) {
    console.error('Error updating resume states:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 