import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// Función para manejar solicitudes GET y filtrar empleados por posición
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const position = searchParams.get('position');

  if (position !== 'shop' && position !== 'playa') {
    return NextResponse.json({ error: 'Invalid position parameter' }, { status: 400 });
  }

  try {
    const employees = await prisma.employee.findMany({
      where: { position: position as 'shop' | 'playa' }
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error retrieving employees:', error);
    return NextResponse.json({ error: 'Error retrieving employees' }, { status: 500 });
  }
}

// Función para manejar solicitudes POST y crear un nuevo empleado
export async function POST(req: Request) {
  const { firstName, lastName, email, phoneNumber, position } = await req.json();

  try {
    const newEmployee = await prisma.employee.create({
      data: { firstName, lastName, email, phoneNumber, position },
    });
    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: 'Error creating employee' }, { status: 500 });
  }
}
