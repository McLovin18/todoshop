"use client";

import React from "react";

const loaderStyles = `
  @keyframes bl-spin { to { transform: rotate(360deg); } }
  @keyframes bl-bounce { 0%,100%{transform:translateY(0)} 33%{transform:translateY(-6px)} }
  @keyframes bl-shimmer { 0%,100%{opacity:0.7} 50%{opacity:1} }
  @keyframes bl-fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  .bl-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
    animation: bl-fadeIn 0.4s ease forwards;
    select-none: none;
  }

  .bl-rings {
    position: relative;
    width: 100px;
    height: 100px;
  }

  .bl-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 5px solid transparent;
    animation: bl-spin linear infinite;
  }

  .bl-r1 { border-top-color: #FF6B6B; border-right-color: #FF6B6B; animation-duration: 1.2s; }
  .bl-r2 { inset: 8px;  border-top-color: #FF9F43; border-right-color: #FF9F43; animation-duration: 1.5s; }
  .bl-r3 { inset: 16px; border-top-color: #FECA57; border-right-color: #FECA57; animation-duration: 1.8s; }
  .bl-r4 { inset: 24px; border-top-color: #48DBFB; border-right-color: #48DBFB; animation-duration: 2.1s; animation-direction: reverse; }
  .bl-r5 { inset: 32px; border-top-color: #A29BFE; border-right-color: #A29BFE; animation-duration: 1.4s; }

  .bl-center {
    position: absolute;
    inset: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #FFD6E0, #C7ECEE);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    animation: bl-shimmer 2s ease infinite;
  }

  .bl-dots {
    display: flex;
    gap: 7px;
    margin-top: 18px;
  }

  .bl-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    animation: bl-bounce 1.2s ease infinite;
  }

  .bl-dot:nth-child(1) { background: #FF6B6B; animation-delay: 0s; }
  .bl-dot:nth-child(2) { background: #FECA57; animation-delay: 0.2s; }
  .bl-dot:nth-child(3) { background: #48DBFB; animation-delay: 0.4s; }

  .bl-text {
    margin-top: 16px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: #888;
    text-align: center;
  }

  .bl-sub {
    margin-top: 4px;
    font-size: 11px;
    color: #aaa;
    letter-spacing: 0.08em;
    animation: bl-shimmer 2.5s ease infinite;
  }
`;

export function Loading3DIcon() {
  return (
    <>
      <style>{loaderStyles}</style>
      <div className="bl-wrap">
        <div className="bl-rings" aria-label="Cargando...">
          <div className="bl-ring bl-r1" />
          <div className="bl-ring bl-r2" />
          <div className="bl-ring bl-r3" />
          <div className="bl-ring bl-r4" />
          <div className="bl-ring bl-r5" />
          <div className="bl-center">🌈</div>
        </div>

        <div className="bl-dots" aria-hidden="true">
          <div className="bl-dot" />
          <div className="bl-dot" />
          <div className="bl-dot" />
        </div>

        <p className="bl-text">Vistiendo a tu pequeño</p>
        <p className="bl-sub">Cargando ropa para bebé...</p>
      </div>
    </>
  );
}