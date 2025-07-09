// components/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#f1f5f9] border-t border-[#e2e8f0] py-4 text-center text-[#64748b] text-sm">
      <div className="container mx-auto px-4">
        <p>Versión 1.0.0 © 2025 Desarrollado para Radio Exitosa</p>
        <p className="mt-1 text-xs">Sistema de Control de Despachos - Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;