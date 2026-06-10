import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Vershante Lynn Skin Intelligence API" });
  });

  // Contact Us Submission
  app.post("/api/contact", async (req, res) => {
    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not configured.");
      return res.status(500).json({ success: false, error: "Email service not configured on host." });
    }

    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, error: "All clinical fields are required." });
    }

    try {
      const { Resend } = await import('resend');
      const resend = new Resend(RESEND_API_KEY);

      const { data, error } = await resend.emails.send({
        from: 'Vershante Lynn Website <onboarding@resend.dev>', // Using verified resend domain for testing/default
        to: ['antoinetteqwilliams@gmail.com'], 
        replyTo: email,
        subject: `[Inquiry] ${subject} - ${name}`,
        html: `
          <div style="font-family: 'Inter', sans-serif; color: #2C3E50; max-width: 600px; margin: 0 auto; background-color: #FDFCF9; padding: 40px; border: 1px solid #E8E2D9; border-radius: 20px;">
            <p style="text-transform: uppercase; font-size: 10px; letter-spacing: 0.2em; color: #D3866E; font-weight: bold; margin-bottom: 20px;">New Website Inquiry</p>
            <h1 style="font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 24px; color: #4A5D4E; border-bottom: 2px solid #E8E2D9; padding-bottom: 15px;">New Synchronized Message</h1>
            
            <div style="margin: 25px 0;">
              <p style="font-size: 14px; margin: 5px 0;"><strong>Sender:</strong> ${name}</p>
              <p style="font-size: 14px; margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="font-size: 14px; margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
            </div>

            <div style="background-color: #f4f1ea; padding: 25px; border-radius: 12px; border-left: 4px solid #4A5D4E; margin-top: 20px;">
              <p style="white-space: pre-wrap; margin: 0; font-size: 15px; line-height: 1.6; color: #4A5D4E;">${message}</p>
            </div>

            <div style="margin-top: 40px; border-top: 1px solid #E8E2D9; padding-top: 20px; text-align: center;">
              <p style="font-size: 11px; color: #4A5D4E; opacity: 0.5;">Automated Clinical Transmission Protocol</p>
            </div>
          </div>
        `
      });

      if (error) {
        console.error("Resend API Error:", error);
        return res.status(500).json({ success: false, error: "Communication failure at gateway." });
      }

      res.status(200).json({ success: true, data });
    } catch (err) {
      console.error("Contact API Server Error:", err);
      res.status(500).json({ success: false, error: "Internal clinical server error." });
    }
  });

  // Send Confirmation Email
  app.post("/api/send-confirmation", async (req, res) => {
    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not configured.");
      return res.status(200).json({ success: true, message: "Email not sent: RESEND_API_KEY missing" });
    }

    const { email, fullName, bookingDetails, insightsSummary, clinicalFocus, summaryData } = req.body;

    try {
      const { Resend } = await import('resend');
      const resend = new Resend(RESEND_API_KEY);

      // Build a compact HTML summary for PDF generation
      const summaryHtml = `
        <html>
        <head>
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <style>
            body{font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial; color:#222; padding:24px}
            h1{font-family: 'Cormorant Garamond', serif; font-size:24px; margin:0 0 6px}
            p{margin:6px 0}
            .muted{color:#666;font-size:13px}
            .chip{display:inline-block;padding:6px 10px;border-radius:999px;background:#f3efe9;margin:4px;font-size:13px}
          </style>
        </head>
        <body>
          <h1>Skin Intelligence Assessment™ — Summary</h1>
          <div class="muted">We don't guess. We assess. Your skin follows patterns.</div>
          <div style="margin-top:12px">
            <strong>Client:</strong> ${summaryData?.fullName || fullName} ${summaryData?.preferredName ? `(${summaryData.preferredName})` : ''}<br/>
            <strong>Email:</strong> ${summaryData?.email || email} · <strong>Phone:</strong> ${summaryData?.phoneNumber || ''}
          </div>
          <div style="margin-top:10px"><strong>Consultation:</strong> ${bookingDetails.date} — ${bookingDetails.time} (${bookingDetails.type})</div>
          <div style="margin-top:10px"><strong>Investment:</strong> $125 — Intro $90</div>
          <div style="margin-top:14px"><strong>Concerns:</strong><div>${(summaryData?.concerns || clinicalFocus || []).map((c: string) => `<span class="chip">${c}</span>`).join('')}</div></div>
          <div style="margin-top:14px"><strong>Preliminary Insight</strong><p style="font-style:italic">${insightsSummary?.analysis || ''}</p></div>
          <div style="margin-top:14px;font-size:13px;color:#9b4d3a">If you move forward with corrective care within 7 days, receive a $25 credit toward your treatment plan.</div>
        </body>
        </html>
      `;

      // Generate PDF from HTML using Puppeteer for higher-fidelity rendering
      let pdfBase64 = null;
      try {
        const puppeteer = await import('puppeteer');
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(summaryHtml, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' } });
        await browser.close();
        pdfBase64 = Buffer.from(pdfBuffer).toString('base64');
      } catch (pdfErr) {
        console.warn('Puppeteer PDF generation failed or not available:', pdfErr?.message || pdfErr);
      }

      const emailPayload: any = {
        from: 'Vershante Lynn <onboarding@resend.dev>',
        to: [email],
        bcc: ['antoinetteqwilliams@gmail.com'],
        subject: `Your Skin Intelligence Protocol: ${fullName}`,
        html: `
          <div style="font-family: 'Inter', sans-serif; color: #2C3E50; max-width: 600px; margin: 0 auto; background-color: #FDFCF9; padding: 40px; border: 1px solid #E8E2D9; border-radius: 20px;">
            <h1 style="font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 32px; color: #4A5D4E; border-bottom: 2px solid #D3866E; padding-bottom: 10px;">Vershante Lynn Skin Intelligence</h1>
            <p style="font-size: 16px; line-height: 1.6;">Hello ${fullName},</p>
            <p style="font-size: 16px; line-height: 1.6;">Your skin diagnostic has been logged. We are preparing for our deep-dive into your biological flow and clinical patterns.</p>
            <div style="background-color: #2C3E50; color: white; padding: 25px; border-radius: 15px; margin: 30px 0;">
              <h2 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 20px; color: #D3866E;">Confirmed Consultation</h2>
              <p style="font-size: 24px; font-family: 'Cormorant Garamond', serif; font-style: italic; margin: 5px 0;">${bookingDetails.date}</p>
              <p style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.7);">${bookingDetails.time} — ${bookingDetails.type} Session</p>
            </div>
            <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; color: #4A5D4E; margin-top: 30px;">Preliminary Clinical Insights</h3>
            <p style="font-size: 14px; font-style: italic; color: #4A5D4E; padding-left: 15px; border-left: 2px solid #E8E2D9;">"${insightsSummary?.analysis || ''}"</p>
            <div style="margin-top: 20px;"><p style="font-size: 10px; text-transform: uppercase; color: #D3866E;">Primary Focus Areas</p><p style="font-size: 12px; color: #2C3E50;">${clinicalFocus.join(', ')}</p></div>
            <div style="margin-top: 40px; border-top: 1px solid #E8E2D9; pt: 20px; text-align: center;"><p style="font-size: 12px; color: #4A5D4E; opacity: 0.6;">Clinically Trained Esthetician | Skin Intelligence Assessments</p></div>
          </div>
        `
      };

      if (pdfBase64) {
        emailPayload.attachments = [
          {
            filename: 'Skin-Intelligence-Summary.pdf',
            data: pdfBase64,
            type: 'application/pdf'
          }
        ];
      }

      const { data, error } = await resend.emails.send(emailPayload);
        from: 'Vershante Lynn <onboarding@resend.dev>',
        to: [email],
        bcc: ['antoinetteqwilliams@gmail.com'],
        subject: `Your Skin Intelligence Protocol: ${fullName}`,
        html: `
          <div style="font-family: 'Inter', sans-serif; color: #2C3E50; max-width: 600px; margin: 0 auto; background-color: #FDFCF9; padding: 40px; border: 1px solid #E8E2D9; border-radius: 20px;">
            <h1 style="font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 32px; color: #4A5D4E; border-bottom: 2px solid #D3866E; padding-bottom: 10px;">Vershante Lynn Skin Intelligence</h1>
            
            <p style="font-size: 16px; line-height: 1.6;">Hello ${fullName},</p>
            <p style="font-size: 16px; line-height: 1.6;">Your skin diagnostic has been logged. We are preparing for our deep-dive into your biological flow and clinical patterns.</p>
            
            <div style="background-color: #2C3E50; color: white; padding: 25px; border-radius: 15px; margin: 30px 0;">
              <h2 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 20px; color: #D3866E;">Confirmed Consultation</h2>
              <p style="font-size: 24px; font-family: 'Cormorant Garamond', serif; font-style: italic; margin: 5px 0;">${bookingDetails.date}</p>
              <p style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.7);">${bookingDetails.time} — ${bookingDetails.type} Session</p>
            </div>

            <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; color: #4A5D4E; margin-top: 30px;">Preliminary Clinical Insights</h3>
            <p style="font-size: 14px; font-style: italic; color: #4A5D4E; padding-left: 15px; border-left: 2px solid #E8E2D9;">"${insightsSummary.analysis}"</p>
            
            <div style="margin-top: 20px;">
              <p style="font-size: 10px; text-transform: uppercase; font-bold; color: #D3866E;">Primary Focus Areas</p>
              <p style="font-size: 12px; color: #2C3E50;">${clinicalFocus.join(', ')}</p>
            </div>

            <div style="margin-top: 40px; border-top: 1px solid #E8E2D9; pt: 20px; text-align: center;">
              <p style="font-size: 12px; color: #4A5D4E; opacity: 0.6;">Clinically Trained Esthetician | Skin Intelligence Assessments</p>
            </div>
          </div>
        `
      });

      if (error) {
        console.error("Resend Error:", error);
        return res.status(500).json({ success: false, error: "Failed to send email" });
      }

      res.status(200).json({ success: true, data });
    } catch (err) {
      console.error("Server Email Error:", err);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // Appointment Update / Reminder Notification
  app.post("/api/send-appointment-update", async (req, res) => {
    if (!RESEND_API_KEY) return res.status(200).json({ success: true });

    const { email, fullName, bookingDetails, type = 'update' } = req.body;
    const isReminder = type === 'reminder';

    try {
      const { Resend } = await import('resend');
      const resend = new Resend(RESEND_API_KEY);

      await resend.emails.send({
        from: 'Vershante Lynn <onboarding@resend.dev>',
        to: [email],
        bcc: ['antoinetteqwilliams@gmail.com'],
        subject: isReminder 
          ? `Reminder: Your Skin Intelligence Session: ${fullName}`
          : `Appointment Update: Your Session with Vershante Lynn`,
        html: `
          <div style="font-family: 'Inter', sans-serif; color: #2C3E50; max-width: 600px; margin: 0 auto; background-color: #FDFCF9; padding: 40px; border: 1px solid #E8E2D9; border-radius: 20px;">
            <p style="text-transform: uppercase; font-size: 10px; letter-spacing: 0.2em; color: #D3866E; font-weight: bold; margin-bottom: 20px;">
              ${isReminder ? 'Clinical Reminder' : 'Protocol Update'}
            </p>
            <h1 style="font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 28px; color: #4A5D4E;">Hello ${fullName},</h1>
            
            <p style="font-size: 15px; line-height: 1.6; color: #4A5D4E;">
              ${isReminder 
                ? 'This is a preliminary reminder for our upcoming deep-dive into your biological flow and clinical skin patterns.'
                : 'Your clinical consultation details have been updated in the intelligence log.'}
            </p>
            
            <div style="background-color: #2C3E50; color: white; padding: 25px; border-radius: 15px; margin: 30px 0;">
              <h2 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 15px; color: #D3866E;">Updated Consultation Window</h2>
              <p style="font-size: 22px; font-family: 'Cormorant Garamond', serif; font-style: italic; margin: 5px 0;">${bookingDetails.date}</p>
              <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.7);">${bookingDetails.time} — ${bookingDetails.type} Session</p>
            </div>

            <p style="font-size: 13px; color: #4A5D4E; margin-top: 30px; font-style: italic;">
              "The most impactful clinical work begins with preparation. See you soon."
            </p>

            <div style="margin-top: 40px; border-top: 1px solid #E8E2D9; pt: 20px;">
              <p style="font-size: 11px; color: #4A5D4E; opacity: 0.6; text-align: center;">Clinically Trained Esthetician | Skin Intelligence</p>
            </div>
          </div>
        `
      });

      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false });
    }
  });

  // Admin Invite Email
  app.post("/api/send-admin-invite", async (req, res) => {
    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not configured.");
      return res.status(200).json({ success: true, message: "Email not sent: RESEND_API_KEY missing" });
    }

    const { email, role } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "Email is required." });

    const roleLabel = role === 'professional' ? 'Clinical Professional'
      : role === 'specialist' ? 'Specialist'
      : 'Administrator';

    try {
      const { Resend } = await import('resend');
      const resend = new Resend(RESEND_API_KEY);

      const { data, error } = await resend.emails.send({
        from: 'Vershante Lynn <onboarding@resend.dev>',
        to: [email],
        subject: `You've been granted clinical dashboard access — Vershante Lynn`,
        html: `
          <div style="font-family: 'Inter', sans-serif; color: #2C3E50; max-width: 600px; margin: 0 auto; background-color: #FDFCF9; padding: 40px; border: 1px solid #E8E2D9; border-radius: 20px;">
            <p style="text-transform: uppercase; font-size: 10px; letter-spacing: 0.2em; color: #D3866E; font-weight: bold; margin-bottom: 20px;">Clinical Access Granted</p>
            <h1 style="font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 28px; color: #4A5D4E; border-bottom: 2px solid #E8E2D9; padding-bottom: 12px;">Welcome to the Team</h1>

            <p style="font-size: 15px; line-height: 1.7; color: #2C3E50; margin-top: 24px;">
              You have been granted <strong>${roleLabel}</strong> access to the Vershante Lynn Clinical Skincare dashboard.
            </p>

            <div style="background-color: #4A5D4E; color: white; padding: 24px; border-radius: 14px; margin: 28px 0;">
              <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #D3866E; margin-bottom: 6px;">Your Access Level</p>
              <p style="font-size: 20px; font-family: 'Cormorant Garamond', serif; font-style: italic; margin: 4px 0;">${roleLabel}</p>
              <p style="font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 6px;">Login with: ${email}</p>
            </div>

            <p style="font-size: 14px; line-height: 1.6; color: #4A5D4E;">
              To access the dashboard, visit the site and click <strong>Dashboard</strong> in the navigation. Sign in with this email address.
            </p>

            <p style="font-size: 14px; line-height: 1.6; color: #4A5D4E; margin-top: 16px;">
              If you don't yet have a password, use the <em>Forgot password?</em> link on the login screen to set one up.
            </p>

            <div style="margin-top: 40px; border-top: 1px solid #E8E2D9; padding-top: 20px; text-align: center;">
              <p style="font-size: 11px; color: #4A5D4E; opacity: 0.5;">Vershante Lynn Clinical Skincare · Confidential Access Notification</p>
            </div>
          </div>
        `
      });

      if (error) {
        console.error("Admin invite email error:", error);
        return res.status(500).json({ success: false, error: "Failed to send invite email." });
      }

      res.status(200).json({ success: true, data });
    } catch (err) {
      console.error("Admin invite server error:", err);
      res.status(500).json({ success: false, error: "Internal server error." });
    }
  });

  // AI Clinical Analysis Endpoint
  app.post("/api/analyze-skin", async (req, res) => {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not configured in host environment.");
      return res.status(500).json({ 
        success: false, 
        error: "AI Engine not configured on host. Please ensure GEMINI_API_KEY is present." 
      });
    }

    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ success: false, error: "Assessment data is required." });
    }

    try {
      const { GoogleGenAI, Type } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

      const concernsStr = Array.isArray(data.concerns) ? data.concerns.join(", ") : "None";
      const focusAreasStr = Array.isArray(data.clinicalFocus) ? data.clinicalFocus.join(", ") : "General Diagnostic";
      const dietStr = Array.isArray(data.dietaryProfile) ? data.dietaryProfile.join(", ") : "Standard";

      const prompt = `
        As a clinically trained esthetician with an eclectic background, analyze this skin intelligence assessment data and provide preliminary clinical insights.
        
        PATIENT DATA:
        - Name: ${data.fullName || "Anonymous"}
        - Age: ${data.age || "N/A"}
        - Concerns: ${concernsStr}
        - Clinical Focus Areas: ${focusAreasStr}
        - Hormonal Stage: ${data.hormonalStage || "Standard"}
        - Stress Level: ${data.stressLevel ?? 5}/10
        - Sleep: ${data.sleepQuality || "Average"}
        - Hydration: ${data.waterIntake || "Standard"}
        - Activity: ${data.activityLevel || "Moderate"}
        - Caffeine: ${data.caffeineIntake || "Moderate"}
        - Diet: ${dietStr}
        - Investment Preference: ${data.investmentPreference || "Hybrid Flow"}
        - Primary Intent: ${data.primaryIntent || "General Improvement"}
        - Professional History: ${data.professionalHistory || "None"}
        - Current Protocol: ${data.currentRoutine || "None"}

        Analyze the relationship between their clinical focus and their biological flow (hormones, stress, caffeine, activity).
        Provide solutions (behavioral or routine-based) and specific types of products (ingredients or categories) that would benefit them.
        
        IMPORTANT: Focus on the "Clinical Focus" areas requested.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              analysis: {
                type: Type.STRING,
                description: "A summary of the patterns identifying how their lifestyle/biology affects their skin."
              },
              solutions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Practical clinical solutions or behavioral adjustments."
              },
              recommendedProducts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Recommended product categories or specific active ingredients."
              },
              confidenceScore: {
                type: Type.NUMBER,
                description: "A number from 0 to 100 representing the clinical alignment of the data."
              }
            },
            required: ["analysis", "solutions", "recommendedProducts", "confidenceScore"]
          }
        }
      });

      const jsonText = response.text || "{}";
      res.status(200).json({ success: true, insights: JSON.parse(jsonText.trim()) });
    } catch (err) {
      console.error("Gemini API Server Error:", err);
      res.status(500).json({ success: false, error: "Clinical AI failure." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
