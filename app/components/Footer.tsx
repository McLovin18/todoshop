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

 

        {/* Divider */}
        <div className={styles.ftDivider} />

        {/* Copyright row */}
        <div className={styles.ftCopyRow}>
          <p className={styles.ftCopyText}>
            © {new Date().getFullYear()}  TodoMarket. Todos los derechos reservados.
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
