import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const employee = await prisma.employee.findUnique({
      where: { id },
    });
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    return NextResponse.json(employee);
  } catch (error) {
    return NextResponse.json({ error: "Error retrieving employee" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { firstName, lastName, email, phoneNumber, position } = await req.json();

  try {
    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: { firstName, lastName, email, phoneNumber, position },
    });
    return NextResponse.json(updatedEmployee);
  } catch (error) {
    return NextResponse.json({ error: "Error updating employee" }, { status: 500 });
  }
}


export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  console.log('Params:', params);
  const { id } = params;

  try {
    await prisma.employee.delete({
      where: { id },
    });
    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error('Error deleting employee:', error); // Log the error
    return NextResponse.json({ error: "Error deleting employee" }, { status: 500 });
  }
}
