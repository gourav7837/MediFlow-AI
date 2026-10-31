# MediFlow AI — Intelligent Healthcare Operations Platform 🏥⚡

> **Tagline:** Smarter Clinics. Better Care. Powered by AI.  
> **Primary AI Engine:** Google Gemma 4 (`gemma4:e2b` running locally via Ollama)  
> **Frontend:** React.js, Vite, Tailwind CSS, Recharts, Lucide Icons  
> **Backend:** Node.js, Express.js, REST APIs, JSON Database with ACID file locking, Firebase Auth & Firestore  
> **Firebase Project:** `clinic-managemant-d94ff` (Live credentials configured)  

---

## 🌟 1. Product Overview

MediFlow AI is an AI-first healthcare management platform designed to automate outpatient operations through 6 integrated modules:

1. **AI Voice Receptionist ⭐ (Flagship Innovation)**: Natural speech conversation that identifies patient intent and executes real backend tool calling (availability checks, double-booking prevention, automated appointment creation, patient ID matching). Supports multilingual English, Hindi, and Hinglish.
2. **AI Patient Assistant**: Care portal enabling patients to query clinic FAQs, prep guidelines (fasting/hydration), doctor specialties, consultation charges, and automatic red-flag emergency guidance (chest pain, shortness of breath -> urgent ER advisory).
3. **AI Doctor Copilot**: Clinician assistant that synthesizes past medical history, alerts against drug allergies/contraindications, structures consultation EMR records into ICD-style JSON, and suggests investigative questions.
4. **MediScan AI — Medical Report Analyzer**: Diagnostic pathology report extractor pulling parameters, reference ranges, abnormal flags, generating plain-language patient explanations, and doctor-approved secure links.
5. **WhatsApp Automation System**: Clinic messaging gateway simulator with message templates (appointment confirmations, 24h reminders, follow-up alerts, secure lab report delivery) and live smartphone dispatch preview.
6. **Clinic Administration & Outpatient Flow**: Real-time Recharts dashboard, 6-tab patient directory with vertical chronological timeline, physician scheduling, double-booking protection, and live OPD token queues.

---

## 🏗️ 2. System & AI Agentic Architecture

```
User Voice / Speech Input
        │
        ▼ (Web Speech API / SpeechRecognition)
Speech-to-Text Transcript
        │
        ▼ POST /api/ai/voice
┌────────────────────────────────────────────────────────┐
│ Google Gemma 4 Engine (Local Ollama gemma4:e2b)        │
│ Intent Recognition & Parameter Extraction              │
└──────────────────────────────────┬─────────────────────┘
                                   │
                                   ▼ Function / Tool Selection
┌────────────────────────────────────────────────────────┐
│ Real Backend Tool Calling Engine                       │
│  • find_patient()            • get_doctor_list()       │
│  • get_available_slots()     • book_appointment()      │
│  • cancel_appointment()      • get_clinic_information │
└──────────────────────────────────┬─────────────────────┘
                                   │
                                   ▼ Database State Update
┌────────────────────────────────────────────────────────┐
│ Natural Conversational Response & Booking Confirmation │
└──────────────────────────────────┬─────────────────────┘
                                   │
                                   ▼ (window.speechSynthesis)
Browser Text-to-Speech Output Audio + Live UI Updates
```

---

## 📋 3. Core Modules & Endpoints

| Module | Core Capabilities | Backend Route |
| :--- | :--- | :--- |
| **Module 1: Authentication** | Firebase Auth Web SDK + Role-Based Access (`Admin`, `Doctor`, `Receptionist`, `Patient`) with 1-click rapid demo switch. | `POST /api/auth/verify` |
| **Module 2: Admin Dashboard** | Metrics: Total Patients, Today's Appointments, Doctors, Pending, Completed. Recharts weekly area & bar charts, doctor availability cards, voice activity feed, system audit logs. | `GET /api/dashboard/stats` |
| **Module 3: Patient Management** | Complete patient directory, search, registration modal, rich 6-tab patient profile (Overview, Medical History, Appointments, Consultations, Reports, AI Summaries) with vertical chronological timeline. | `GET /api/patients`<br>`GET /api/patients/:id`<br>`POST /api/patients` |
| **Module 4: Appointment Management** | Outpatient scheduling table, status badges, cancel/reschedule actions, and strict backend double-booking validation. | `GET /api/appointments`<br>`POST /api/appointments` |
| **Module 5: AI Voice Receptionist ⭐** | Dedicated voice console with animated microphone, audio waveform visualizer, listening/thinking/speaking state indicators, live transcript, patient identification panel, booking progress panel, and real tool execution. | `POST /api/ai/voice`<br>`POST /api/voice/session` |
| **Module 6: AI Patient Assistant** | Chat & speech portal for clinic FAQs, doctors, preparation guidance, and emergency safety guardrails. | `POST /api/ai/patient-assistant` |
| **Module 7: Clinical Copilot** | Patient history narrative summarizer, shorthand consultation note structurer, differential investigative questions. | `POST /api/ai/summarise`<br>`GET /api/doctor/intakes` |
| **Module 8: MediScan Reports** | Diagnostic pathology report extractor pulling parameters, reference ranges, abnormal flags, plain-language patient explanations, and doctor approval. | `GET /api/reports`<br>`POST /api/ai/analyse-report`<br>`PUT /api/reports/:id/approve` |
| **Module 9: WhatsApp Automation** | Gateway connection status, QR code simulator, template dispatch engine, outbox logs, live smartphone message preview. | `GET /api/whatsapp/status`<br>`GET /api/whatsapp/messages`<br>`POST /api/whatsapp/send` |
| **Module 10: Doctor Management** | Physician directory, specializations, consultation fees, room assignments, active time slots, and availability status. | `GET /api/doctors` |

---

## 🎬 4. Complete 16-Step Demonstration Script for Judges (Section 18)

Follow these exact steps during your hackathon presentation:

### Part 1: Admin & Clinic Overview
1. Open **[http://localhost:3000](http://localhost:3000)** to view the **Admin Dashboard**.
2. Point out the live metric cards (*Total Patients: 5, Today's Appointments: 2, Total Doctors: 3, Voice Sessions: 1*), the interactive Recharts appointments area chart, physician availability, and the audit logs.
3. Click **"Patients"** in the sidebar (or bottom dock). Click **"View Full Profile"** on **Rahul Sharma** to reveal the rich **6-Tab Profile Modal** (Overview, Medical History with Penicillin allergy warning, Appointments, Consultations, Medical Reports, AI Summaries, and Chronological Timeline).

### Part 2: AI Voice Receptionist ⭐ (Primary Innovation)
4. Click **"AI Voice Agent"** in the sidebar (or click the glowing blue button in the floating dock).
5. Highlight the animated microphone, the audio waveform visualizer, and the side panels (*Patient Identification* & *Appointment Booking Status*).
6. Click the central microphone button (or click the quick demo chip: *"Book appointment with Dr. Sharma tomorrow at 11 AM"*).
7. Speak or trigger: *"Hello, I want to book an appointment with Dr. Sharma for tomorrow at 11 AM. My name is Rahul Sharma."*
8. Point out:
   - Voice audio is transcribed.
   - Google Gemma 4 detects intent `book_appointment` and extracts `{ patientName: 'Rahul Sharma', doctorName: 'Dr. Sharma', time: '11:00 AM' }`.
   - The backend runs `find_patient()` and automatically populates the Patient Identification panel (*PAT-1092*).
   - The backend executes `get_available_slots()`, confirms availability, and creates the appointment.
   - The AI speaks back confirming the booking with token number and appointment ID.
9. Click **"Appointments"** in the sidebar: verify the newly booked appointment is immediately visible with status `Confirmed`!

### Part 3: AI Patient Care Assistant
10. Click **"AI Patient Assistant"** in the floating dock.
11. Click any quick prompt chip (e.g. *"What are clinic timings and doctor consultation fees?"* or *"Do I need to fast before a blood test?"*).
12. Show Gemma 4 answering accurately with the clinic's exact hours, doctor specialties, and pre-test advice.
13. Type an emergency prompt like *"I have severe chest pain and cannot breathe"*: observe the immediate **EMERGENCY WARNING** guardrail directing the patient to emergency care immediately.

### Part 4: Clinical Copilot & Shorthand EMR Structurer
14. Click **"Clinical Copilot"** in the floating dock.
15. Select patient **Rahul Sharma**, then click **"✨ Synthesize with Clinical Copilot"**:
    - Observe Gemma 4 synthesizing past medical history into a clean clinical narrative.
    - Observe the prominent **⚠️ PENICILLIN ALLERGY WARNING** alerting the physician against prescribing beta-lactam antibiotics.
    - Observe the suggested investigative differential questions generated for the doctor.
16. In the consultation notes box, notice the doctor's shorthand notes (*"101 fever, dry cough 3 days, bp normal, prescribe paracetamol"*). Click **"Structure Notes into EMR"**: watch Gemma 4 convert messy shorthand into a structured clinical prescription table!

### Part 5: MediScan AI & WhatsApp Automation
17. Click **"MediScan"** in the floating dock:
    - View the Blood Panel lab report for Sunita Verma.
    - Click **"✨ Analyze Report with Gemma 4"** to show extracted parameters (TSH, Fasting Glucose, HbA1c), reference ranges, and plain-language patient explanations.
    - Click **"Doctor Approve & Sign"** to generate a secure patient link.
18. Click **"WhatsApp"** in the floating dock:
    - View the WhatsApp gateway status and QR code simulator.
    - Select template **"Appointment Confirmation"** or **"Secure Lab Report Link"**.
    - Click **"Send WhatsApp Notification"**: observe the message entering the Outbox Logs and rendering live inside the **Smartphone Simulator Preview**!

---

## ⚡ 5. How to Run

Both servers are active:
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Local Gemma 4 AI Host**: `http://127.0.0.1:11434` (Model: `gemma4:e2b`)

To restart everything cleanly at any time:
```bash
npm run dev
```
