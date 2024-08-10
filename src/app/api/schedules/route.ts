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
  const { position } = await req.json();
  console.log('position',position);

  if (position !== 'shop' && position !== 'playa') {
    return NextResponse.json({ error: 'Invalid position parameter' }, { status: 400 });
  }

  try {
    await assignShifts(position as 'shop' | 'playa');
    const schedules = await prisma.schedule.findMany({
      where:{
        position: position as 'shop' | 'playa'
      }
    });
    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error assigning shifts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
