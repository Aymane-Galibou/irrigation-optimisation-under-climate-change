import Navbar from "@/components/ui/Navbar";
import Link from "next/link";


const imageLink='/bg.avif'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section with Full-Screen Background Image */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-950 pt-16">
          {/* Background Image Layer */}
          <div 
            className={`absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105`}
            style={{ backgroundImage: `url('${imageLink}')` }}
            aria-hidden="true"
          />
          {/* High-Contrast Dark Overlay Gradients */}
          <div className="absolute inset-0 bg-linear-to-b from-zinc-950/80 via-zinc-950/50 to-zinc-100/25" />
          <div className="absolute inset-0 bg-linear-to-r from-zinc-950/70 via-transparent to-transparent" />

          {/* Hero Content Container */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-20">
            <div className="max-w-3xl text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-400 bg-emerald-950/60 backdrop-blur-md border border-emerald-500/30 rounded-full mb-6">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                AI & Generative Climate Orchestration
              </span>
              <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-none mb-6 drop-shadow-sm">
                Optimize water resources with <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-teal-300">Surrogate Modeling</span>
              </h1>
              <p className="text-lg text-zinc-300 mb-8 max-w-2xl leading-relaxed drop-shadow">
                Connect your crop simulation models to global climate projections to accurately predict field water deficits 7 days in advance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard" className="inline-flex items-center justify-center px-6 py-3 font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] gap-2">
                  Launch Live Stream Simulation
                </Link>
                <a href="#features" className="inline-flex items-center justify-center px-6 py-3 font-semibold text-zinc-300 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 rounded-xl transition-all">
                  Explore Architecture
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-zinc-50 border-t border-zinc-200/50 relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-zinc-900 sm:text-4xl tracking-tight">End-to-End Precision Infrastructure</h2>
              <p className="mt-4 text-zinc-600">Preserve every single drop of water using deep learning coupled with advanced soil physics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-2xl border border-zinc-200/60 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">Surrogate Deep Networks</h3>
                <p className="text-zinc-600 text-sm leading-relaxed">Replace heavy biophysical scripts with instant-inference PyTorch neural network blocks trained on 22+ years of localized climate records.</p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-2xl border border-zinc-200/60 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 114 0v2m6 0V5a2 2 0 10-4 0v2m0 0h4" /></svg>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">Kafka Streaming Pipelines</h3>
                <p className="text-zinc-600 text-sm leading-relaxed">Real-time data orchestration pulling from field IoT nodes directly into the preprocessing pipelines with zero overhead.</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-2xl border border-zinc-200/60 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14 12a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">NASA CMIP6 Integrations</h3>
                <p className="text-zinc-600 text-sm leading-relaxed">Direct downscaled linkages with global atmospheric forecasts to evaluate future heatwaves and regional evapotranspiration trends.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}