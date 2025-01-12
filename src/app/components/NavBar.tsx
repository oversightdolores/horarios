'use client'
import Link from "next/link";
import Image from "next/image";
import React from "react";

export const NavBar: React.FC = () => {
  return (
    <nav className="flex justify-between items-center p-4 bg-gray-900 text-white w-full shadow-md">
      {/* Logo */}
      <div className="flex items-center">
        <Image  src="https://1000marcas.net/wp-content/uploads/2019/12/Shell-Logo-1.png"  
        width={100}   
        height={120}   
        alt="Logo" className=" mr-4"/>
        <Link href="/" className="text-2xl font-bold">Mauser</Link>
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
