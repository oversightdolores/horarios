// pages/index.tsx
import Link from 'next/link';

const Home: React.FC = () => {
  return (
    <div>
      <h1>Bienvenido a la Estación de Servicio</h1>
      <nav>
        <ul>
          <li>
            <Link href="/employees">Lista de Empleados</Link>
          </li>
          <li>
            <Link href="/schedules">Gestionar Horarios</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Home;
