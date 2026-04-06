import { Link } from "react-router-dom";
import { ArrowRight, Code2, Heart, Rocket, Shield, Users, Zap } from "lucide-react";
const TEAM_VALUES = [
    {
        icon: Code2,
        title: "Developer-First by Design",
        body: "Every decision we make starts with one question: does this make a developer's life easier? From our API design to our dashboard UX, we obsess over the details so you don't have to.",
        color: "#06b6d4",
    },
    {
        icon: Shield,
        title: "Security Without Compromise",
        body: "We believe you shouldn't have to choose between convenience and security. Hardware binding, real-time session monitoring, and tamper-proof audit logs are built in from day one.",
        color: "#a78bfa",
    },
    {
        icon: Rocket,
        title: "Ship Fast, Stay Confident",
        body: "Licensing infrastructure shouldn't slow you down. With sub-10ms API responses and a zero-config getting-started experience, you can protect your software before your coffee gets cold.",
        color: "#34d399",
    },
    {
        icon: Heart,
        title: "Built by Developers, for Developers",
        body: "We've been in your shoes — spending weekends debugging licensing bugs instead of building features. LicenseAdmin exists because we wanted a tool we'd actually enjoy using ourselves.",
        color: "#f472b6",
    },
];
const STATS = [
    { value: "10k+", label: "Developers Empowered" },
    { value: "50M+", label: "API Calls Served" },
    { value: "99.9%", label: "Uptime SLA" },
    { value: "<10ms", label: "Avg. Response Time" },
];
export default function AboutPage() {
    return (<div className="min-h-screen overflow-x-hidden" style={{
            background: "#050d1a",
            color: "#e2e8f0",
            fontFamily: "'Inter', system-ui, sans-serif",
        }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up   { animation: fadeUp 0.65s ease both; }
        .fade-up-1 { animation: fadeUp 0.65s ease 0.1s both; }
        .fade-up-2 { animation: fadeUp 0.65s ease 0.2s both; }
        .fade-up-3 { animation: fadeUp 0.65s ease 0.3s both; }
        .value-card:hover { transform: translateY(-5px); border-color: rgba(6,182,212,0.25) !important; }
        .value-card { transition: all 0.3s ease; }
      `}</style>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-8 py-4 sticky top-0 z-50" style={{
            background: "rgba(5,13,26,0.9)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(16px)",
        }}>
        <Link to="/landing" className="text-lg font-bold flex items-center gap-1.5">
          <span style={{ color: "#06b6d4" }}>◆</span>
          <span style={{ color: "#f1f5f9" }}>License</span>
          <span style={{ color: "#06b6d4" }}>Admin</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/docs" className="text-sm transition-colors hover:text-white" style={{ color: "#94a3b8" }}>Docs</Link>
          <Link to="/landing#pricing" className="text-sm transition-colors hover:text-white" style={{ color: "#94a3b8" }}>Pricing</Link>
          <Link to="/login" className="text-sm px-5 py-2 rounded-xl font-semibold transition-all duration-200 hover:scale-105" style={{
            background: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
            color: "#fff",
            boxShadow: "0 4px 16px rgba(6,182,212,0.3)",
        }}>
            Sign In
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative py-28 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(6,182,212,0.09) 0%, transparent 70%)" }}/>
        <p className="fade-up text-sm font-semibold mb-4 tracking-widest" style={{ color: "#06b6d4" }}>
          ABOUT US
        </p>
        <h1 className="fade-up-1 font-black mb-6 mx-auto leading-tight" style={{
            fontSize: "clamp(2.4rem, 5vw, 4.5rem)",
            maxWidth: 780,
            background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 45%, #22d3ee 85%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
        }}>
          We exist to empower every developer who ships software
        </h1>
        <p className="fade-up-2 text-lg mx-auto mb-10 leading-relaxed" style={{ color: "#64748b", maxWidth: 640 }}>
          LicenseAdmin was born from frustration — and a firm belief that protecting your software
          should be as simple as shipping it. We're a team of engineers who got tired of duct-taping
          together licensing solutions, so we built the platform we always wished existed.
        </p>
        <Link to="/login" className="fade-up-3 inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-semibold text-base transition-all duration-300 hover:scale-105" style={{
            background: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
            color: "#fff",
            boxShadow: "0 8px 32px rgba(6,182,212,0.35)",
        }}>
          Start building free <ArrowRight className="h-4 w-4"/>
        </Link>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (<div key={s.label} className="text-center rounded-2xl py-8 px-4" style={{
                background: "#0a1628",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "6px 6px 16px rgba(0,0,0,0.4), -3px -3px 10px rgba(255,255,255,0.03)",
            }}>
              <p className="font-black mb-1" style={{
                fontSize: "2.2rem",
                background: "linear-gradient(135deg, #06b6d4, #a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
            }}>
                {s.value}
              </p>
              <p className="text-xs font-medium" style={{ color: "#64748b" }}>{s.label}</p>
            </div>))}
        </div>
      </section>

      {/* ── Story ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 max-w-3xl mx-auto">
        <p className="text-sm font-semibold mb-4" style={{ color: "#a78bfa" }}>OUR STORY</p>
        <h2 className="font-bold mb-6" style={{
            fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
            background: "linear-gradient(135deg, #f0f9ff, #94a3b8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
        }}>
          Tired of licensing being the hardest part of shipping
        </h2>
        <div className="space-y-5 text-base leading-relaxed" style={{ color: "#94a3b8" }}>
          <p>
            It started the way most good tools do — out of genuine pain. Our founding team had spent
            years building desktop software and SaaS products, and every single time, licensing was
            the part we dreaded most. Off-the-shelf solutions were either too expensive, too rigid,
            or so complex they needed their own documentation.
          </p>
          <p>
            So in 2023, we started from scratch. We asked: <em style={{ color: "#e2e8f0" }}>what would a licensing
            platform look like if developers, not enterprise sales teams, designed it?</em> The
            answer was LicenseAdmin — a platform with a clean API you can call in minutes, a
            dashboard that actually shows you what matters, and pricing that doesn't punish you for
            growing.
          </p>
          <p>
            Today, thousands of developers across the globe use LicenseAdmin to protect their
            work — from solo indie hackers shipping their first paid app to agencies managing
            licensing for dozens of clients. We're proud of every single one of them.
          </p>
        </div>
      </section>

      {/* ── Values ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold mb-3" style={{ color: "#34d399" }}>WHAT WE BELIEVE</p>
          <h2 className="font-bold" style={{
            fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
            background: "linear-gradient(135deg, #f0f9ff, #94a3b8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
        }}>
            Our values aren't a poster on the wall
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {TEAM_VALUES.map((v) => (<div key={v.title} className="value-card rounded-2xl p-6" style={{
                background: "#0a1628",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "6px 6px 16px rgba(0,0,0,0.4), -3px -3px 10px rgba(255,255,255,0.03)",
            }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{
                background: `${v.color}18`,
                border: `1px solid ${v.color}30`,
            }}>
                <v.icon className="h-5 w-5" style={{ color: v.color }}/>
              </div>
              <h3 className="text-base font-semibold mb-2" style={{ color: "#f1f5f9" }}>{v.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{v.body}</p>
            </div>))}
        </div>
      </section>

      {/* ── Mission statement ───────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto rounded-3xl p-12 text-center relative overflow-hidden" style={{
            background: "linear-gradient(135deg, #0a1628 0%, #0f1f3a 100%)",
            border: "1px solid rgba(6,182,212,0.2)",
            boxShadow: "0 0 80px rgba(6,182,212,0.06), 0 32px 64px rgba(0,0,0,0.5)",
        }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 0%, rgba(6,182,212,0.1) 0%, transparent 65%)" }}/>
          <Users className="h-10 w-10 mx-auto mb-5 relative z-10" style={{ color: "#06b6d4" }}/>
          <blockquote className="font-semibold mb-4 relative z-10 leading-relaxed" style={{
            fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)",
            color: "#f1f5f9",
            fontStyle: "italic",
        }}>
            "Our mission is simple: take the tedium out of software licensing so developers can
            spend their time on what actually matters — building things people love."
          </blockquote>
          <p className="text-sm relative z-10" style={{ color: "#475569" }}>
            — The LicenseAdmin Team
          </p>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 text-center">
        <h2 className="font-black mb-4" style={{
            fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
            background: "linear-gradient(135deg, #ffffff, #22d3ee)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
        }}>
          Ready to join thousands of developers?
        </h2>
        <p className="text-base mb-8" style={{ color: "#64748b" }}>
          Get started for free. No credit card, no commitment — just great licensing infrastructure.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/login" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-semibold text-base transition-all duration-300 hover:scale-105" style={{
            background: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
            color: "#fff",
            boxShadow: "0 8px 32px rgba(6,182,212,0.35)",
        }}>
            Get started free <ArrowRight className="h-4 w-4"/>
          </Link>
          <Link to="/docs" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-semibold text-base transition-all duration-200 hover:scale-105" style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#e2e8f0",
        }}>
            <Zap className="h-4 w-4" style={{ color: "#a78bfa" }}/>
            Read the docs
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="text-center py-8 text-xs" style={{ color: "#334155", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        © {new Date().getFullYear()} LicenseAdmin. Built with precision for developers who care.
      </footer>
    </div>);
}
