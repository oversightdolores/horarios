"use client";
import React, { useState, useEffect, useCallback } from "react";
import EmployeeCard from "../components/EmployeeCard";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Link from "next/link";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  position: string;
}

interface EmployeeListProps {
  title: string;
  employees: Employee[];
  editEmployee: (employee: Employee) => void;
  openModal: (employee: Employee) => void;
}

const initialEmployeeState: Employee = {
  id: "",
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  position: "",
};

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newEmployee, setNewEmployee] = useState<Employee>(initialEmployeeState);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [empShop, setEmpShop] = useState<Employee[]>([]);
  const [empPlaya, setEmpPlaya] = useState<Employee[]>([]);

  const fetchEmployees = useCallback(async () => {
    try {
      const [shopRes, playaRes] = await Promise.all([
        fetch("/api/employees?position=shop"),
        fetch("/api/employees?position=playa"),
      ]);
      if (!shopRes.ok || !playaRes.ok) {
        throw new Error("Error fetching employees");
      }
      const [shopData, playaData] = await Promise.all([
        shopRes.json(),
        playaRes.json(),
      ]);
      setEmpShop(shopData);
      setEmpPlaya(playaData);
    } catch (error) {
      toast.error("Error al cargar empleados");
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewEmployee((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const apiPath = editingEmployee ? `/api/employees/${editingEmployee.id}` : "/api/employees";
    const method = editingEmployee ? "PUT" : "POST";

    try {
      const response = await fetch(apiPath, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmployee),
      });
      if (!response.ok) {
        throw new Error("Error saving employee");
      }
      const savedEmployee = await response.json();

      setEmployees((prev) => {
        if (editingEmployee) {
          return prev.map((emp) => (emp.id === savedEmployee.id ? savedEmployee : emp));
        }
        return [...prev, savedEmployee];
      });
      toast.success(editingEmployee ? "Empleado actualizado correctamente" : "Empleado agregado correctamente");

      setNewEmployee(initialEmployeeState);
      setEditingEmployee(null);
      fetchEmployees();
    } catch (error) {
      toast.error("Error al guardar el empleado");
    }
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
    try {
      const response = await fetch(`/api/employees/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Error deleting employee");
      }
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
      toast.info("Empleado eliminado correctamente");
      closeModal();
      fetchEmployees();
    } catch (error) {
      toast.error("Error al eliminar el empleado");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Link href="/" className="border p-2 rounded border-gray-300 text-xl no-underline mb-4 inline-block">
        Volver
      </Link>
      <ToastContainer 
        position="top-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <h1 className="text-3xl font-bold mb-6 text-center">Gestión de Empleados</h1>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg space-y-4">
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
        <EmployeeList title="Empleados de Playa" employees={empPlaya} editEmployee={editEmployee} openModal={openModal} />
        <EmployeeList title="Empleados de Shop" employees={empShop} editEmployee={editEmployee} openModal={openModal} />
      </div>
      {isModalOpen && <DeleteModal employee={employeeToDelete} closeModal={closeModal} deleteEmployee={deleteEmployee} />}
    </div>
  );
};

const EmployeeList: React.FC<EmployeeListProps> = ({ title, employees, editEmployee, openModal }) => (
  <div>
    <h2 className="text-2xl font-semibold mb-4">{title}</h2>
    <ul className="space-y-2">
      {employees.map((employee) => (
        <EmployeeCard key={employee.id} employee={employee} editEmployee={editEmployee} openModal={openModal} />
      ))}
    </ul>
  </div>
);

const DeleteModal = ({ employee, closeModal, deleteEmployee }: { employee: Employee | null; closeModal: () => void; deleteEmployee: (id: string) => void }) => (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    <div className="bg-black opacity-50 absolute inset-0"></div>
    <div className="bg-white p-6 rounded-lg shadow-lg z-10 max-w-md w-full">
      <p className="mb-4 text-lg font-semibold text-gray-800">
        ¿Estás seguro de que quieres eliminar a {employee?.firstName} {employee?.lastName}?
      </p>
      <div className="flex justify-end space-x-4">
        <button
          onClick={closeModal}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-300"
        >
          Cancelar
        </button>
        <button
          onClick={() => deleteEmployee(employee!.id)}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-300"
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
);

export default Employees;
