import React from 'react';
import { AssessmentData, ConsultationSlot } from '../types';

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function PrintableSummary({ data, slot }: { data: AssessmentData | null; slot: ConsultationSlot | null }) {
  if (!data) return null;

  const openPrintWindow = () => {
    const html = `
      <html>
      <head>
        <title>Skin Intelligence Summary</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <style>
          :root{--text:#111;--muted:#666;--brand:#9b4d3a}
          html,body{height:100%}
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:var(--text); padding:28px; background:#fff; }
          h1 { font-family: Georgia, 'Times New Roman', serif; font-size:28px; margin:0 0 6px 0; }
          p { margin:6px 0; }
          .muted { color:var(--muted); font-size:13px }
          .section { margin-top:14px; }
          .chip { display:inline-block; padding:6px 10px; border-radius:999px; background:#f3efe9; margin:4px; font-size:13px }
          .small { font-size:13px }
          .note { margin-top:12px; font-size:13px; color:var(--brand) }
          @media print{
            body{padding:12mm}
            .chip{background:none;border:1px solid #eee}
            .no-print{display:none}
            h1{font-size:22px}
          }
        </style>
      </head>
      <body>
        <h1>Skin Intelligence Assessment™ — Summary</h1>
        <div class="muted">We don't guess. We assess. Your skin follows patterns.</div>

        <div class="section">
          <strong>Client:</strong> ${data.fullName} ${data.preferredName ? `(${data.preferredName})` : ''}<br/>
          <strong>Email:</strong> ${data.email || ''} · <strong>Phone:</strong> ${data.phoneNumber || ''}
        </div>

        <div class="section">
          <strong>Consultation:</strong> ${slot ? `${formatDate(slot.date)} — ${slot.time} (${slot.type})` : 'TBD'}
        </div>

        <div class="section">
          <strong>Investment:</strong> $125 — Intro $90
        </div>

        <div class="section">
          <strong>Core Findings</strong>
          <div class="small">Concerns:</div>
          <div>${(data.concerns || []).map(c => `<span class="chip">${c}</span>`).join('')}</div>
        </div>

        <div class="section">
          <strong>Assessment includes</strong>
          <ul class="small">
            <li>Comprehensive intake + lifestyle review</li>
            <li>Trigger analysis, barrier & pigment assessment</li>
            <li>Treatment roadmap and customized homecare</li>
            <li>1:1 virtual or in-person consultation (45–60 minutes)</li>
          </ul>
        </div>

        <div class="note">If you choose to move forward with corrective care within 7 days, receive a $25 credit toward your treatment plan.</div>

        <div style="margin-top:24px; font-size:13px; color:var(--muted)">Generated: ${new Date().toLocaleString()}</div>
      </body>
      </html>
    `;

    const w = window.open('', '_blank', 'width=800,height=900');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    setTimeout(() => { w.print(); }, 400);
  };

  return (
    <div className="mt-6">
      <button
        onClick={openPrintWindow}
        className="inline-flex items-center gap-2 bg-brand-terracotta text-white px-6 py-3 rounded-full text-[13px] uppercase tracking-widest font-bold hover:opacity-90"
      >
        Print Summary
      </button>
    </div>
  );
}
