"use client"
import React, { useState } from 'react';
import Select from 'react-select';
import { Employee, Schedule, ShiftType } from '../types';
import { employees as initialEmployees } from '../data/employees';
import { schedules as initialSchedules } from '../data/schedules';

const Schedules: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const [newEmployee, setNewEmployee] = useState<{ name: string, position: string }>({ name: '', position: '' });
  const [newSchedule, setNewSchedule] = useState<{ day: string, shift: ShiftType, employeeName: string }>({ day: '', shift: '' as ShiftType, employeeName: '' });
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [editMode, setEditMode] = useState<{ day: string, shift: ShiftType | null }>({ day: '', shift: null });

  const addEmployee = () => {
    const newId = employees.length ? employees[employees.length - 1].id + 1 : 1;
    setEmployees([...employees, { id: newId, name: newEmployee.name, position: newEmployee.position }]);
    setNewEmployee({ name: '', position: '' });
  };

  const assignShift = () => {
    setSchedules(prevSchedules => {
      return prevSchedules.map(schedule => {
        if (schedule.day === newSchedule.day) {
          return {
            ...schedule,
            shifts: {
              ...schedule.shifts,
              [newSchedule.shift]: [...(schedule.shifts[newSchedule.shift] || []), newSchedule.employeeName],
            },
          };
        }
        return schedule;
      });
    });
    setNewSchedule({ day: '', shift: '' as ShiftType, employeeName: '' });
  };

  const assignAuto = () => {
    const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const shifts: ShiftType[] = ["mañana", "tarde", "noche", "franco"];
    const totalEmployees = employees.length;
    let currentEmployeeIndex = 0;
  
    const updatedSchedules = days.map(day => {
      let shiftAssignments = { mañana: [], tarde: [], noche: [], franco: [] };
  
      shifts.forEach(shift => {
        let assignedEmployees;
        if (shift === "mañana" || shift === "tarde") {
          if (day === "Viernes") {
            assignedEmployees = [
              employees[currentEmployeeIndex].name,
              employees[(currentEmployeeIndex + 1) % totalEmployees].name
            ];
            currentEmployeeIndex = (currentEmployeeIndex + 2) % totalEmployees;
          } else {
            assignedEmployees = [
              employees[currentEmployeeIndex].name,
              employees[(currentEmployeeIndex + 1) % totalEmployees].name
            ];
            currentEmployeeIndex = (currentEmployeeIndex + 2) % totalEmployees;
          }
        } else if (shift === "noche") {
          if (day === "Sábado") {
            assignedEmployees = [];
          } else {
            assignedEmployees = [employees[currentEmployeeIndex].name];
            currentEmployeeIndex = (currentEmployeeIndex + 1) % totalEmployees;
          }
        } else { // franco
          assignedEmployees = [];
        }
        shiftAssignments[shift] = assignedEmployees;
      });
  
      return { day, shifts: shiftAssignments };
    });
  
    // Assign franco based on who has morning off
    updatedSchedules.forEach(schedule => {
      const morningOffEmployee = schedule.shifts["mañana"][0];
      schedule.shifts["franco"] = [morningOffEmployee];
    });
  
    setSchedules(updatedSchedules);
  };
  

  const handleEditMode = (day: string, shift: ShiftType) => {
    setEditMode({ day, shift });
    setSelectedEmployees(
      schedules.find(schedule => schedule.day === day)?.shifts[shift]?.map(employeeName => (
        employees.find(employee => employee.name === employeeName) || { id: '', name: '', position: '' }
      )) || []
    );
  };

  const saveChanges = () => {
    if (editMode.day && editMode.shift) {
      setSchedules(prevSchedules => {
        return prevSchedules.map(schedule => {
          if (schedule.day === editMode.day) {
            return {
              ...schedule,
              shifts: {
                ...schedule.shifts,
                [editMode.shift]: selectedEmployees.map(employee => employee.name),
              },
            };
          }
          return schedule;
        });
      });
      setEditMode({ day: '', shift: null });
    }
  };

  const cancelEdit = () => {
    setEditMode({ day: '', shift: null });
    setSelectedEmployees([]);
  };

  const employeeOptions = employees.map(employee => ({
    value: employee.name,
    label: `${employee.name} - ${employee.position}`,
  }));

  const handleChangeSelectedEmployees = (selectedOptions: any) => {
    setSelectedEmployees(selectedOptions.map((option: any) => ({ name: option.value, id: '', position: '' })));
  };

  return (
    <div>
      <h1>Gestionar Horarios</h1>

      <h2>Agregar Empleado</h2>
      <input
        type="text"
        placeholder="Nombre"
        value={newEmployee.name}
        onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
      />
      <input
        type="text"
        placeholder="Posición"
        value={newEmployee.position}
        onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
      />
      <button onClick={addEmployee}>Agregar Empleado</button>

      <h2>Asignar Turno</h2>
      <select
        value={newSchedule.day}
        onChange={(e) => setNewSchedule({ ...newSchedule, day: e.target.value })}
      >
        <option value="">Seleccione un día</option>
        {schedules.map((schedule, index) => (
          <option key={index} value={schedule.day}>{schedule.day}</option>
        ))}
      </select>
      <select
        value={newSchedule.shift}
        onChange={(e) => setNewSchedule({ ...newSchedule, shift: e.target.value as ShiftType })}
      >
        <option value="">Seleccione un turno</option>
        <option value="mañana">Mañana</option>
        <option value="tarde">Tarde</option>
        <option value="noche">Noche</option>
        <option value="franco">Franco</option>
      </select>
      <select
        value={newSchedule.employeeName}
        onChange={(e) => setNewSchedule({ ...newSchedule, employeeName: e.target.value })}
      >
        <option value="">Seleccione un empleado</option>
        {employees.map(employee => (
          <option key={employee.id} value={employee.name}>{employee.name}</option>
        ))}
      </select>
      <button onClick={assignShift}>Asignar Turno</button>
      <button onClick={assignAuto}>Asignación Automática</button>

      <h2>Editar Horarios</h2>
      {editMode.day && editMode.shift && (
        <div>
          <h3>Editando {editMode.shift} del día {editMode.day}</h3>
          <Select
            isMulti
            options={employeeOptions}
            value={selectedEmployees.map(employee => ({ value: employee.name, label: `${employee.name} - ${employee.position}` }))}
            onChange={handleChangeSelectedEmployees}
          />
          <button onClick={saveChanges}>Guardar Cambios</button>
          <button onClick={cancelEdit}>Cancelar</button>
        </div>
      )}

      <h2>Horarios</h2>
      <table>
        <thead>
          <tr>
            <th>Día/Turno</th>
            {schedules.map(schedule => (
              <th key={schedule.day}>{schedule.day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {['mañana', 'tarde', 'noche', 'franco'].map((shift, index) => (
            <tr key={index}>
              <td>{shift.charAt(0).toUpperCase() + shift.slice(1)}</td>
              {schedules.map((schedule, scheduleIndex) => (
                <td
                  key={scheduleIndex}
                  onClick={() => handleEditMode(schedule.day, shift as ShiftType)}
                  style={{ cursor: 'pointer', backgroundColor: editMode.day === schedule.day && editMode.shift === shift ? '#f0f0f0' : 'inherit' }}
                >
                  {(schedule.shifts[shift as ShiftType] || []).join(' ')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <style jsx>{`
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid black;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
      `}</style>
    </div>
  );
};

export default Schedules;
