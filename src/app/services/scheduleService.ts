
const empleados = [
  'Empleado1', 'Empleado2', 'Empleado3',
  'Empleado4', 'Empleado5', 'Empleado6'
];

const diasSemana = [
  'lunes', 'martes', 'miércoles', 'jueves',
  'viernes', 'sábado', 'domingo'
];

export async function asignarTurnos() {
  const indiceRotacion = await prisma.indiceRotacion.findFirst();

  const indice = indiceRotacion ? indiceRotacion.valor : 0;
  const empleadosRotados = empleados.slice(indice).concat(empleados.slice(0, indice));

  const horarios = [];

  diasSemana.forEach((dia, index) => {
    if (dia === 'viernes') {
      horarios.push({ fecha: dia, turno: 'mañana', empleado: empleadosRotados[0] });
      horarios.push({ fecha: dia, turno: 'tarde', empleado: empleadosRotados[1] });
      horarios.push({ fecha: dia, turno: 'intermedio', empleado: empleadosRotados[5] });
    } else if (dia === 'sábado') {
      horarios.push({ fecha: dia, turno: 'mañana', empleado: empleadosRotados[0] });
      horarios.push({ fecha: dia, turno: 'tarde', empleado: empleadosRotados[1] });
      horarios.push({ fecha: dia, turno: 'noche', empleado: empleadosRotados[5] });
    } else if (dia === 'domingo') {
      horarios.push({ fecha: dia, turno: 'mañana', empleado: empleadosRotados[1] });
      horarios.push({ fecha: dia, turno: 'tarde', empleado: empleadosRotados[4] });
      horarios.push({ fecha: dia, turno: 'noche', empleado: empleadosRotados[5] });
    } else {
      horarios.push({ fecha: dia, turno: 'mañana', empleado: empleadosRotados[0] });
      horarios.push({ fecha: dia, turno: 'tarde', empleado: empleadosRotados[1] });
      horarios.push({ fecha: dia, turno: 'noche', empleado: empleadosRotados[4] });
    }
  });

  await prisma.$transaction([
    prisma.turno.deleteMany(),
    ...horarios.map(horario => prisma.turno.create({
      data: {
        fecha: new Date(), // Ajustar a la fecha correcta
        turno: horario.turno,
        empleado: {
          connectOrCreate: {
            where: { nombre: horario.empleado },
            create: { nombre: horario.empleado },
          }
        }
      }
    })),
    prisma.indiceRotacion.upsert({
      where: { id: 1 },
      update: { valor: (indice + 1) % empleados.length },
      create: { valor: (indice + 1) % empleados.length },
    })
  ]);
}
