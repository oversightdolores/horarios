'use client'
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { Employee, Schedule, ShiftType } from '../types';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Schedules: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [newSchedule, setNewSchedule] = useState<{ day: string; shift: ShiftType; employeeName: string }>({
    day: '',
    shift: '' as ShiftType,
    employeeName: '',
  });
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [editMode, setEditMode] = useState<{ day: string; shift: ShiftType | null }>({ day: '', shift: null });

  const [position, setPosition] = useState<'shop' | 'playa'>('shop');

  const shiftNames: { [key in ShiftType]: string } = {
    morning: 'Mañana',
    afternoon: 'Tarde',
    night: 'Noche',
    dayOff: 'Descanso',
  };

  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const employeesResponse = await fetch(`/api/employees?position=${position}`);
        if (!employeesResponse.ok) {
          const errorData = await employeesResponse.json();
          throw new Error(errorData.error);
        }
        const employeesData = await employeesResponse.json();
        setEmployees(Array.isArray(employeesData) ? employeesData : []);

        const schedulesResponse = await fetch(`/api/schedules?position=${position}`);
        if (!schedulesResponse.ok) {
          const errorData = await schedulesResponse.json();
          throw new Error(errorData.error);
        }
        const schedulesData = await schedulesResponse.json();
        setSchedules(Array.isArray(schedulesData) ? schedulesData : []);
      } catch (error: unknown) {
        console.error('Error fetching data:', error);
        toast.error((error as Error).message);
      }
    };

    fetchData();
  }, [position]);

  const assignShift = async () => {
    if (newSchedule.day && newSchedule.shift && newSchedule.employeeName) {
      const updatedSchedules = schedules.map(schedule => {
        if (schedule.day === newSchedule.day) {
          return {
            ...schedule,
            [newSchedule.shift]: [...schedule[newSchedule.shift], newSchedule.employeeName],
          };
        }
        return schedule;
      });

      try {
        const response = await fetch('/api/schedules', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ schedules: updatedSchedules, position }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error);
        }

        setSchedules(updatedSchedules);
        setNewSchedule({ day: '', shift: '' as ShiftType, employeeName: '' });
        toast.success('Turno asignado correctamente');
      } catch (error: unknown) {
        console.error('Error assigning shift:', error);
        toast.error((error as Error).message);
      }
    }
  };

  const assignAuto = async () => {
    try {
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ position }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const result = await response.json();
      const updatedSchedulesResponse = await fetch(`/api/schedules?position=${position}`);
      const schedulesData = await updatedSchedulesResponse.json();
      setSchedules(Array.isArray(schedulesData) ? schedulesData : []);
      toast.success(result.message);
    } catch (error: unknown) {
      console.error('Error en la asignación automática de turnos:', error);
      toast.error((error as Error).message);
    }
  };

  const handleEditMode = (day: string, shift: ShiftType) => {
    setEditMode({ day, shift });
    setSelectedEmployees(
      schedules
        .find(schedule => schedule.day === day)?.[shift]
        .map(employeeName => employees.find(employee => `${employee.firstName}.${employee.lastName?.charAt(0)}` === employeeName) || {
          id: '',
          firstName: '',
          lastName: '',
          position: '',
          email: '',
          phoneNumber: ''
        }) || []
    );
  };

  const saveChanges = async () => {
    if (editMode.day && editMode.shift) {
      const updatedSchedules = schedules.map(schedule => {
        if (schedule.day === editMode.day) {
          const shiftKey = editMode.shift as keyof Schedule;
          return {
            ...schedule,
            [shiftKey]: selectedEmployees.map(employee => `${employee.firstName}.${employee.lastName?.charAt(0)}`),
          };
        }
        return schedule;
      });

      try {
        const response = await fetch('/api/schedules', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ schedules: updatedSchedules, position }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error);
        }

        setSchedules(updatedSchedules);
        setEditMode({ day: '', shift: null });
        toast.success('Cambios guardados correctamente');
      } catch (error: unknown) {
        console.error('Error saving changes:', error);
        toast.error((error as Error).message);
      }
    }
  };

  const cancelEdit = () => {
    setEditMode({ day: '', shift: null });
    setSelectedEmployees([]);
  };

  const employeeOptions = employees.map(employee => ({
    value: `${employee.firstName}.${employee.lastName?.charAt(0)}`,
    label: `${employee.firstName}.${employee.lastName?.charAt(0)}`,
  }));

  const handleChangeSelectedEmployees = (selectedOptions: any) => {
    setSelectedEmployees(
      selectedOptions.map((option: any) => {
        const [firstName, lastName] = option.label.split('.');
        const foundEmployee = employees.find(emp => emp.firstName === firstName && emp.lastName?.charAt(0) === lastName);
        return foundEmployee || {
          id: '',
          firstName,
          lastName,
          position: '',
          email: '',
          phoneNumber: ''
        };
      })
    );
  };

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Gestionar Horarios</h1>
      <Link href="/" className="border p-2 rounded border-gray-300 text-xl no-underline mb-4 inline-block">
        Volver
      </Link>

      <h2 className="text-xl font-semibold mb-2">Seleccionar Posición</h2>
      <select value={position} onChange={(e) => setPosition(e.target.value as 'shop' | 'playa')} className="border border-gray-300 rounded p-2 mb-4">
        <option value="shop">Shop</option>
        <option value="playa">Playa</option>
      </select>

      <h2 className="text-xl font-semibold mb-2">Asignar Turno</h2>
      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={newSchedule.day}
          onChange={(e) => setNewSchedule({ ...newSchedule, day: e.target.value })}
          className="border border-gray-300 rounded p-2"
        >
          <option value="">Seleccione un día</option>
          {schedules.map((schedule, index) => (
            <option key={index} value={schedule.day}>{schedule.day}</option>
          ))}
        </select>
        <select
          value={newSchedule.shift}
          onChange={(e) => setNewSchedule({ ...newSchedule, shift: e.target.value as ShiftType })}
          className="border border-gray-300 rounded p-2"
        >
          <option value="">Seleccione un turno</option>
          {Object.entries(shiftNames).map(([key, name]) => (
            <option key={key} value={key}>{name}</option>
          ))}
        </select>
        <select
          value={newSchedule.employeeName}
          onChange={(e) => setNewSchedule({ ...newSchedule, employeeName: e.target.value })}
          className="border border-gray-300 rounded p-2"
        >
          <option value="">Seleccione un empleado</option>
          {employeeOptions.map(option => (
            <option key={option.value} value={option.label}>{option.label}</option>
          ))}
        </select>
        <button onClick={assignShift} className="bg-blue-500 text-white p-2 rounded">Asignar Turno</button>
        <button onClick={assignAuto} className="bg-green-500 text-white p-2 rounded ml-2">Asignación Automática</button>
      </div>

      <h2 className="text-xl font-semibold mb-2">Editar Horarios</h2>
      {editMode.day && editMode.shift && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Editando {shiftNames[editMode.shift]} del día {editMode.day}</h3>
          <Select
            isMulti
            options={employeeOptions}
            value={selectedEmployees.map(employee => ({
              value: `${employee.firstName}.${employee.lastName?.charAt(0)}`,
              label: `${employee.firstName}.${employee.lastName?.charAt(0)}`,
            }))}
            onChange={handleChangeSelectedEmployees}
            className="mb-2"
          />
          <button onClick={saveChanges} className="bg-blue-500 text-white p-2 rounded">Guardar Cambios</button>
          <button onClick={cancelEdit} className="bg-red-500 text-white p-2 rounded ml-2">Cancelar</button>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-2">Horarios</h2>
      <table className="w-full border-collapse mb-4">
        <thead> 
          <tr>
            <th className="border border-gray-300 p-2">Día/Turno</th>
            {schedules.map(schedule => (
              <th key={schedule.day} className="border border-gray-300 p-2">{schedule.day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
        {Object.keys(shiftNames).map((shift, index) => (
  <tr key={index}>
    <td className="border border-gray-300 p-2">{shiftNames[shift as ShiftType]}</td>
    {schedules.map((schedule, scheduleIndex) => {
      const shiftEmployees = schedule[shift as keyof Schedule];
      const employeeNames = Array.isArray(shiftEmployees) ? shiftEmployees.join(', ') : '';
      return (
        <td
          key={scheduleIndex}
          onClick={() => handleEditMode(schedule.day, shift as ShiftType)}
          className={`border border-gray-300 p-2 cursor-pointer ${editMode.day === schedule.day && editMode.shift === shift ? 'bg-gray-200' : ''}`}
        >
          {employeeNames}
        </td>
      );
    })}
  </tr>
))}

        </tbody>
      </table>
    </div>
  );
};

export default Schedules;
