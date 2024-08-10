import { prisma } from '../../lib/prisma';

export const assignShifts = async (position: 'shop' | 'playa') => {
  console.log('positiooooos', position);
  try {
    const employees = await prisma.employee.findMany({
      where: {
        position: position
      }
    });

    console.log('filtered employees', employees); // Log para verificar los empleados filtrados

    const numEmployees = employees.length;
    if (numEmployees < 6) {
      return Promise.reject(new Error('No hay suficientes empleados para asignar los turnos'));
    }


    const lastShift = await prisma.lastShift.findUnique({ where: { id: 1 } }) || { index: 0 };
    let rotationIndex = lastShift.index;

    const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const schedules = daysOfWeek.reduce((acc, day) => {
      acc[day] = { morning: [], afternoon: [], night: [], dayOff: [], position: position };
      return acc;
    }, {} as Record<string, { morning: string[], afternoon: string[], night: string[], dayOff: string[], position: string }>);

    const assignShift = (day: string, shiftType: 'morning' | 'afternoon' | 'night' | 'dayOff', employee: any) => {
      if (employee && employee.firstName && employee.lastName) {
        schedules[day][shiftType].push(`${employee.firstName}.${employee.lastName.charAt(0)}`);
      }
    };

    const getShiftEmployees = (startIndex: number, count: number) => {
      const shiftEmployees = [];
      for (let i = 0; i < count; i++) {
        shiftEmployees.push(employees[(startIndex + i) % numEmployees]);
      }
      return shiftEmployees;
    };

    rotationIndex = (rotationIndex + 1) % numEmployees;

    const morningShift = getShiftEmployees(rotationIndex, 2);
    const afternoonShift = getShiftEmployees(rotationIndex + 2, 2);
    const nightShift = getShiftEmployees(rotationIndex + 4, 1)[0];
    const dayOffCoverage = getShiftEmployees(rotationIndex + 5, 1)[0];

    const uniqueDayOffEmployees = [...new Set(employees.slice(0, 6))];

    if (uniqueDayOffEmployees.length < 6) {
      throw new Error('No hay suficientes empleados únicos para asignar los días de descanso');
    }

    daysOfWeek.forEach((day, index) => {
      const dayOffEmployee = uniqueDayOffEmployees[index];

      if (day === 'Jueves') {
        assignShift(day, 'dayOff', dayOffEmployee);
        morningShift.forEach(e => assignShift(day, 'morning', e));
        afternoonShift.forEach(e => assignShift(day, 'afternoon', e));
        assignShift(day, 'night', nightShift);
      } else if (day === 'Viernes') {
        assignShift(day, 'dayOff', dayOffEmployee);
        morningShift.forEach(e => assignShift(day, 'morning', e));
        afternoonShift.forEach(e => assignShift(day, 'afternoon', e));
        assignShift(day, 'morning', dayOffEmployee);
        assignShift(day, 'afternoon', dayOffEmployee);
        assignShift(day, 'night', nightShift);
      } else if (day === 'Sábado') {
        assignShift(day, 'dayOff', nightShift);
        morningShift.forEach(e => assignShift(day, 'morning', e));
        afternoonShift.forEach(e => assignShift(day, 'afternoon', e));
        assignShift(day, 'night', dayOffCoverage);
      } else if (day === 'Domingo') {
        assignShift(day, 'dayOff', morningShift[0]);
        assignShift(day, 'morning', afternoonShift[0]);
        assignShift(day, 'morning', afternoonShift[1]);
        assignShift(day, 'afternoon', nightShift);
        assignShift(day, 'afternoon', morningShift[1]); // Asegurar que hay 2 empleados en la tarde del domingo
        assignShift(day, 'night', dayOffCoverage);
      } else {
        assignShift(day, 'dayOff', morningShift[0]); // Asegurar que hay al menos un empleado en descanso cada día
        morningShift.forEach(e => assignShift(day, 'morning', e));
        afternoonShift.forEach(e => assignShift(day, 'afternoon', e));
        assignShift(day, 'night', nightShift);
      }
    });

    await prisma.$transaction(async (prisma) => {
      await prisma.lastShift.upsert({
        where: { id: 1 },
        update: { index: rotationIndex },
        create: { id: 1, index: rotationIndex }
      });

      await prisma.schedule.deleteMany({
        where: {
          position: position
        }
      });
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
    return { success: false, message: error.message };
  }
};
