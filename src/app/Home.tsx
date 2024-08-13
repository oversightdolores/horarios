import Link from 'next/link';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600 mb-8">Bienvenido a la Estación de Servicio</h1>
      <nav>
        <ul className="flex space-x-4">
          
            <Link href="/employees" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300">
                Lista de Empleados
              
            </Link>
         
        </ul>
      </nav>
    </div>
  );
};

export default Home;
