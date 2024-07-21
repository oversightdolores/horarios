"use client"
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { Employee, Schedule, ShiftType } from '../types';

const Schedules: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [newSchedule, setNewSchedule] = useState<{ day: string, shift: ShiftType, employeeName: string }>({ day: '', shift: '' as ShiftType, employeeName: '' });
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [editMode, setEditMode] = useState<{ day: string, shift: ShiftType | null }>({ day: '', shift: null });

  const shiftNames: { [key in ShiftType]: string } = {
    morning: 'Mañana',
    afternoon: 'Tarde',
    night: 'Noche',
    dayOff: 'Descanso'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const employeesResponse = await fetch('/api/employees');
        const employeesData = await employeesResponse.json();
        setEmployees(Array.isArray(employeesData) ? employeesData : []);

        const schedulesResponse = await fetch('/api/schedules');
        const schedulesData = await schedulesResponse.json();
        setSchedules(Array.isArray(schedulesData) ? schedulesData : []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const assignShift = async () => {
    if (newSchedule.day && newSchedule.shift && newSchedule.employeeName) {
      const updatedSchedules = schedules.map(schedule => {
        if (schedule.day === newSchedule.day) {
          return {
            ...schedule,
            [newSchedule.shift]: [...schedule[newSchedule.shift], newSchedule.employeeName]
          };
        }
        return schedule;
      });

      await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schedules: updatedSchedules }),
      });

      setSchedules(updatedSchedules);
      setNewSchedule({ day: '', shift: '' as ShiftType, employeeName: '' });
    }
  };

  const assignAuto = async () => {
    await fetch('/api/schedules', {
      method: 'POST',
    });

    const updatedSchedules = await fetch('/api/schedules');
    const schedulesData = await updatedSchedules.json();
    setSchedules(Array.isArray(schedulesData) ? schedulesData : []);
  };

  const handleEditMode = (day: string, shift: ShiftType) => {
    setEditMode({ day, shift });
    setSelectedEmployees(
      schedules.find(schedule => schedule.day === day)?.[shift]?.map(employeeName => (
        employees.find(employee => `${employee.firstName}.${employee.lastName?.charAt(0)}` === employeeName) || { id: '', firstName: '', position: '', lastName: '' }
      )) || []
    );
  };

  const saveChanges = async () => {
    if (editMode.day && editMode.shift) {
      const updatedSchedules = schedules.map(schedule => {
        if (schedule.day === editMode.day) {
          return {
            ...schedule,
            [editMode.shift]: selectedEmployees.map(employee => `${employee.firstName}.${employee.lastName?.charAt(0)}`)
          };
        }
        return schedule;
      });

      await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schedules: updatedSchedules }),
      });

      setSchedules(updatedSchedules);
      setEditMode({ day: '', shift: null });
    }
  };

  const cancelEdit = () => {
    setEditMode({ day: '', shift: null });
    setSelectedEmployees([]);
  };

  const employeeOptions = employees.map(employee => ({
    value: employee.firstName,
    label: `${employee.firstName}.${employee.lastName?.charAt(0)}`,
  }));

  const handleChangeSelectedEmployees = (selectedOptions: any) => {
    setSelectedEmployees(selectedOptions.map((option: any) => {
      const [firstName, lastName] = option.label.split('.');
      return {
        firstName,
        lastName,
        id: '',
        position: ''
      };
    }));
  };

  return (
    <div>
      <h1>Gestionar Horarios</h1>

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
        {Object.entries(shiftNames).map(([key, name]) => (
          <option key={key} value={key}>{name}</option>
        ))}
      </select>
      <select
        value={newSchedule.employeeName}
        onChange={(e) => setNewSchedule({ ...newSchedule, employeeName: e.target.value })}
      >
        <option value="">Seleccione un empleado</option>
        {employees.map(employee => (
          <option key={employee.id} value={`${employee.firstName}.${employee.lastName?.charAt(0)}`}>{`${employee.firstName}.${employee.lastName?.charAt(0)}`}</option>
        ))}
      </select>
      <button onClick={assignShift}>Asignar Turno</button>
      <button onClick={assignAuto}>Asignación Automática</button>

      <h2>Editar Horarios</h2>
      {editMode.day && editMode.shift && (
        <div>
          <h3>Editando {shiftNames[editMode.shift]} del día {editMode.day}</h3>
          <Select
            isMulti
            options={employeeOptions}
            value={selectedEmployees.map(employee => ({
              value: `${employee.firstName}.${employee.lastName?.charAt(0)}`,
              label: `${employee.firstName}.${employee.lastName?.charAt(0)}`
            }))}
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
          {Object.keys(shiftNames).map((shift, index) => (
            <tr key={index}>
              <td>{shiftNames[shift as ShiftType]}</td>
              {schedules.map((schedule, scheduleIndex) => (
                <td
                  key={scheduleIndex}
                  onClick={() => handleEditMode(schedule.day, shift as ShiftType)}
                  style={{ cursor: 'pointer', backgroundColor: editMode.day === schedule.day && editMode.shift === shift ? '#f0f0f0' : 'inherit' }}
                >
                  {(schedule[shift as keyof Schedule] || []).join(', ')}
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
