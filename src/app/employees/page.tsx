"use client"
import React, { useState, useEffect } from "react";
import EmployeeCard from '../components/EmployeeCard';
import { toast, ToastContainer } from "react-toastify";
import Link from "next/link";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [position, setPosition] = useState<'shop' | 'playa'>('playa');
  const [empShop, setEmpShop] = useState<Employee[]>([])
  const [empPlaya, setEmpPlaya] = useState<Employee[]>([])

  useEffect(() => {
    fetch('/api/employees?position=shop')
      .then(res => res.json())
      .then(data => setEmpShop(data.filter((emp: Employee) => emp.position === 'shop')));

    fetch('/api/employees?position=playa')
      .then(res => res.json())
      .then(data => setEmpPlaya(data.filter((emp: Employee) => emp.position === 'playa')));
  }, []);

  useEffect(() => {
    if (empShop.length === 0) {
      setPosition('playa');
    } else if (empPlaya.length === 0) {
      setPosition('shop');
    }
  }, [empShop, empPlaya]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewEmployee({ ...newEmployee, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee) {
      const updatedEmployee = await fetch(`/api/employees/${editingEmployee.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEmployee),
      }).then((res) => res.json());
      toast.success("Empleado actualizado correctamente")
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
     // toast.success("Empleado agregado correctamente")
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

  const openModal = (employee: Employee) => {
    setIsModalOpen(true);
    setEmployeeToDelete(employee);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEmployeeToDelete(null);
  };

  const deleteEmployee = async (id: string) => {
    const res = await fetch(`/api/employees/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setEmployees(employees.filter((emp) => emp.id !== id));
      closeModal();
      toast.info("Empleado eliminado correctamente")
    } else {
      console.error("Error al eliminar el empleado");
      toast.error("Error al eliminar el empleado")
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Link href="/" className="border p-2 rounded border-gray-300 text-xl no-underline mb-4 inline-block">
        Volver
      </Link>
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6 text-center">Gestión de Empleados</h1>
      <form
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg space-y-4"
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
            {
            empPlaya.length > 0 &&
            empPlaya.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                editEmployee={editEmployee}
                openModal={openModal}
              />
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Empleados de Shop</h2>
          <ul className="space-y-2">
          {empShop.length > 0 &&
              empShop.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  editEmployee={editEmployee}
                  openModal={openModal}
                />
              ))}
          </ul>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-black opacity-50 absolute inset-0"></div>
          <div className="bg-white p-6 rounded-lg shadow-lg z-10 max-w-md w-full">
            <p className="mb-4 text-lg font-semibold text-gray-800">¿Estás seguro de que quieres eliminar a {employeeToDelete?.firstName} {employeeToDelete?.lastName}?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteEmployee(employeeToDelete!.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-300"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
