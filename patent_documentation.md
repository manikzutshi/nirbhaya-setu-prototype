# Patent Documentation: Nirbhaya Setu

Title of Invention: Nirbhaya Setu: An AI-Integrated, Community-Driven Real-Time Safety and Incident Response System for Women.
Deployment URL: http://nirbhaya-setu.vercel.app/

---

## 1. Field of the Invention

The present invention relates to the field of Personal Safety Technology and Smart Urban Infrastructure. It specifically utilizes:
- Artificial Intelligence (AI) for predictive safety scoring.
- Internet of Things (IoT) for real-time environmental monitoring.
- Geo-Spatial Analytics for proactive risk assessment and emergency response.

## 2. Background of the Invention

Women's safety in urban environments is a critical global issue backed by alarming data.

### 2.1 The Data (NARI 2025 Report)
- 40% of urban women report feeling "not so safe" or "unsafe" in their daily environments.
- The "Nightly Drop": Safety perception dramatically falls from 70% during the day to just 36% at night.
- Rising Crime: Crimes against women increased 12.9% between 2018-2022.

### 2.2 Systemic Failures in Existing Solutions
- Underreporting: Only 1 in 3 harassment incidents are reported.
- Institutional Distrust: Only 25% of women trust authorities to act effectively.
- Reactive Limitations: Current market solutions (e.g., standard panic buttons) are purely reactive, activating only after a threat is realized.

The Problem: There is an absence of a preventative ecosystem that combines environmental data (lighting, crowd) with community intelligence to help women avoid danger before it occurs.

## 3. Summary of the Invention

Nirbhaya Setu is a decentralized, 5-stage safety platform that empowers women through actionable intelligence and rapid response.

### The 5-Stage Safety Flow
1.  Pre-Journey Check: AI-predicted safety scores considering lighting, crowds, and community reviews.
2.  Live Route Monitoring: GPS tracking with Anomaly Detection for ride-share deviations.
3.  Instant Alerts: Multi-channel alerts to "Community Guardians" and authorities.
4.  Smart Alert Differentiation: Distinguishing between Warning (Yellow) and Distress (Red) stages.
5.  Continuous Learning: Feedback loops from post-journey reviews refine the risk models.

### Campus Secure Module
A specialized module for educational institutions that replaces physical lockdowns with:
- Digital Permissions
- Geofenced Safety Monitoring
- Automated Parental Notifications

## 4. Detailed Description of the Invention

The invention is described in two phases: the currently functional prototype and the final target ecosystem.

### 4.1 Phase 1: Current Prototype (Web-Based)
The current functional prototype demonstrates the core logic and AI integration.

- Platform: Web Application (PWA ready).
- Frontend Stack: Next.js v16, React v19, TailwindCSS.
- AI Engine: Google Gemini (1.5 Pro/Flash) acts as the "Safety Concierge", analyzing route data/queries to provide non-fearmongering advice.
- Identity Management: Auth0 for secure authentication.
- Data Integration: Custom ingestion scripts (ingest_crime_csv.js) normalize external datasets (e.g., Delhi Crime Data).
- Cloud Infrastructure: Deployed on Vercel with MongoDB (Storage) and Firebase (Real-time alerts).

### 4.2 Phase 2: Final Target System (5-Layer Stack)
The full patent claims extend to the complete ecosystem architecture:

1.  Mobile Layer: Native Android/iOS (Kotlin/Swift) or Flutter for deep sensor access (biometrics, background GPS).
2.  Intelligence Layer: Python/TensorFlow analytics for real-time dynamic safety scoring.
3.  Data Collection Layer: Aggregates signals from GPS, BLE, Wi-Fi, 5G, and IoT Wearables (Smart necklaces, pendants).
4.  Infrastructure Layer: Scalable cloud (AWS/GCP) using Time-Series databases.
5.  Alert & Response Layer: Redundant notification pipelines (FCM, SMS, Voice APIs) ensuring 99.99% reliability.

## 5. Key Innovative Features

### A. AI-Powered Safety Score
A dynamic score (0-100) calculated using:
- Historical Data: Crime frequency.
- Real-time IoT: Functional street lighting status, crowd density.
- Temporal Weighting: Risks adjusted for specific times (e.g., safe at 2 PM is not equal to safe at 9 PM).
- Community Feedback: Real-time validation from user reviews.

### B. Intelligent Route Monitoring (Anomaly Detection)
Algorithms detect deviations such as traffic-independent stops or route changes.
Scenario: If a cab driver diverts to a secluded route, the system triggers a warning. If not dismissed, a Distress Signal is auto-broadcasted.

### C. Campus Secure Module
- Smart Geofencing: Alerts wardens only if students enter restricted zones after curfew hours.
- Digital Permissions: Replaces paper "late passes" with app-based approvals.
- Unified Dashboard: Security staff view live locations only during active SOS or violations.

## 6. Competitive Landscape & Differentiation

Existing solutions are fragmented. Nirbhaya Setu differentiates via Ecosystem Integration.

| Feature             | Nirbhaya Setu        | My Safetipin  | bSafe        | Rave Guardian | Life360    |
|---------------------|----------------------|---------------|--------------|---------------|------------|
| AI Safety Score     | Advanced (Real-time) | Basic         | No           | No            | No         |
| Community Feedback  | Real-time Loop       | Limited       | No           | No            | No         |
| Anomaly Detection   | Cab/Route Deviation  | No            | No           | No            | No         |
| Campus Module       | Integrated           | No            | No           | Campus-Only   | No         |
| IoT/Wearable Ready  | Yes                  | No            | No           | No            | GPS Only   |

Key Differentiator: While others offer point solutions, Nirbhaya Setu synthesizes Prediction (AI), Prevention (Community/IoT), and Response (SOS) into a single platform.

## 7. Commercial Application (Business Model)

1.  B2B SaaS (Campus Secure): Licensing the platform to Universities and Colleges to modernize security and reduce liability.
2.  B2C Hardware: Direct sales of "Nirbhaya Setu-ready" IoT wearables (pendants, smart jewelry).
3.  Branding: Co-branded safety apparel and self-defense tools.

## 8. Hardships & Challenges Faced

- Data Normalization: Cleaning consistent formatting from diverse crime datasets (e.g., Delhi Police data) to make them machine-readable.
- AI "Hallucinations": Tuning Gemini prompts to prevent the AI from fabricating statistics while maintaining helpfulness.
- Latency Optimization: Ensuring SOS alerts travel from Client to Cloud to Guardian in sub-seconds using WebSockets/Firebase.
- Dependency Management: Integrating bleeding-edge Next.js 16 with established mapping libraries required complex build configurations.

## 9. Claims (Draft)

1.  A system for calculating a real-time hyper-local safety score, comprising a processor configured to aggregate historical crime data, real-time community sentiment, and environmental sensor data (lighting/crowd).
2.  The method of Claim 1, wherein the safety score is dynamically adjusted based on time-of-day specific risk factors ("Temporal Relevance").
3.  An autonomous anomaly detection module that triggers graduated alert levels (Warning vs. SOS) based on deviation distance from a pre-calculated safe route or unexpected velocity changes.
4.  A campus safety management system comprising dynamic geofencing that activates monitoring only during specific temporal windows (e.g., post-curfew), ensuring privacy during safe hours.
