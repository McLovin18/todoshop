"use client";

import React from "react";
import Link from "next/link";

export default function TerminosCondicionesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium mb-4"
          >
            ← Volver al inicio
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Términos y Condiciones
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Última actualización: {new Date().toLocaleDateString("es-EC", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 space-y-8">
          {/* Introducción */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
              1. Introducción
            </h2>
            <div className="space-y-3 text-slate-700 dark:text-slate-300">
              <p>
                Bienvenido a <strong className="text-slate-900 dark:text-white">TodoMarket</strong>, la plataforma de comercio electrónico diseñada para conectar estudiantes emprendedores con la comunidad universitaria.
              </p>
              <p>
                Al utilizar nuestra plataforma, ya sea como comprador o como emprendedor, aceptas estos Términos y Condiciones. Te recomendamos leerlos cuidadosamente antes de continuar.
              </p>
              <p>
                Esta plataforma fue creada con el propósito de fomentar el emprendimiento estudiantil, proporcionando un espacio seguro y profesional para la venta de productos y servicios.
              </p>
            </div>
          </section>

          {/* Aceptación */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
              2. Aceptación de Términos
            </h2>
            <div className="space-y-3 text-slate-700 dark:text-slate-300">
              <p>
                Al usar TodoMarket, ya sea como emprendedor o como usuario, declaras que:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Tienes la capacidad legal para celebrar contratos.</li>
                <li>Has leído, entendido y aceptas estos Términos y Condiciones.</li>
                <li>Proporcionas información veraz y actualizada en tu registro.</li>
                <li>Te comprometes a cumplir con todas las normas establecidas.</li>
              </ul>
            </div>
          </section>

          {/* Responsabilidades del Emprendedor */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
              3. Responsabilidades del Emprendedor
            </h2>
            <div className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>
                Como emprendedor en TodoMarket, te comprometes a:
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">3.1 Productos y Servicios</h3>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Vender productos de calidad y en buen estado.</li>
                  <li>Describir tus productos de manera precisa y honesta.</li>
                  <li>No vender productos prohibidos, ilegales o que infrinjan derechos de autor.</li>
                  <li>Respetar los precios establecidos y no realizar prácticas engañosas.</li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">3.2 Normas de Inocuidad (Para Vendedores de Alimentos)</h3>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Preparar alimentos en condiciones higiénicas adecuadas.</li>
                  <li>Utilizar ingredientes frescos y de calidad.</li>
                  <li>Informar claramente sobre alérgenos en tus productos.</li>
                  <li>Mantener la cadena de frío cuando sea necesario.</li>
                  <li>Respetar las normas de salud locales.</li>
                </ul>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">3.3 Atención al Cliente</h3>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Responder a las consultas de los clientes en tiempo razonable.</li>
                  <li>Mantener una comunicación respetuosa y profesional.</li>
                  <li>Resolver conflictos de manera constructiva.</li>
                  <li>Honrar los compromisos de entrega acordados.</li>
                </ul>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-2">3.4 Responsabilidad sobre Productos</h3>
                <p className="text-sm">
                  El emprendedor es el único responsable de los productos que comercializa. TodoMarket no se hace responsable por la calidad, seguridad o idoneidad de los productos vendidos a través de la plataforma. Los compradores deben dirigir cualquier reclamación directamente al emprendedor correspondiente.
                </p>
              </div>
            </div>
          </section>

          {/* Responsabilidades del Comprador */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
              4. Responsabilidades del Comprador
            </h2>
            <div className="space-y-3 text-slate-700 dark:text-slate-300">
              <p>
                Como comprador en TodoMarket, te comprometes a:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Proporcionar información veraz para la entrega de productos.</li>
                <li>Realizar pagos de manera honesta y oportuna.</li>
                <li>Comunicarte de manera respetuosa con los emprendedores.</li>
                <li>No realizar compras fraudulentas o con intención de engaño.</li>
                <li>Reportar cualquier problema con el producto o servicio recibido.</li>
              </ul>
            </div>
          </section>

          {/* Prohibiciones */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
              5. Prohibiciones
            </h2>
            <div className="space-y-3 text-slate-700 dark:text-slate-300">
              <p>
                Está estrictamente prohibido:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Vender productos ilegales, peligrosos o que infrinjan la ley.</li>
                <li>Publicar contenido ofensivo, discriminatorio o inapropiado.</li>
                <li>Realizar actividades de fraude, estafa o phishing.</li>
                <li>Utilizar la plataforma para competir deslealmente.</li>
                <li>Violentar la privacidad de otros usuarios.</li>
                <li>Publicar información falsa o engañosa sobre productos.</li>
              </ul>
            </div>
          </section>

          {/* Propiedad Intelectual */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
              6. Propiedad Intelectual
            </h2>
            <div className="space-y-3 text-slate-700 dark:text-slate-300">
              <p>
                TodoMarket respeta los derechos de propiedad intelectual. Los emprendedores son responsables de asegurar que los productos que venden no infrinjan derechos de autor, marcas registradas u otros derechos de propiedad intelectual.
              </p>
              <p>
                El contenido de la plataforma (diseño, logos, textos, imágenes) es propiedad de TodoMarket y está protegido por las leyes de propiedad intelectual.
              </p>
            </div>
          </section>

          {/* Privacidad */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
              7. Privacidad y Protección de Datos
            </h2>
            <div className="space-y-3 text-slate-700 dark:text-slate-300">
              <p>
                TodoMarket se compromete a proteger la privacidad de sus usuarios. La información personal proporcionada será utilizada exclusivamente para los fines de la plataforma y no será compartida con terceros sin consentimiento, salvo cuando sea requerido por ley.
              </p>
              <p>
                Los datos de contacto de los emprendedores (email, WhatsApp) serán visibles únicamente para facilitar la comunicación con los compradores interesados en sus productos.
              </p>
            </div>
          </section>

          {/* Pagos y Transacciones */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
              8. Pagos y Transacciones
            </h2>
            <div className="space-y-3 text-slate-700 dark:text-slate-300">
              <p>
                TodoMarket actúa como intermediario para la visualización de productos. Las transacciones y pagos se realizan directamente entre el comprador y el emprendedor, generalmente a través de WhatsApp u otros medios de contacto.
              </p>
              <p>
                La plataforma no procesa pagos directamente y no se hace responsable por disputas financieras entre compradores y emprendedores.
              </p>
            </div>
          </section>

          {/* Modificaciones */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
              9. Modificaciones de los Términos
            </h2>
            <div className="space-y-3 text-slate-700 dark:text-slate-300">
              <p>
                TodoMarket se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Los cambios serán notificados a través de la plataforma y se considerarán aceptados al continuar utilizando el servicio.
              </p>
            </div>
          </section>

          {/* Suspensión y Terminación */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
              10. Suspensión y Terminación
            </h2>
            <div className="space-y-3 text-slate-700 dark:text-slate-300">
              <p>
                TodoMarket se reserva el derecho de suspender o terminar cuentas de usuarios que:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Infrinjan estos Términos y Condiciones.</li>
                <li>Realicen actividades fraudulentas o ilegales.</li>
                <li>Reciban múltiples quejas justificadas de otros usuarios.</li>
                <li>No cumplan con las normas de calidad y servicio establecidas.</li>
              </ul>
            </div>
          </section>

          {/* Limitación de Responsabilidad */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
              11. Limitación de Responsabilidad
            </h2>
            <div className="space-y-3 text-slate-700 dark:text-slate-300">
              <p>
                TodoMarket no se hace responsable por:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Daños directos o indirectos derivados del uso de la plataforma.</li>
                <li>La calidad, seguridad o idoneidad de los productos vendidos.</li>
                <li>Disputas entre compradores y emprendedores.</li>
                <li>Interrupciones del servicio por mantenimiento técnico.</li>
              </ul>
            </div>
          </section>

          {/* Contacto */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
              12. Contacto
            </h2>
            <div className="space-y-3 text-slate-700 dark:text-slate-300">
              <p>
                Para cualquier pregunta, duda o sugerencia sobre estos Términos y Condiciones, puedes contactarnos a través de:
              </p>
              <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                <p className="font-medium text-slate-900 dark:text-white">WhatsApp: +593 96 332 8168</p>
              </div>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
