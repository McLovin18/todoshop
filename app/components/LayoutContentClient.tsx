"use client";
import { useOnboarding } from "../context/OnboardingContext";
import { usePathname } from "next/navigation";
import { UserProvider } from "../context/UserContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ToastContainer from "./ToastContainer";
import BottomBar from "./BottomBar";

export default function LayoutContentClient({ children }: { children: React.ReactNode }) {
  const { showWelcomeGlobal } = useOnboarding();
  const pathname = usePathname();
  
  // Si estamos en /login y showWelcomeGlobal, solo renderiza children (el modal)
  if (pathname === "/login" && showWelcomeGlobal) {
    return <>{children}</>;
  }
  
  // Determinar si es una página pública
  const isPublicPage = pathname === "/" || pathname === "/productos" || pathname === "/reservas" || pathname === "/cart" || pathname === "/search-results" || pathname === "/login" || pathname === "/product-detail";
  
  return (
    <UserProvider>
      <ToastContainer />
      <Navbar />
      <div className={isPublicPage ? "pb-20 lg:pb-0" : ""}>
        {children}
      </div>
      <Footer />
      {isPublicPage && <BottomBar role="public" />}
    </UserProvider>
  );
}
