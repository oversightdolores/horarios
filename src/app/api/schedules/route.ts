// src/app/api/schedules/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { assignShifts } from '../../services/scheduleService';

export async function GET() {
  try {
    const schedules = await prisma.schedule.findMany();
    return NextResponse.json(schedules);
  } catch (error) {
    return NextResponse.json({ error: 'Error retrieving schedules' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await assignShifts();
    const updatedSchedules = await prisma.schedule.findMany();
    return NextResponse.json(updatedSchedules, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error creating schedule' }, { status: 500 });
  }
}
