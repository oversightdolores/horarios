// src/components/EmployeeCard.tsx
import React from 'react';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  position: string;
}

interface EmployeeCardProps {
  employee: Employee;
  editEmployee: (employee: Employee) => void;
  openModal: (employee: Employee) => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, editEmployee, openModal }) => {
  return (
    <li className="flex justify-between items-center p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div>
        <p className="font-bold text-lg">{employee.firstName} {employee.lastName}</p>
        <p className="text-gray-600">{employee.email}</p>
        <p className="text-gray-600">{employee.phoneNumber}</p>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => editEmployee(employee)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300"
        >
          Editar
        </button>
        <button
          onClick={() => openModal(employee)}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-300"
        >
          Eliminar
        </button>
      </div>
    </li>
  );
};

export default EmployeeCard;
