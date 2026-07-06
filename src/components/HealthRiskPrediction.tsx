import React from 'react';

export default function HealthRiskPrediction() {
  const backToMenu = () => {
    if (window && window.history && window.dispatchEvent) {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new Event('navigate'));
      try { window.scrollTo(0, 0); } catch (e) {}
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'linear-gradient(to bottom right,#f8fafc,#eef2ff)'}}>
      <div style={{ maxWidth: 720, width: '100%', background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 8px 30px rgba(2,6,23,0.08)', textAlign: 'center' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>B-Max AI — Health Insights</h1>
        <p style={{ color: '#475569', marginBottom: 18 }}>This feature integrates with the external B-Max AI JotForm. Use the button below to open the integration or return to the main menu.</p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={backToMenu} style={{ padding: '10px 18px', borderRadius: 12, background: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer' }}>Back to Menu</button>
          <a href="https://www.jotform.com/app/253583637449470" target="_blank" rel="noreferrer" style={{ padding: '10px 18px', borderRadius: 12, background: '#7c3aed', color: 'white', textDecoration: 'none' }}>Open B-Max AI</a>
        </div>
      </div>
    </div>
  );
}
