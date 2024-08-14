import { prisma } from '../../lib/prisma';

export const assignShifts = async (position: 'shop' | 'playa') => {
  try {
    const employees = await prisma.employee.findMany({
      where: { position }
    });

    if (employees.length < 6) {
      throw new Error('No hay suficientes empleados para asignar los turnos');
    }

    const lastShift = await prisma.lastShift.findUnique({ where: { id: 1 } }) || { index: 0 };
    let rotationIndex = lastShift.index;

    const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const schedules = daysOfWeek.reduce((acc, day) => {
      acc[day] = { morning: [], afternoon: [], night: [], dayOff: [], position };
      return acc;
    }, {} as Record<string, { morning: string[], afternoon: string[], night: string[], dayOff: string[], position: string }>);

    const assignShift = (day: string, shiftType: 'morning' | 'afternoon' | 'night' | 'dayOff', employee: any) => {
      if (employee && employee.firstName && employee.lastName) {
        schedules[day][shiftType].push(`${employee.firstName}.${employee.lastName.charAt(0)}`);
      }
    };

   // Función para obtener empleados asignados a un turno específico
const getShiftEmployees = (startIndex: number, count: number) => {
  // Utiliza slice para obtener un subconjunto de empleados comenzando desde startIndex hasta startIndex + count
  // Luego, mapea estos empleados asegurándose de que la rotación sea circular utilizando el operador módulo (%)
  return employees.slice(startIndex, startIndex + count).map((_, i) => employees[(startIndex + i) % employees.length]);
};

// Incrementa el índice de rotación y asegura que no exceda el número de empleados mediante el operador módulo (%)
rotationIndex = (rotationIndex + 1) % employees.length;

// Asigna empleados a los turnos de mañana, tarde, noche y cobertura de día libre
// getShiftEmployees(rotationIndex, 2): Obtiene 2 empleados para el turno de mañana a partir del índice de rotación actual
// getShiftEmployees(rotationIndex + 2, 2): Obtiene 2 empleados para el turno de tarde, empezando 2 posiciones después del índice de rotación actual
// employees[(rotationIndex + 4) % employees.length]: Obtiene 1 empleado para el turno de noche, asegurando la rotación circular
// employees[(rotationIndex + 5) % employees.length]: Obtiene 1 empleado para la cobertura de días libres, asegurando la rotación circular
const [morningShift, afternoonShift, nightShift, dayOffCoverage] = [
  getShiftEmployees(rotationIndex, 2),
  getShiftEmployees(rotationIndex + 2, 2),
  employees[(rotationIndex + 4) % employees.length],
  employees[(rotationIndex + 5) % employees.length]
];

// Selecciona los primeros 6 empleados para asignar días libres de forma única
const uniqueDayOffEmployees = employees.slice(0, 6);

// Verifica si hay al menos 6 empleados únicos para asignar días libres
// Si no, lanza un error indicando que no hay suficientes empleados
if (uniqueDayOffEmployees.length < 6) {
  throw new Error('No hay suficientes empleados únicos para asignar los días de descanso');
}


    daysOfWeek.forEach((day, index) => {
      const dayOffEmployee = uniqueDayOffEmployees[index];
      switch (day) {
        case 'Lunes':
          assignShift(day, 'dayOff', morningShift[0]);
          morningShift.forEach(e => assignShift(day, 'morning', e));
          afternoonShift.forEach(e => assignShift(day, 'afternoon', e));
          assignShift(day, 'night', nightShift);
          break;
        case 'Martes':
          assignShift(day, 'dayOff', morningShift[1]);
          morningShift.forEach(e => assignShift(day, 'morning', e));
          afternoonShift.forEach(e => assignShift(day, 'afternoon', e));
          assignShift(day, 'night', nightShift);
          break;
        case 'Miércoles':
          assignShift(day, 'dayOff', afternoonShift[0]);
          morningShift.forEach(e => assignShift(day, 'morning', e));
          afternoonShift.forEach(e => assignShift(day, 'afternoon', e));
          assignShift(day, 'night', nightShift);
          break;
        case 'Jueves':
          assignShift(day, 'dayOff', dayOffCoverage);
          morningShift.forEach(e => assignShift(day, 'morning', e));
          afternoonShift.forEach(e => assignShift(day, 'afternoon', e));
          assignShift(day, 'night', nightShift);
          break;
        case 'Viernes':
          morningShift.forEach(e => assignShift(day, 'morning', e));
          afternoonShift.forEach(e => assignShift(day, 'afternoon', e));
          assignShift(day, 'morning', dayOffEmployee);
          assignShift(day, 'afternoon', dayOffEmployee);
          assignShift(day, 'night', nightShift);
          break;
        case 'Sábado':
          assignShift(day, 'dayOff', nightShift);
          morningShift.forEach(e => assignShift(day, 'morning', e));
          afternoonShift.forEach(e => assignShift(day, 'afternoon', e));
          assignShift(day, 'night', dayOffCoverage);
          break;
        case 'Domingo':
          assignShift(day, 'dayOff', afternoonShift[1]);
          assignShift(day, 'morning', afternoonShift[0]);
          assignShift(day, 'morning', afternoonShift[1]);
          assignShift(day, 'afternoon', nightShift);
          assignShift(day, 'afternoon', morningShift[1]);
          assignShift(day, 'night', dayOffCoverage);
          break;
        default:
          assignShift(day, 'dayOff', morningShift[0]);
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
