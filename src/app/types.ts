// src/types.ts
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  email: string;
  phoneNumber: string;
}

  
  export interface Shifts {
    morning: string[];
    afternoon: string[];
    night: string[];
    dayOff: string[];
  }
  
  export interface Schedule {
    day: string;
    morning: string[];
    afternoon: string[];
    night: string[];
    dayOff: string[];
    employees: Employee[];
  }
  
  
  export type ShiftType = keyof Shifts;
  