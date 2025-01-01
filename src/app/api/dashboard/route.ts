import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET() {
  try {
    // Test database connection first
    try {
      await prisma.$connect();
    } catch (connectionError) {
      return new NextResponse(
        JSON.stringify({
          error: true,
          message: 'Database connection failed',
          timestamp: new Date().toISOString()
        }),
        {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Fetch data with error handling for each query
    let resumes = [], logs = [], events = [];
    try {
      [resumes, logs, events] = await Promise.all([
        prisma.resume.findMany({
          include: {
            events: {
              orderBy: {
                createdAt: 'desc'
              },
              take: 10
            },
            trackingLogs: {
              orderBy: {
                createdAt: 'desc'
              },
              take: 10
            }
          },
          orderBy: {
            updatedAt: 'desc'
          }
        }),
        prisma.trackingLog.findMany({
          orderBy: {
            createdAt: 'desc'
          },
          take: 100,
          include: {
            resume: true
          }
        }),
        prisma.event.findMany({
          orderBy: {
            createdAt: 'desc'
          },
          take: 100,
          include: {
            resume: true
          }
        })
      ]);
    } catch (queryError) {
      // Log the actual error for debugging
      console.log('Query Error:', queryError instanceof Error ? queryError.message : 'Unknown query error');
      
      return new NextResponse(
        JSON.stringify({
          error: true,
          message: queryError instanceof Error ? queryError.message : 'Failed to fetch data',
          timestamp: new Date().toISOString()
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Return successful response
    return new NextResponse(
      JSON.stringify({
        resumes,
        logs,
        events,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    // Log error safely without causing console.error to throw
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorDetails = {
      message: errorMessage,
      type: error?.constructor?.name,
      timestamp: new Date().toISOString()
    };
    
    // Safe console logging
    console.log('Error in /api/dashboard:', JSON.stringify(errorDetails));
    
    return new NextResponse(
      JSON.stringify({
        error: true,
        message: errorMessage,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } finally {
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.log('Error disconnecting from database:', 
        disconnectError instanceof Error ? disconnectError.message : 'Unknown error');
    }
  }
} 