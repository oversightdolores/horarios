import { prisma } from '../../lib/prisma';

export const assignShifts = async () => {
  const employees = await prisma.employee.findMany();
  const numEmployees = employees.length;

  // Obtener el índice de rotación actual o establecer a 0 si no existe
  const lastShift = await prisma.lastShift.findUnique({ where: { id: 1 } }) || { index: 0 };
  let rotationIndex = lastShift.index;

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const shiftsOfDay = ['morning', 'afternoon', 'night'];

  // Inicializar la estructura de los horarios
  const schedules = daysOfWeek.reduce((acc, day) => {
    acc[day] = { morning: [], afternoon: [], night: [], dayOff: [] };
    return acc;
  }, {} as Record<string, { morning: string[], afternoon: string[], night: string[], dayOff: string[] }>);

  // Seleccionar los empleados para los turnos
  const morningShift = employees.slice(0, 2);
  const afternoonShift = employees.slice(2, 4);
  const nightShift = employees[4];
  const dayOffCoverage = employees[5];

  // Asignar los turnos fijos y los días libres
  daysOfWeek.forEach(day => {
    if (day === 'Jueves' || day === 'Viernes') {
      // El empleado de cobertura tiene franco el jueves y viernes
      schedules[day].dayOff.push(`${dayOffCoverage.firstName}.${dayOffCoverage.lastName.charAt(0)}`);
      // El empleado de cobertura cubre los turnos de mañana y tarde el viernes
      if (day === 'Viernes') {
        schedules[day].morning.push(`${dayOffCoverage.firstName}.${dayOffCoverage.lastName.charAt(0)}`);
        schedules[day].afternoon.push(`${dayOffCoverage.firstName}.${dayOffCoverage.lastName.charAt(0)}`);
      }
    } else {
      // Asignar turnos para el resto de la semana
      schedules[day].morning.push(...morningShift.map(e => `${e.firstName}.${e.lastName.charAt(0)}`));
      schedules[day].afternoon.push(...afternoonShift.map(e => `${e.firstName}.${e.lastName.charAt(0)}`));
      schedules[day].night.push(`${nightShift.firstName}.${nightShift.lastName.charAt(0)}`);
    }
  });

  // Ajustes especiales para el fin de semana
  schedules['Sábado'].night = []; // El empleado de noche tiene franco el sábado
  schedules['Sábado'].afternoon.push(`${nightShift.firstName}.${nightShift.lastName.charAt(0)}`);

  // El domingo: Ajustar el turno de mañana y tarde según los días libres
  const morningOff = morningShift[0]; // Supongamos que el primer empleado de mañana tiene franco
  const afternoonOff = afternoonShift[0]; // Supongamos que el primer empleado de tarde tiene franco

  if (morningOff) {
    // El que está de tarde pasa al turno de mañana
    schedules['Domingo'].morning.push(`${afternoonShift[0].firstName}.${afternoonShift[0].lastName.charAt(0)}`);
    // El empleado de tarde cubre el turno de mañana
    schedules['Domingo'].afternoon.push(`${dayOffCoverage.firstName}.${dayOffCoverage.lastName.charAt(0)}`);
  }

  if (afternoonOff) {
    // El empleado de noche cubre el turno de tarde
    schedules['Domingo'].afternoon.push(`${nightShift.firstName}.${nightShift.lastName.charAt(0)}`);
  }

  // Actualizar el índice para la próxima rotación
  rotationIndex = (rotationIndex + 1) % numEmployees;

  // Usar transacciones para asegurar la consistencia de los datos
  await prisma.$transaction(async (prisma) => {
    // Actualizar el índice de rotación
    await prisma.lastShift.upsert({
      where: { id: 1 },
      update: { index: rotationIndex },
      create: { id: 1, index: rotationIndex }
    });

    // Eliminar los horarios antiguos y agregar los nuevos
    await prisma.schedule.deleteMany();
    await prisma.schedule.createMany({
      data: Object.keys(schedules).map(day => ({
        day,
        morning: schedules[day].morning,
        afternoon: schedules[day].afternoon,
        night: schedules[day].night,
        dayOff: schedules[day].dayOff
      }))
    });
  });
};
