"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import WhatsAppFloatingButton from "./WhatsAppFloatingButton";
import styles from "./Footer.module.css";

const Footer: React.FC = () => {
  const pathname = usePathname();

  const showWhatsAppFloating = pathname && !pathname.startsWith("/admin");

  return (
    <>
      <footer className={styles.pdxFooter}>
        <div className={styles.ftGlowLeft} />
        <div className={styles.ftGlowRight} />

        {/* Main footer content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Columna 1: Sobre Nosotros */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">
                Sobre TodoMarket
              </h3>
              <p className="text-sm text-slate-300 mb-4">
                Plataforma de comercio electrónico diseñada para conectar estudiantes emprendedores con la comunidad universitaria.
              </p>
              <Link
                href="/terminos"
                className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span className="material-icons-round text-base">description</span>
                Términos y Condiciones
              </Link>
            </div>

            {/* Columna 2: Enlaces rápidos */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">
                Enlaces
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/productos" className="text-sm text-slate-300 hover:text-blue-400 transition-colors">
                    Productos
                  </Link>
                </li>
                <li>
                  <Link href="/reservas" className="text-sm text-slate-300 hover:text-blue-400 transition-colors">
                    Reservas de Alimentos
                  </Link>
                </li>
                <li>
                  <Link href="/ofertas" className="text-sm text-slate-300 hover:text-blue-400 transition-colors">
                    Ofertas
                  </Link>
                </li>
              </ul>
            </div>

            {/* Columna 3: Contacto y Registro */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">
                Contacto
              </h3>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-slate-300 flex items-center gap-2">
                  WhatsApp: +593 96 332 8168
                </p>
              </div>
              <Link
                href="/registro-emprendedor"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <span className="material-icons-round text-base">person_add</span>
                Regístrate como Emprendedor
              </Link>
            </div>
          </div>

          {/* Divider */}
          <div className={styles.ftDivider} />

          {/* Copyright row */}
          <div className={styles.ftCopyRow}>
            <p className={styles.ftCopyText}>
              © {new Date().getFullYear()} TodoMarket. Todos los derechos reservados.
            </p>
            <div className={styles.ftCopyRight}>
              <div className={styles.ftBadge}>
                <div className={styles.ftBadgeDot} />
                Hecho en Ecuador
              </div>
              <a
                href="https://www.instagram.com/hector.cobena/"
                target="_blank"
                rel="noreferrer"
                className={styles.ftDevLink}
              >
                Desarrollado por Héctor Cobeña
              </a>
            </div>
          </div>
        </div>

      </footer>
    </>
  );
};

export default Footer;
