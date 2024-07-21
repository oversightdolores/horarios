// src/types.ts
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  position: string;
}
  
  export interface Shifts {
    morning: string[];
    afternoon: string[];
    night: string[];
    dayOff: string[];
  }
  
  export interface Schedule {
    day: string;
    shifts: Shifts;
  }
  
  export type ShiftType = keyof Shifts;
  