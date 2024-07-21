import { NextApiRequest, NextApiResponse } from 'next';
import {prisma} from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const employees = await prisma.employee.findMany();
    res.status(200).json(employees);
  } else if (req.method === 'POST') {
    const { firstName, lastName, email, phoneNumber, position } = req.body;
    const newEmployee = await prisma.employee.create({
      data: { firstName, lastName, email, phoneNumber, position },
    });
    res.status(201).json(newEmployee);
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
