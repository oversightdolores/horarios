// src/types.ts
export interface Employee {
    id: number;
    name: string;
    position: string;
  }
  
  export interface Shifts {
    mañana: string[];
    tarde: string[];
    noche: string[];
    franco: string[];
  }
  
  export interface Schedule {
    day: string;
    shifts: Shifts;
  }
  
  export type ShiftType = keyof Shifts;
  