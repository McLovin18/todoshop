// Helper functions for Google Analytics events

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export function trackEvent(eventName: string, parameters?: Record<string, any>) {
  if (typeof window !== "undefined" && typeof window.gtag === "function" && GA_ID) {
    window.gtag("event", eventName, parameters);
  }
}

// Eventos de E-commerce
export function trackAddToCart(product: any, quantity: number = 1) {
  trackEvent("add_to_cart", {
    item_id: product.id,
    item_name: product.nombre,
    item_category: product.categoria,
    price: product.precio,
    quantity,
    currency: "USD",
  });
}

export function trackViewItem(product: any) {
  trackEvent("view_item", {
    item_id: product.id,
    item_name: product.nombre,
    item_category: product.categoria,
    price: product.precio,
    currency: "USD",
  });
}

export function trackBeginCheckout(items: any[], total: number) {
  trackEvent("begin_checkout", {
    currency: "USD",
    value: total,
    items: items.map(item => ({
      item_id: item.id,
      item_name: item.nombre,
      item_category: item.categoria,
      price: item.precio,
      quantity: item.cantidad || 1,
    })),
  });
}

export function trackPurchaseWhatsApp(
  emprendedorId: string,
  emprendedorNombre: string,
  total: number,
  itemCount: number
) {
  const transactionId = `whatsapp_${emprendedorId}_${Date.now()}`;
  trackEvent("purchase", {
    transaction_id: transactionId,
    currency: "USD",
    value: total,
    payment_method: "whatsapp",
    emprendedor_id: emprendedorId,
    emprendedor_name: emprendedorNombre,
    item_count: itemCount,
  });
}

export function trackReserveFood(alimentoId: string, alimentoNombre: string, cantidad: number, total: number) {
  trackEvent("reserve_food", {
    currency: "USD",
    value: total,
    item_id: alimentoId,
    item_name: alimentoNombre,
    quantity: cantidad,
  });
}

// Eventos de usuario
export function trackSignUp(method: string = "email") {
  trackEvent("sign_up", {
    method,
  });
}

export function trackLogin(method: string = "email") {
  trackEvent("login", {
    method,
  });
}

export function trackEntrepreneurRegister(nombreNegocio: string, tipoEmprendimiento: string) {
  trackEvent("entrepreneur_register", {
    negocio: nombreNegocio,
    tipo: tipoEmprendimiento,
  });
}

// Eventos de búsqueda
export function trackSearch(searchTerm: string, resultCount: number) {
  trackEvent("search", {
    search_term: searchTerm,
    results_count: resultCount,
  });
}

// Eventos de interacción
export function trackButtonClick(buttonName: string, buttonLocation: string) {
  trackEvent("button_click", {
    button_name: buttonName,
    button_location: buttonLocation,
  });
}
