// src/pages/employees.tsx
"use client"
import React, { useState, useEffect } from "react";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  position: string;
}

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newEmployee, setNewEmployee] = useState<Employee>({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    position: "",
  });
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    fetch("/api/employees")
      .then((res) => res.json())
      .then((data) => setEmployees(data));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewEmployee({ ...newEmployee, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log(editingEmployee)
    e.preventDefault();
    if (editingEmployee) {
      const updatedEmployee = await fetch(`/api/employees/${editingEmployee.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEmployee),
      }).then((res) => res.json());
      setEmployees(
        employees.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp))
      );
    } else {
      const addedEmployee = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEmployee),
      }).then((res) => res.json());
      setEmployees([...employees, addedEmployee]);
    }
    setNewEmployee({
      id: "",
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      position: "",
    });
    setEditingEmployee(null);
  };

  const editEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setNewEmployee(employee);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Gestión de Empleados</h1>
      <form
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto p-4 bg-white shadow-md rounded-lg space-y-4"
      >
        <h2 className="text-xl font-semibold mb-4">Agregar/Editar Empleado</h2>
        <input
          type="text"
          name="firstName"
          placeholder="Nombre"
          value={newEmployee.firstName}
          onChange={handleChange}
          required
          className="input input-bordered w-full"
        />
        <input
          type="text"
          name="lastName"
          placeholder="Apellido"
          value={newEmployee.lastName}
          onChange={handleChange}
          required
          className="input input-bordered w-full"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={newEmployee.email}
          onChange={handleChange}
          required
          className="input input-bordered w-full"
        />
        <input
          type="tel"
          name="phoneNumber"
          placeholder="Número de Teléfono"
          value={newEmployee.phoneNumber}
          onChange={handleChange}
          required
          className="input input-bordered w-full"
        />
        <select
          name="position"
          value={newEmployee.position}
          onChange={handleChange}
          required
          className="select select-bordered w-full"
        >
          <option value="">Seleccione una posición</option>
          <option value="playa">Playa</option>
          <option value="shop">Shop</option>
        </select>
        <button type="submit" className="btn btn-primary w-full">
          {editingEmployee ? "Guardar Cambios" : "Agregar Empleado"}
        </button>
      </form>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Empleados de Playa</h2>
          <ul className="space-y-2">
            {employees?.filter((e) => e.position === "playa").map((employee) => (
              <li
                key={employee.id}
                className="flex justify-between items-center p-4 bg-gray-100 rounded shadow"
              >
                <div>
                  {employee.firstName} {employee.lastName} - {employee.email} -{" "}
                  {employee.phoneNumber}
                </div>
                <button
                  onClick={() => editEmployee(employee)}
                  className="btn btn-sm btn-secondary"
                >
                  Editar
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Empleados de Shop</h2>
          <ul className="space-y-2">
            {employees?.filter((e) => e.position === "shop").map((employee) => (
              <li
                key={employee.id}
                className="flex justify-between items-center p-4 bg-gray-100 rounded shadow"
              >
                <div>
                  {employee.firstName} {employee.lastName} - {employee.email} -{" "}
                  {employee.phoneNumber}
                </div>
                <button
                  onClick={() => editEmployee(employee)}
                  className="btn btn-sm btn-secondary"
                >
                  Editar
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Employees;
