'use client'
import Link from "next/link";
import React from "react";

export const NavBar: React.FC = () => {
  return (
    <nav className="flex justify-between items-center p-4 bg-gray-900 text-white w-full shadow-md">
      {/* Logo */}
      <div className="flex items-center">
        <img src="/logo.png" alt="Logo" className="h-10 w-10 mr-4"/>
        <span className="text-2xl font-bold">Mi Empresa</span>
      </div>
      
      {/* Navigation Links */}
      <div className="flex space-x-6">
        <Link href="/employees" className="hover:text-gray-300 transition duration-300">

          Empleados
        </Link>
        <Link href="/schedules" className="hover:text-gray-300 transition duration-300">
          Horarios
          </Link>
        <Link href="/help" className="hover:text-gray-300 transition duration-300">
          Ayuda
              </Link>
      </div>
    </nav>
  );
};
