"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import WhatsAppFloatingButton from "./WhatsAppFloatingButton";
import styles from "./Footer.module.css";

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const IconFacebook = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
    <path d="M22.675 0h-21.35C.595 0 0 .595 0 1.326v21.348C0 23.405.595 24 1.326 24h11.495v-9.294H9.692V11.08h3.129V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.918c-1.504 0-1.795.715-1.795 1.763v2.31h3.587l-.467 3.626h-3.12V24h6.116C23.405 24 24 23.405 24 22.674V1.326C24 .595 23.405 0 22.675 0z" />
  </svg>
);

const socialLinks = [
  { href: "https://www.instagram.com/todoshop/", label: "Instagram", Icon: IconInstagram },
  { href: "https://www.facebook.com/todoshop/", label: "Facebook", Icon: IconFacebook },
];

const Footer: React.FC = () => {
  const pathname = usePathname();

  const showWhatsAppFloating = pathname && !pathname.startsWith("/admin");

  return (
    <>
      <footer className={styles.pdxFooter}>
        <div className={styles.ftGlowLeft} />
        <div className={styles.ftGlowRight} />

 

        {/* Divider */}
        <div className={styles.ftDivider} />

        {/* Copyright row */}
        <div className={styles.ftCopyRow}>
          <p className={styles.ftCopyText}>
            © {new Date().getFullYear()} todoShop. Todos los derechos reservados.
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

      </footer>
    </>
  );
};

export default Footer;
