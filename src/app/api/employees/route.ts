import { NextResponse } from 'next/server';
import {prisma} from '../../../lib/prisma';

export async function GET() {
  try {
    const employees = await prisma.employee.findMany();
    return NextResponse.json(employees);
  } catch (error) {
    return NextResponse.json({ error: 'Error retrieving employees' }, { status: 500 });
  }
}




export async function POST(req: Request) {
  const { firstName, lastName, email, phoneNumber, position } = await req.json();
  try {
    const newEmployee = await prisma.employee.create({
      data: { firstName, lastName, email, phoneNumber, position },
    });
    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error creating employee' }, { status: 500 });
  }
}

