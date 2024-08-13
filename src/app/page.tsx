import Link from 'next/link';
import Home from './Home';

const App: React.FC = () => {
  return (
    <>
    <Home />
    <footer className="bg-blue-500 text-white text-center p-4">
      <p>&copy;
        {new Date().getFullYear()} Mi Empresa. Todos los derechos reservados.
      </p>
    </footer>
    </>
    
  );
}

export default App;
