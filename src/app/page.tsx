import Link from 'next/link';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-blue-600 mb-8">Bienvenido a la Estación de Servicio</h1>
      <nav>
        <ul className="flex space-x-4">
          <li>
            <Link href="/employees" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300">
              Lista de Empleados
            </Link>
          </li>
          <li>
            <Link href="/schedules" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300">
            Gestionar Horarios
            </Link>
          </li>
        </ul>
      </nav>
    </div>
    
  );
}

export default Home;
