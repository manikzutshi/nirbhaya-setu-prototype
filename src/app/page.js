import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { auth0 } from "@/lib/auth0";

export default async function Home() {
  const session = await auth0.getSession();
  const user = session?.user;
  return (
    <>
      <Navbar />
      <main className="bg-white text-gray-800">
        {user ? (
          <div className="bg-success/10 text-success px-4 py-2 text-sm text-center">Welcome back, {user.name}!</div>
        ) : (
          <div className="bg-warning/10 text-warning px-4 py-2 text-sm text-center">You are browsing as a guest.</div>
        )}
        {/* Hero Section */}
        <section className="relative bg-white overflow-hidden">
        <div className="container relative mx-auto max-w-7xl px-6">
          <div className="grid min-h-[90vh] items-center gap-12 lg:grid-cols-2">
            {/* Text Content */}
            <div className="flex flex-col items-center gap-8 pb-8 text-center lg:items-start lg:py-16 lg:text-left">
              <h1 className="flex flex-col gap-3 font-extrabold tracking-tight text-gray-900 text-4xl sm:text-5xl lg:text-6xl">
                <span>Empowering Women,</span>
                <span className="relative whitespace-nowrap">
                  <span className="mr-3 sm:mr-4 md:mr-5">Securing</span>
                  <span className="relative whitespace-nowrap">
                    <span className="absolute bg-primary -left-2 -top-1 -bottom-1 -right-2 -rotate-2 md:-left-3 md:top-0 md:bottom-0 md:-right-3"></span>
                    <span className="relative text-white">Our Communities</span>
                  </span>
                </span>
              </h1>
              
              {/* Image for Mobile */}
              <div className="block lg:hidden w-full max-w-md mx-auto py-4">
                <img
                  src="/girl.svg"
                  alt="Women safety illustration"
                  className="w-full h-auto"
                />
              </div>

              <p className="max-w-xl text-lg leading-relaxed text-gray-600 sm:my-4">
                A next-generation safety platform integrating AI, IoT sensors, and community feedback to provide real-time protection and peace of mind in public spaces.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                <a href="#features" className="btn btn-primary btn-lg">Explore Features</a>
                <a href="#impact" className="btn btn-outline btn-lg">See Impact</a>
              </div>
            </div>

            {/* Image for Desktop */}
            <div className="relative hidden lg:block">
              <img
                src="/girl.svg"
                alt="Women safety illustration"
                className="w-lg h-auto max-w-xl mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-base-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              The Data: A Crisis of Safety
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Women's safety in urban environments has reached a critical threshold. Current statistics reveal a deeply concerning pattern.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="stats shadow-lg">
              <div className="stat place-items-center">
                <div className="stat-title text-primary-content/80">Urban Women Feeling Unsafe</div>
                <div className="stat-value text-white">40%</div>
                <div className="stat-desc text-primary-content/70">According to NARI 2025 Report</div>
              </div>
            </div>

            <div className="stats shadow-lg bg-error text-error-content">
              <div className="stat place-items-center">
                <div className="stat-title text-error-content/80">Safety Drop at Night</div>
                <div className="stat-value text-white">70% → 36%</div>
                <div className="stat-desc text-error-content/70">On public transport</div>
              </div>
            </div>

            <div className="stats shadow-lg bg-warning text-warning-content">
              <div className="stat place-items-center">
                <div className="stat-title text-warning-content/80">Crime Increase</div>
                <div className="stat-value text-gray-900">12.9%</div>
                <div className="stat-desc text-warning-content/70">Between 2018-2022</div>
              </div>
            </div>

            <div className="stats shadow-lg bg-secondary text-secondary-content">
              <div className="stat place-items-center">
                <div className="stat-title text-secondary-content/80">Cases in 2022</div>
                <div className="stat-value text-white">445K+</div>
                <div className="stat-desc text-secondary-content/70">Registered cases alone</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Deficit Section */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              The Trust Deficit: Why Current Systems Fail
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M128,26A102,102,0,1,0,230,128,102.12,102.12,0,0,0,128,26Zm0,192a90,90,0,1,1,90-90A90.1,90.1,0,0,1,128,218ZM116,116V80a6,6,0,0,1,12,0v36a6,6,0,0,1-12,0Zm16,36a10,10,0,1,1-10-10A10,10,0,0,1,132,152Z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Massive Underreporting</h3>
              <div className="text-3xl font-bold text-rose-600 mb-2">1 in 3</div>
              <p className="text-gray-600">Only one-third of women who experience harassment report it to authorities.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M222,80a6,6,0,0,1-6,6H40a6,6,0,0,1,0-12H216A6,6,0,0,1,222,80Zm-6,26H40a6,6,0,0,0,0,12H216a6,6,0,0,0,0-12Zm0,32H40a6,6,0,0,0,0,12H216a6,6,0,0,0,0-12Zm0,32H40a6,6,0,0,0,0,12H216a6,6,0,0,0,0-12Zm0,32H40a6,6,0,0,0,0,12H216a6,6,0,0,0,0-12Z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Institutional Distrust</h3>
              <div className="text-3xl font-bold text-orange-600 mb-2">25%</div>
              <p className="text-gray-600">Trust that authorities will act effectively on complaints.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M128,26A102,102,0,1,0,230,128,102.12,102.12,0,0,0,128,26Zm0,192a90,90,0,1,1,90-90A90.1,90.1,0,0,1,128,218Zm38.83-101.17a6,6,0,0,1,0,8.48l-32,32a6,6,0,0,1-8.48,0l-16-16a6,6,0,0,1,8.48-8.48L128,141.51l27.76-27.76A6,6,0,0,1,166.83,116.83Z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">The Action Gap</h3>
              <div className="text-3xl font-bold text-red-600 mb-2">16%</div>
              <p className="text-gray-600">Action taken on formally registered cases.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              How Nirbhaya Setu Works
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our five-stage safety flow provides seamless protection from planning to real-time response.
            </p>
          </div>

          <div className="space-y-12">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="shrink-0 w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pre-Journey Safety Check</h3>
                <p className="text-gray-600">
                  Access AI-powered safety scores for your destination based on IoT data, real-time lighting conditions, crowd density, and aggregated reviews from local women before leaving home.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="shrink-0 w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Live Route Monitoring</h3>
                <p className="text-gray-600">
                  GPS tracking with anomaly detection identifies route deviations or unexpected stops during travel, such as when a ride-share driver takes an unfamiliar path.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="shrink-0 w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Instant Community & Authority Alerts</h3>
                <p className="text-gray-600">
                  Emergencies trigger immediate alerts to trusted contacts, nearby community guardians, and emergency services with exact live location data for rapid response.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="shrink-0 w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Smart Alert Differentiation</h3>
                <p className="text-gray-600">
                  The system distinguishes between warning stages (suspicious activity requiring caution) and distress stages (confirmed danger requiring immediate intervention).
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="shrink-0 w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                5
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Continuous Learning & Improvement</h3>
                <p className="text-gray-600">
                  Machine learning refines predictions by incorporating real-time feedback from user reviews, incident reports, and community surveys.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              Core Features: Complete Protection
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Six innovative features designed for maximum safety effectiveness and user empowerment.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="group rounded-2xl bg-white p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M226.46,60.2,195.8,29.54a14,14,0,0,0-19.8,0L152.69,52.85a6,6,0,0,0,0,8.49l42,42a6,6,0,0,0,8.49,0L226.46,80A14,14,0,0,0,226.46,60.2Zm-8.48,11.31-21.68,21.68L164.2,61.09,185.88,39.4a2,2,0,0,1,2.83,0l30.66,30.66A2,2,0,0,1,218,72.51ZM142,100.69,34,208.69a14,14,0,0,0,0,19.8L64.51,259a14,14,0,0,0,19.8,0L192.4,151H232a6,6,0,0,0,0-12H186.34l42-42a6,6,0,0,0-8.48-8.48l-42,42V76a6,6,0,0,0-12,0v42.34L90.49,42.93a6,6,0,0,0-8.48,8.48Zm-66.1,18.8L180.69,14.71a6,6,0,0,0-8.48-8.48L67.42,110.1a6,6,0,0,0,8.48,8.48ZM75.89,220.6a2,2,0,0,1-2.83,0L42.4,190.05a2,2,0,0,1,0-2.83L150.49,79.1l32.68,32.68Z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Safety Map</h3>
              <p className="text-gray-600">
                Dynamic, time-specific safety scores based on real-time lighting data, crowd density analytics, and historical incident patterns.
              </p>
            </div>

            <div className="group rounded-2xl bg-white p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M128,66a38,38,0,1,0,38,38A38,38,0,0,0,128,66Zm0,64a26,26,0,1,1,26-26A26,26,0,0,1,128,130Zm0-112a86.1,86.1,0,0,0-86,86c0,30.91,14.34,63.74,41.47,94.94a252.32,252.32,0,0,0,41.09,38,6,6,0,0,0,6.88,0,252.32,252.32,0,0,0,41.09-38c27.13-31.2,41.47-64,41.47-94.94A86.1,86.1,0,0,0,128,18Zm0,206.51C113,212.93,54,163.62,54,104a74,74,0,0,1,148,0C202,163.62,143,212.93,128,224.51Z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Hotspot Detection</h3>
              <p className="text-gray-600">
                Automatically flags high-crime areas during specific hours, empowering informed route decisions based on data.
              </p>
            </div>

            <div className="group rounded-2xl bg-white p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M230.14,70.54,185.46,25.85a20,20,0,0,0-28.29,0L33.86,149.17A19.85,19.85,0,0,0,28,163.31V208a20,20,0,0,0,20,20H92.69a19.86,19.86,0,0,0,14.14-5.86L230.14,98.82a20,20,0,0,0,0-28.28ZM91,204H52V165l84-84,39,39ZM192,103,153,64l18.34-18.34,39,39Z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Community Feedback Loop</h3>
              <p className="text-gray-600">
                Women rate and review areas in real-time, directly improving AI model accuracy and creating collective intelligence.
              </p>
            </div>

            <div className="group rounded-2xl bg-white p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M237.66,106.35l-80-80A6,6,0,0,0,148,30H40A14,14,0,0,0,26,44V156a6,6,0,0,0,10.24,4.24l33.52-33.51L108.24,165A14,14,0,0,0,118,168h88a6,6,0,0,0,6-6V54.48A6,6,0,0,0,237.66,106.35ZM38,148.24V44a2,2,0,0,1,2-2H146.34L38,150.34ZM200,156H118a2,2,0,0,1-1.41-.58L78.24,117.17,154,41.41V156Z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Intelligent Route Monitoring</h3>
              <p className="text-gray-600">
                Detects deviations from planned routes and alerts users to unexpected changes such as ride-share diversions.
              </p>
            </div>

            <div className="group rounded-2xl bg-white p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M128,26A102,102,0,1,0,230,128,102.12,102.12,0,0,0,128,26Zm0,192a90,90,0,1,1,90-90A90.1,90.1,0,0,1,128,218ZM116,116V80a6,6,0,0,1,12,0v36a6,6,0,0,1-12,0Zm16,36a10,10,0,1,1-10-10A10,10,0,0,1,132,152Z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multiple SOS Options</h3>
              <p className="text-gray-600">
                Panic button, discreet code words, and automatic triggering via wearables or biometric anomalies give users control.
              </p>
            </div>

            <div className="group rounded-2xl bg-white p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M214,80v96a14,14,0,0,1-14,14H56a14,14,0,0,1-14-14V80A14,14,0,0,1,56,66H200A14,14,0,0,1,214,80Zm-14-52H56A54.06,54.06,0,0,0,2,82v92a54.06,54.06,0,0,0,54,54H200a54.06,54.06,0,0,0,54-54V82A54.06,54.06,0,0,0,200,28Zm42,54v92a42,42,0,0,1-42,42H56a42,42,0,0,1-42-42V82A42,42,0,0,1,56,40H200A42,42,0,0,1,242,82Z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Robust IoT Integration</h3>
              <p className="text-gray-600">
                Seamless connections with smart city infrastructure, public CCTV networks, and personal safety devices for comprehensive coverage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scenarios Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              Scenarios: Safety in Action
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Real-world scenarios demonstrate how Nirbhaya Setu transforms safety outcomes.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="bg-linear-to-br from-blue-50 to-blue-100/50 rounded-2xl p-8 border border-blue-200">
              <div className="flex items-start gap-4 mb-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Planning a Safe Evening</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                A woman plans to visit a market at 9:00 PM. Nirbhaya Setu displays a low safety rating due to poor lighting and high crowd density. Reviews from local women corroborate the risk. Empowered by this data, she selects an app-suggested safe alternate route with better lighting and higher community ratings, avoiding potential danger before it occurs.
              </p>
            </div>

            <div className="bg-linear-to-br from-purple-50 to-purple-100/50 rounded-2xl p-8 border border-purple-200">
              <div className="flex items-start gap-4 mb-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Detecting a Threat</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                A woman books a ride-share cab. The driver unexpectedly diverts onto a secluded route. Nirbhaya Setu's anomaly detection immediately flags the deviation and sends a warning alert. She discreetly activates an emergency trigger using a pre-set code word. An immediate distress signal with live location streams to her guardians and the nearest police unit simultaneously.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Secure Section */}
      <section id="campus" className="py-16 sm:py-24 bg-linear-to-br from-primary/5 to-primary/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              Campus Secure: Institutional Safety Reimagined
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Transform universities with modern technology for safe, monitored, and empowered movement within campus premises.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="bg-white rounded-2xl p-8 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M128,66a38,38,0,1,0,38,38A38,38,0,0,0,128,66Zm0,64a26,26,0,1,1,26-26A26,26,0,0,1,128,130Zm0-112a86.1,86.1,0,0,0-86,86c0,30.91,14.34,63.74,41.47,94.94a252.32,252.32,0,0,0,41.09,38,6,6,0,0,0,6.88,0,252.32,252.32,0,0,0,41.09-38c27.13-31.2,41.47-64,41.47-94.94A86.1,86.1,0,0,0,128,18Zm0,206.51C113,212.93,54,163.62,54,104a74,74,0,0,1,148,0C202,163.62,143,212.93,128,224.51Z"></path>
                  </svg>
                </span>
                Smart Geofencing
              </h3>
              <p className="text-gray-600">Real-time zone mapping with automated alerts to wardens when students enter restricted areas after 6 PM.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M222,152V96a6,6,0,0,0-12,0v56a6,6,0,0,0,12,0ZM89.09,102.22,46,145.34V40a6,6,0,0,0-12,0V208a6,6,0,0,0,10.24,4.24l48-48a6,6,0,1,0-8.48-8.48L62,177.51V157.34l43.09-43.12a6,6,0,1,0-8.48-8.48ZM144,90a6,6,0,0,0-6,6v43.51L116.24,117.8a6,6,0,0,0-8.48,8.48l48,48A6,6,0,0,0,166,170V96A6,6,0,0,0,160,90Z"></path>
                  </svg>
                </span>
                Digital Permissions
              </h3>
              <p className="text-gray-600">Students apply for late passes digitally while parents receive automatic notifications of approved leave or emergencies.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M128,26A102,102,0,1,0,230,128,102.12,102.12,0,0,0,128,26Zm0,192a90,90,0,1,1,90-90A90.1,90.1,0,0,1,128,218ZM116,116V80a6,6,0,0,1,12,0v36a6,6,0,0,1-12,0Zm16,36a10,10,0,1,1-10-10A10,10,0,0,1,132,152Z"></path>
                  </svg>
                </span>
                Panic System
              </h3>
              <p className="text-gray-600">One-button SOS escalates immediately to warden and campus security with live location data for coordinated response.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M214,80v96a14,14,0,0,1-14,14H56a14,14,0,0,1-14-14V80A14,14,0,0,1,56,66H200A14,14,0,0,1,214,80Z"></path>
                  </svg>
                </span>
                Unified Dashboard
              </h3>
              <p className="text-gray-600">Wardens integrate biometric check-ins with live location and geofence alerts in one comprehensive safety interface.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              Impact: Measurable Change for Safer Communities
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Creating profound, multi-faceted impact on individual safety, community well-being, and urban development.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="bg-white rounded-2xl p-8 shadow-md border-l-4 border-primary">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Empowerment & Control</h3>
              <p className="text-gray-600">
                Real-time awareness and practical tools enable women to take control of personal safety decisions based on actionable data.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-md border-l-4 border-secondary">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Crime Prevention</h3>
              <p className="text-gray-600">
                Early detection and prevention of dangerous situations deters crime through visible technology presence and rapid response capabilities.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-md border-l-4 border-accent">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Trusted Ecosystem</h3>
              <p className="text-gray-600">
                Community-driven platform where users actively contribute to collective safety intelligence, building social cohesion and mutual protection.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-md border-l-4 border-success">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Global Alignment</h3>
              <p className="text-gray-600">
                Directly supports UN SDG 5 and contributes to smarter, safer urban environments that attract investment and talent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section id="contact" className="py-20 bg-linear-to-br from-primary to-primary/80 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-6">
            Our Vision
          </h2>
          <p className="text-2xl sm:text-3xl font-bold mb-8">
            "Every woman can move anywhere, anytime, without fear."
          </p>
          <p className="text-lg sm:text-xl text-primary-content/90 max-w-3xl mx-auto mb-12">
            Nirbhaya Setu represents a real-time women safety ecosystem powered by artificial intelligence, IoT connectivity, and community trust. By transforming public spaces into secure environments and empowering women with technology and information, we create communities where safety is not a luxury but a fundamental right.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#features" className="btn btn-white text-primary btn-lg">
              Explore Platform
            </a>
            <a href="#impact" className="btn btn-outline border-white text-white hover:bg-white hover:text-primary btn-lg">
              See Our Impact
            </a>
          </div>
        </div>
      </section>
      </main>
      <Footer />
    </>
  );
}
