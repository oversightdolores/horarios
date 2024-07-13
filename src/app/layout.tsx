// src/app/layout.tsx
import './globals.css';

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
