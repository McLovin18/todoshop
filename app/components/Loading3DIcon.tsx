"use client";
 
import React from "react";
 
const loaderStyles = `
  @keyframes cl-fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cl-fill {
    0%   { opacity: 0.12; transform: scaleY(0.4); }
    35%  { opacity: 1;    transform: scaleY(1); }
    100% { opacity: 0.12; transform: scaleY(0.4); }
  }
  @keyframes cl-pulseDot { 0%,100%{opacity:0.3} 50%{opacity:1} }
  @keyframes cl-sweep {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(220%); }
  }
 
  .cl-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
    background: #0B0E14;
    animation: cl-fadeIn 0.4s ease forwards;
  }
 
  .cl-grid {
    position: relative;
    display: grid;
    grid-template-columns: repeat(6, 10px);
    gap: 6px;
    width: fit-content;
    overflow: hidden;
  }
 
  .cl-cell {
    width: 10px;
    height: 34px;
    border-radius: 2px;
    background: #5B8DEF;
    transform-origin: bottom;
    animation: cl-fill 1.6s ease-in-out infinite;
  }
 
  .cl-cell:nth-child(6n+2),
  .cl-cell:nth-child(6n+5) {
    background: #FFB13C;
  }
 
  .cl-cell:nth-child(1) { animation-delay: 0s; }
  .cl-cell:nth-child(2) { animation-delay: 0.08s; }
  .cl-cell:nth-child(3) { animation-delay: 0.16s; }
  .cl-cell:nth-child(4) { animation-delay: 0.24s; }
  .cl-cell:nth-child(5) { animation-delay: 0.32s; }
  .cl-cell:nth-child(6) { animation-delay: 0.4s; }
  .cl-cell:nth-child(7) { animation-delay: 0.08s; }
  .cl-cell:nth-child(8) { animation-delay: 0.16s; }
  .cl-cell:nth-child(9) { animation-delay: 0.24s; }
  .cl-cell:nth-child(10) { animation-delay: 0.32s; }
  .cl-cell:nth-child(11) { animation-delay: 0.4s; }
  .cl-cell:nth-child(12) { animation-delay: 0.48s; }
 
  .cl-sweep {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
    width: 40%;
    animation: cl-sweep 2.2s ease-in-out infinite;
    pointer-events: none;
  }
 
  .cl-label-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-top: 22px;
  }
 
  .cl-brand {
    font-family: "Space Grotesk", "Inter", system-ui, sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #E4E7EC;
  }
 
  .cl-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #5B8DEF;
    animation: cl-pulseDot 1.2s ease infinite;
  }
 
  .cl-sub {
    margin-top: 6px;
    font-family: "JetBrains Mono", "SFMono-Regular", Menlo, monospace;
    font-size: 10.5px;
    letter-spacing: 0.06em;
    color: #6B7280;
  }
 
  .cl-sub span {
    color: #FFB13C;
  }
`;
 
export function Loading3DIcon() {
  return (
    <>
      <style>{loaderStyles}</style>
      <div className="cl-wrap">
        <div className="cl-grid" aria-label="Cargando...">
          <div className="cl-sweep" aria-hidden="true" />
          {Array.from({ length: 12 }).map((_, i) => (
            <div className="cl-cell" key={i} />
          ))}
        </div>
 
        <div className="cl-label-row">
          <span className="cl-brand">todoShop</span>
          <span className="cl-dot" aria-hidden="true" />
        </div>
        <p className="cl-sub">
          Arreglando espacio <span>para tus compras</span>...
        </p>
      </div>
    </>
  );
}