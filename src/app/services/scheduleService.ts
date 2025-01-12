import { prisma } from '../../lib/prisma';

export const assignShifts = async (position: 'shop' | 'playa') => {
  try {
    // Obtener empleados por posición
    const employees = await prisma.employee.findMany({
      where: { position },
      orderBy: { id: 'asc' } // Mantener un orden consistente
    });

    if (employees.length < 6) {
      throw new Error('No hay suficientes empleados para asignar los turnos. Se necesitan al menos 6.');
    }

    // Obtener índice de rotación previo
    const lastShift = await prisma.lastShift.findUnique({ where: { id: 1 } }) || { index: 0 };
    let rotationIndex = lastShift.index;

    // Definir días de la semana y estructura inicial de horarios
    const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const schedules = daysOfWeek.reduce((acc, day) => {
      acc[day] = { morning: [], afternoon: [], night: [], dayOff: [], position };
      return acc;
    }, {} as Record<string, { morning: string[]; afternoon: string[]; night: string[]; dayOff: string[]; position: string }>);

    // Reglas para asignar turnos
    const assignShift = (day: string, shiftType: 'morning' | 'afternoon' | 'night' | 'dayOff', employee: any) => {
      if (employee && employee.firstName && employee.lastName) {
        schedules[day][shiftType].push(`${employee.firstName}.${employee.lastName.charAt(0)}`);
      }
    };

    // Asignar turnos y días libres de forma cíclica
    for (let i = 0; i < daysOfWeek.length; i++) {
      const day = daysOfWeek[i];
      const dayOffEmployee = employees[(rotationIndex + i) % employees.length];

      // Asignar día libre
      assignShift(day, 'dayOff', dayOffEmployee);

      // Turno de mañana
      const morningShift = [
        employees[(rotationIndex + i + 1) % employees.length],
        employees[(rotationIndex + i + 2) % employees.length]
      ];
      morningShift.forEach(emp => assignShift(day, 'morning', emp));

      // Turno de tarde
      const afternoonShift = [
        employees[(rotationIndex + i + 3) % employees.length],
        employees[(rotationIndex + i + 4) % employees.length]
      ];
      afternoonShift.forEach(emp => assignShift(day, 'afternoon', emp));

      // Turno de noche
      const nightShift = employees[(rotationIndex + i + 5) % employees.length];
      assignShift(day, 'night', nightShift);
    }

    // Actualizar índice de rotación y guardar horarios
    rotationIndex = (rotationIndex + 1) % employees.length;

    await prisma.$transaction(async (prisma) => {
      // Guardar el índice de rotación actualizado
      await prisma.lastShift.upsert({
        where: { id: 1 },
        update: { index: rotationIndex },
        create: { id: 1, index: rotationIndex }
      });

      // Eliminar horarios previos y guardar nuevos
      await prisma.schedule.deleteMany({ where: { position } });
      await prisma.schedule.createMany({
        data: Object.keys(schedules).map(day => ({
          day,
          morning: schedules[day].morning,
          afternoon: schedules[day].afternoon,
          night: schedules[day].night,
          dayOff: schedules[day].dayOff,
          position
        }))
      });
    });

    return { success: true, message: 'Turnos asignados correctamente' };
  } catch (error) {
    console.error('Error al asignar turnos:', error);
    return { success: false, message: (error as Error).message };
  }
};
