import React, { useState } from 'react';

type Employee = {
  id: number;
  name: string;
};

type Shift = 'morning' | 'afternoon' | 'night';

type Schedule = {
  [key: string]: {
    morning: Employee[];
    afternoon: Employee[];
    night: Employee[];
  };
};

const employees: Employee[] = [
  { id: 1, name: 'Employee 1' },
  { id: 2, name: 'Employee 2' },
  { id: 3, name: 'Employee 3' },
  { id: 4, name: 'Employee 4' },
  { id: 5, name: 'Employee 5' },
  { id: 6, name: 'Employee 6' },
];

const generateSchedule = (employees: Employee[]): Schedule => {
  const schedule: Schedule = {};
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Helper function to shuffle array
  const shuffleArray = (array: any[]) => array.sort(() => Math.random() - 0.5);

  // Assign night shift for the whole week except Saturday
  const nightShiftEmployee = shuffleArray([...employees])[0];
  daysOfWeek.forEach(day => {
    schedule[day] = { morning: [], afternoon: [], night: [] };
    if (day !== 'Saturday') {
      schedule[day].night.push(nightShiftEmployee);
    }
  });

  // Assign day off and distribute other shifts
  const remainingEmployees = employees.filter(emp => emp.id !== nightShiftEmployee.id);
  let dayOffEmployee = shuffleArray([...remainingEmployees])[0];

  daysOfWeek.forEach(day => {
    if (day === 'Saturday') {
      // Night shift employee gets day off on Saturday
      schedule[day].morning = shuffleArray(remainingEmployees);
      schedule[day].afternoon = shuffleArray(remainingEmployees);
    } else if (day === 'Sunday' && dayOffEmployee) {
      // Day off for selected employee
      schedule[day].morning = shuffleArray(remainingEmployees.filter(emp => emp.id !== dayOffEmployee.id));
      schedule[day].afternoon = shuffleArray(remainingEmployees.filter(emp => emp.id !== dayOffEmployee.id));
    } else {
      const availableEmployees = shuffleArray(remainingEmployees.filter(emp => emp.id !== dayOffEmployee.id));
      schedule[day].morning.push(availableEmployees[0], availableEmployees[1]);
      schedule[day].afternoon.push(availableEmployees[2], availableEmployees[3]);
    }
  });

  return schedule;
};
