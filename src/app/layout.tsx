import './globals.css';
import { NavBar } from './components/NavBar';

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow bg-gray-100 p-4">
          {children}
        </main>
      </body>
    </html>
  );
};

export default RootLayout;
