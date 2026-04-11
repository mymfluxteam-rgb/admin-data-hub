import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Shield, Zap, Globe, Users, BarChart3, Key, CheckCircle2, ArrowRight, ChevronRight, Star, Check, } from "lucide-react";
function FloatingShape({ size, top, left, delay, color, shape, }) {
    const shapeStyles = {
        circle: { borderRadius: "50%" },
        square: { borderRadius: "12px", transform: "rotate(45deg)" },
        triangle: { clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)", borderRadius: 0 },
        hex: { clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)", borderRadius: 0 },
    };
    return (<div className="absolute pointer-events-none" style={{
            width: size, height: size, top, left,
            animation: `float ${4 + delay}s ease-in-out ${delay * 0.4}s infinite alternate`,
            opacity: 0.12 + (delay % 3) * 0.06,
            background: color,
            filter: "blur(1px)",
            ...shapeStyles[shape],
        }}/>);
}
function MicroInteractionButtons() {
    const [clicked, setClicked] = useState(false);
    const [hovering, setHovering] = useState(false);
    const handleClick = () => {
        setClicked(true);
        setTimeout(() => setClicked(false), 1800);
    };
    return (<div className="flex flex-col sm:flex-row items-center gap-6 justify-center py-2">
      <div className="flex flex-col items-center gap-2">
        <button className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200" style={{
            background: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
            color: "#fff",
            boxShadow: "4px 4px 10px rgba(0,0,0,0.3), -2px -2px 6px rgba(255,255,255,0.06)",
        }}>
          Normal
        </button>
        <span className="text-xs text-slate-400 font-mono">default</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <button className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)} style={{
            background: hovering
                ? "linear-gradient(135deg, #38bdf8, #22d3ee)"
                : "linear-gradient(135deg, #0ea5e9, #06b6d4)",
            color: "#fff",
            transform: hovering ? "scale(1.07) translateY(-2px)" : "scale(1)",
            boxShadow: hovering
                ? "0 0 24px rgba(14,165,233,0.55), 4px 4px 12px rgba(0,0,0,0.35), -2px -2px 8px rgba(255,255,255,0.08)"
                : "4px 4px 10px rgba(0,0,0,0.3), -2px -2px 6px rgba(255,255,255,0.06)",
        }}>
          Hover
        </button>
        <span className="text-xs text-slate-400 font-mono">:hover — glow + scale</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <button className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2" onClick={handleClick} style={{
            background: clicked
                ? "linear-gradient(135deg, #10b981, #059669)"
                : "linear-gradient(135deg, #0ea5e9, #06b6d4)",
            color: "#fff",
            transform: clicked ? "scale(0.97)" : "scale(1)",
            boxShadow: clicked
                ? "0 0 20px rgba(16,185,129,0.5), inset 2px 2px 6px rgba(0,0,0,0.2)"
                : "4px 4px 10px rgba(0,0,0,0.3), -2px -2px 6px rgba(255,255,255,0.06)",
        }}>
          {clicked ? <CheckCircle2 className="h-4 w-4"/> : null}
          {clicked ? "Done!" : "Click me"}
        </button>
        <span className="text-xs text-slate-400 font-mono">:active — ✓ transform</span>
      </div>
    </div>);
}
function SkeletonCard() {
    return (<div className="rounded-2xl p-5 space-y-3 w-full max-w-xs mx-auto" style={{
            background: "#0f1929",
            boxShadow: "6px 6px 16px rgba(0,0,0,0.45), -3px -3px 10px rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
        }}>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full skeleton-shimmer"/>
        <div className="space-y-2 flex-1">
          <div className="h-3 w-24 rounded skeleton-shimmer"/>
          <div className="h-2.5 w-16 rounded skeleton-shimmer"/>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-2.5 w-full rounded skeleton-shimmer"/>
        <div className="h-2.5 w-4/5 rounded skeleton-shimmer"/>
        <div className="h-2.5 w-3/5 rounded skeleton-shimmer"/>
      </div>
      <div className="flex gap-2 pt-1">
        <div className="h-7 w-20 rounded-lg skeleton-shimmer"/>
        <div className="h-7 w-16 rounded-lg skeleton-shimmer"/>
      </div>
    </div>);
}
function ParallaxCard({ children, depth, className, }) {
    const ref = useRef(null);
    const [offset, setOffset] = useState(0);
    useEffect(() => {
        const handleScroll = () => {
            if (!ref.current)
                return;
            const rect = ref.current.getBoundingClientRect();
            const center = rect.top + rect.height / 2 - window.innerHeight / 2;
            setOffset(center * depth * 0.04);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [depth]);
    return (<div ref={ref} className={className} style={{ transform: `translateY(${offset}px)`, transition: "transform 0.1s linear" }}>
      {children}
    </div>);
}
const FEATURES = [
    {
        icon: Shield,
        title: "Enterprise Security",
        desc: "Hardware-bound licensing with HWID locking, device fingerprinting, and real-time session monitoring.",
        color: "#06b6d4",
    },
    {
        icon: Zap,
        title: "Lightning Fast API",
        desc: "Sub-10ms response times. RESTful API with rate limiting, versioning, and granular key management.",
        color: "#a78bfa",
    },
    {
        icon: Globe,
        title: "Global CDN Ready",
        desc: "Deploy in 30+ regions. Your users get the fastest possible experience wherever they are.",
        color: "#34d399",
    },
    {
        icon: Users,
        title: "User Lifecycle",
        desc: "Full user management — roles, credits, expiry, suspensions, and two-factor authentication.",
        color: "#f59e0b",
    },
    {
        icon: BarChart3,
        title: "Analytics & Audit",
        desc: "Real-time dashboards, revenue trends, API call heatmaps, and full tamper-proof audit logs.",
        color: "#f472b6",
    },
    {
        icon: Key,
        title: "Smart Licensing",
        desc: "Flexible credit-based or subscription billing with automatic deduction and expiry policies.",
        color: "#0ea5e9",
    },
];
const TESTIMONIALS = [
    {
        name: "Alex Morgan",
        role: "CTO, NovaSoft",
        text: "LicenseAdmin replaced three separate tools for us. The HWID binding alone saved us thousands in lost revenue.",
        stars: 5,
    },
    {
        name: "Priya Kaur",
        role: "Engineering Lead, DataVault",
        text: "The API is clean and well-documented. We integrated it in a weekend and haven't looked back.",
        stars: 5,
    },
    {
        name: "Marco Vitali",
        role: "Founder, Pixelworks Studio",
        text: "Outstanding admin panel. The audit logs and session tracking give us full visibility into everything.",
        stars: 5,
    },
];
// ─── Pricing data ─────────────────────────────────────────────────────────────
const PLANS = [
    {
        name: "Tester",
        tagline: "Perfect for testing and small projects",
        monthlyPrice: null,
        annualPrice: null,
        priceLabel: "Free",
        subLabel: "forever",
        features: [
            "Up to 10 licensed users",
            "1 application",
            "Basic HWID locking",
            "Community support",
            "Public API access",
        ],
        btnLabel: "Get Started Free",
        btnStyle: {
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#e2e8f0",
        },
        btnHoverStyle: {
            background: "rgba(255,255,255,0.12)",
        },
        popular: false,
        accent: null,
    },
    {
        name: "Developer",
        tagline: "For indie devs shipping real products",
        monthlyPrice: 2.99,
        annualPrice: 14.99,
        priceLabel: null,
        subLabel: null,
        features: [
            "Unlimited licensed users",
            "5 applications",
            "Advanced HWID locking",
            "Credit-based billing",
            "Priority email support",
        ],
        btnLabel: "Start Developer Plan",
        btnStyle: {
            background: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
            color: "#fff",
            boxShadow: "0 6px 24px rgba(6,182,212,0.4)",
        },
        btnHoverStyle: {
            background: "linear-gradient(135deg, #38bdf8, #22d3ee)",
            boxShadow: "0 8px 32px rgba(6,182,212,0.55)",
        },
        popular: true,
        accent: "#06b6d4",
    },
    {
        name: "Seller",
        tagline: "For businesses, resellers, and larger projects",
        monthlyPrice: 4.99,
        annualPrice: 24.99,
        priceLabel: null,
        subLabel: null,
        features: [
            "Unlimited everything",
            "Unlimited applications",
            "White-label dashboard",
            "Analytics & audit logs",
            "Dedicated support + SLA",
        ],
        btnLabel: "Start Seller Plan",
        btnStyle: {
            background: "linear-gradient(135deg, #a855f7, #ec4899)",
            color: "#fff",
            boxShadow: "0 6px 24px rgba(168,85,247,0.4)",
        },
        btnHoverStyle: {
            background: "linear-gradient(135deg, #c084fc, #f472b6)",
            boxShadow: "0 8px 32px rgba(168,85,247,0.55)",
        },
        popular: false,
        accent: "#a855f7",
    },
];
function PricingSection() {
    const [annual, setAnnual] = useState(false);
    const [hoveredBtn, setHoveredBtn] = useState(null);
    return (<section id="pricing" className="py-24 px-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-sm font-semibold mb-3" style={{ color: "#a78bfa" }}>PRICING</p>
        <h2 className="font-bold mb-4" style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            background: "linear-gradient(135deg, #f0f9ff, #94a3b8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
        }}>
          Simple, transparent pricing
        </h2>
        <p className="text-base max-w-xl mx-auto mb-10" style={{ color: "#64748b" }}>
          Start free, scale as you grow. No hidden fees, no surprises.
        </p>

        {/* Monthly / Annual toggle */}
        <div className="inline-flex items-center gap-4">
          <span className="text-sm font-medium" style={{ color: annual ? "#475569" : "#e2e8f0", transition: "color 0.2s" }}>
            Monthly
          </span>

          <button onClick={() => setAnnual(!annual)} className="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none" style={{
            background: annual
                ? "linear-gradient(135deg, #a855f7, #ec4899)"
                : "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.15)",
        }} aria-label="Toggle billing period">
            <span className="absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300" style={{ transform: annual ? "translateX(28px)" : "translateX(0)" }}/>
          </button>

          <span className="text-sm font-medium flex items-center gap-2" style={{ color: annual ? "#e2e8f0" : "#475569", transition: "color 0.2s" }}>
            Annual
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{
            background: "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.2))",
            border: "1px solid rgba(168,85,247,0.35)",
            color: "#c084fc",
        }}>
              Save 50%
            </span>
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {PLANS.map((plan, i) => {
            const isPopular = plan.popular;
            const price = plan.priceLabel
                ? plan.priceLabel
                : annual
                    ? `$${plan.annualPrice}`
                    : `$${plan.monthlyPrice}`;
            const period = plan.priceLabel
                ? plan.subLabel
                : annual
                    ? "/ year"
                    : "/ month";
            return (<div key={plan.name} className="relative flex flex-col rounded-2xl p-7 transition-all duration-300" style={{
                    background: isPopular ? "linear-gradient(160deg, #0c1e38 0%, #0a1628 100%)" : "#0a1628",
                    border: isPopular
                        ? "1px solid rgba(6,182,212,0.45)"
                        : "1px solid rgba(255,255,255,0.07)",
                    boxShadow: isPopular
                        ? "0 0 40px rgba(6,182,212,0.15), 0 24px 48px rgba(0,0,0,0.5)"
                        : "6px 6px 16px rgba(0,0,0,0.4), -3px -3px 10px rgba(255,255,255,0.03)",
                    transform: isPopular ? "scale(1.04)" : "scale(1)",
                }}>
              {/* Popular badge */}
              {isPopular && (<div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap" style={{
                        background: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
                        color: "#fff",
                        boxShadow: "0 4px 16px rgba(6,182,212,0.4)",
                    }}>
                  ★ Most Popular
                </div>)}

              {/* Plan name & tagline */}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1.5" style={{ color: plan.accent ?? "#f1f5f9" }}>
                  {plan.name}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
                  {plan.tagline}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-end gap-1.5">
                  <span className="font-black leading-none" style={{
                    fontSize: plan.priceLabel ? "2.8rem" : "3rem",
                    color: plan.accent ?? "#f1f5f9",
                }}>
                    {price}
                  </span>
                  {period && (<span className="text-sm mb-1.5 font-medium" style={{ color: "#475569" }}>
                      {period}
                    </span>)}
                </div>
                {!plan.priceLabel && annual && (<p className="text-xs mt-1.5" style={{ color: "#475569" }}>
                    ~${(plan.annualPrice / 12).toFixed(2)} / month billed annually
                  </p>)}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (<li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: "#94a3b8" }}>
                    <Check className="h-4 w-4 shrink-0 mt-0.5" style={{ color: plan.accent ?? "#34d399" }}/>
                    {f}
                  </li>))}
              </ul>

              {/* CTA button */}
              <Link to="/login" className="block text-center py-3 rounded-xl text-sm font-semibold transition-all duration-200" style={{
                    ...(hoveredBtn === i ? { ...plan.btnStyle, ...plan.btnHoverStyle } : plan.btnStyle),
                    transform: hoveredBtn === i ? "translateY(-1px)" : "translateY(0)",
                }} onMouseEnter={() => setHoveredBtn(i)} onMouseLeave={() => setHoveredBtn(null)}>
                {plan.btnLabel}
              </Link>
            </div>);
        })}
      </div>

      {/* Small reassurance note */}
      <p className="text-center text-xs mt-10" style={{ color: "#334155" }}>
        No credit card required to get started. Cancel anytime.
      </p>
    </section>);
}
export default function LandingPage() {
    const [scrollY, setScrollY] = useState(0);
    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    return (<div className="min-h-screen overflow-x-hidden" style={{
            background: "#050d1a",
            color: "#e2e8f0",
            fontFamily: "'Inter', system-ui, sans-serif",
        }}>
      <style>{`
        @keyframes float {
          from { transform: translateY(0px) rotate(0deg); }
          to   { transform: translateY(-28px) rotate(8deg); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1; }
        }
        .skeleton-shimmer {
          background: linear-gradient(90deg, #1a2740 25%, #243350 50%, #1a2740 75%);
          background-size: 800px 100%;
          animation: shimmer 1.6s ease-in-out infinite;
        }
        .fade-up { animation: fadeUp 0.7s ease both; }
        .fade-up-d1 { animation: fadeUp 0.7s ease 0.1s both; }
        .fade-up-d2 { animation: fadeUp 0.7s ease 0.2s both; }
        .fade-up-d3 { animation: fadeUp 0.7s ease 0.3s both; }
        .fade-up-d4 { animation: fadeUp 0.7s ease 0.4s both; }
        .glow-cyan {
          box-shadow: 0 0 40px rgba(6,182,212,0.18), 0 0 80px rgba(6,182,212,0.08);
        }
        .feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.5), 0 0 24px rgba(6,182,212,0.12);
          border-color: rgba(6,182,212,0.25) !important;
        }
        .feature-card { transition: all 0.3s ease; }
        .nav-blur { backdrop-filter: blur(16px); }
      `}</style>

      {/* ─── NAV ─── */}
      <nav className="nav-blur fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4" style={{
            background: scrollY > 30 ? "rgba(5,13,26,0.92)" : "transparent",
            borderBottom: scrollY > 30 ? "1px solid rgba(255,255,255,0.06)" : "none",
            transition: "background 0.3s ease, border 0.3s ease",
        }}>
        <div className="flex items-center gap-2 text-lg font-bold">
          <span style={{ color: "#06b6d4" }}>◆</span>
          <span>License</span>
          <span style={{ color: "#06b6d4" }}>Admin</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: "#94a3b8" }}>
          {[
            { label: "Features", href: "#features", internal: false },
            { label: "Pricing", href: "#pricing", internal: false },
            { label: "Docs", href: "/docs", internal: true },
            { label: "About", href: "/about", internal: true },
        ].map((item) => item.internal ? (<Link key={item.label} to={item.href} className="transition-colors duration-200 hover:text-white">
                {item.label}
              </Link>) : (<a key={item.label} href={item.href} className="transition-colors duration-200 hover:text-white">
                {item.label}
              </a>))}
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm px-4 py-2 rounded-lg transition-colors duration-200" style={{ color: "#94a3b8" }}>
            Sign in
          </Link>
          <Link to="/login" className="text-sm px-5 py-2 rounded-xl font-semibold transition-all duration-200 hover:scale-105" style={{
            background: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
            color: "#fff",
            boxShadow: "0 4px 16px rgba(6,182,212,0.3)",
        }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden">
        {/* Floating geometric shapes */}
        <FloatingShape size={120} top="8%" left="5%" delay={0} color="linear-gradient(135deg,#06b6d4,#0ea5e9)" shape="circle"/>
        <FloatingShape size={80} top="15%" left="85%" delay={1.2} color="linear-gradient(135deg,#a78bfa,#7c3aed)" shape="square"/>
        <FloatingShape size={60} top="65%" left="8%" delay={2} color="linear-gradient(135deg,#34d399,#059669)" shape="triangle"/>
        <FloatingShape size={100} top="70%" left="88%" delay={0.8} color="linear-gradient(135deg,#f472b6,#db2777)" shape="hex"/>
        <FloatingShape size={50} top="30%" left="75%" delay={1.8} color="linear-gradient(135deg,#fbbf24,#f59e0b)" shape="circle"/>
        <FloatingShape size={70} top="80%" left="50%" delay={0.5} color="linear-gradient(135deg,#06b6d4,#0ea5e9)" shape="square"/>
        <FloatingShape size={90} top="20%" left="40%" delay={2.5} color="linear-gradient(135deg,#a78bfa,#6366f1)" shape="hex"/>
        <FloatingShape size={45} top="55%" left="28%" delay={1.5} color="linear-gradient(135deg,#34d399,#10b981)" shape="circle"/>

        {/* Radial glow behind hero text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{
            width: 700,
            height: 700,
            background: "radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)",
            animation: "glow-pulse 4s ease-in-out infinite",
        }}/>

        {/* Badge */}
        <div className="fade-up inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full mb-6" style={{
            background: "rgba(6,182,212,0.12)",
            border: "1px solid rgba(6,182,212,0.3)",
            color: "#22d3ee",
        }}>
          <Zap className="h-3 w-3"/> Now in public beta — free forever for small teams
        </div>

        {/* Headline */}
        <h1 className="fade-up-d1 font-black tracking-tight leading-[1.05] mb-6" style={{
            fontSize: "clamp(2.8rem, 6vw, 5.5rem)",
            background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 40%, #22d3ee 80%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            maxWidth: 860,
        }}>
          License Management
          <br />
          <span style={{
            background: "linear-gradient(135deg, #06b6d4, #a78bfa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
        }}>
            Reimagined.
          </span>
        </h1>

        <p className="fade-up-d2 text-lg mb-10 max-w-2xl leading-relaxed" style={{ color: "#94a3b8" }}>
          A complete SaaS platform for software licensing — hardware binding, credit billing,
          real-time analytics, and a powerful API. Built for teams that take security seriously.
        </p>

        <div className="fade-up-d3 flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link to="/login" className="group flex items-center gap-2 px-8 py-3.5 rounded-2xl font-semibold text-base transition-all duration-300 hover:scale-105" style={{
            background: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
            color: "#fff",
            boxShadow: "0 8px 32px rgba(6,182,212,0.35)",
        }}>
            Start for free
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"/>
          </Link>
          <a href="#features" className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-semibold text-base transition-all duration-200 hover:scale-105" style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#e2e8f0",
            boxShadow: "4px 4px 12px rgba(0,0,0,0.3), -2px -2px 6px rgba(255,255,255,0.04)",
        }}>
            Explore features
            <ChevronRight className="h-4 w-4"/>
          </a>
        </div>

        {/* Hero dashboard preview */}
        <div className="fade-up-d4 mt-16 w-full max-w-4xl mx-auto rounded-2xl overflow-hidden relative" style={{
            border: "1px solid rgba(6,182,212,0.2)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 80px rgba(6,182,212,0.08)",
            transform: `translateY(${scrollY * -0.06}px)`,
            transition: "transform 0.05s linear",
        }}>
          <div className="absolute inset-0 pointer-events-none z-10" style={{ background: "linear-gradient(to bottom, transparent 70%, #050d1a 100%)" }}/>
          <div style={{
            background: "#0a1628",
            padding: "20px 24px 0",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-3 w-3 rounded-full" style={{ background: "#ef4444" }}/>
              <div className="h-3 w-3 rounded-full" style={{ background: "#f59e0b" }}/>
              <div className="h-3 w-3 rounded-full" style={{ background: "#10b981" }}/>
              <div className="ml-4 flex-1 h-6 rounded-md text-xs flex items-center px-3" style={{ background: "rgba(255,255,255,0.05)", color: "#64748b" }}>
                app.licenseadmin.io/dashboard
              </div>
            </div>
          </div>
          <div style={{ background: "#0a1628", padding: "24px" }}>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
            { label: "Total Users", val: "12,482", color: "#06b6d4" },
            { label: "Active", val: "9,341", color: "#10b981" },
            { label: "Revenue", val: "$48,210", color: "#a78bfa" },
            { label: "API Calls", val: "2.1M", color: "#f59e0b" },
        ].map((stat) => (<div key={stat.label} className="rounded-xl p-4" style={{
                background: "#0f1929",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "4px 4px 10px rgba(0,0,0,0.3), -2px -2px 6px rgba(255,255,255,0.03)",
            }}>
                  <p className="text-xs mb-1" style={{ color: "#64748b" }}>{stat.label}</p>
                  <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.val}</p>
                </div>))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[0, 1].map((i) => (<div key={i} className="rounded-xl p-4 h-28" style={{
                background: "#0f1929",
                border: "1px solid rgba(255,255,255,0.06)",
            }}>
                  <div className="h-2.5 w-24 rounded skeleton-shimmer mb-3"/>
                  <div className="flex items-end gap-1 h-14">
                    {Array.from({ length: 14 }).map((_, j) => (<div key={j} className="flex-1 rounded-t" style={{
                    height: `${20 + Math.sin(j * 0.8 + i) * 30 + Math.random() * 20}%`,
                    background: i === 0
                        ? `rgba(6,182,212,${0.3 + (j % 3) * 0.15})`
                        : `rgba(167,139,250,${0.3 + (j % 3) * 0.15})`,
                }}/>))}
                  </div>
                </div>))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <ParallaxCard depth={-1}>
            <p className="text-sm font-semibold mb-3" style={{ color: "#06b6d4" }}>EVERYTHING YOU NEED</p>
            <h2 className="font-bold mb-4" style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            background: "linear-gradient(135deg, #f0f9ff, #94a3b8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
        }}>
              Built for the modern SaaS stack
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: "#64748b" }}>
              From first API call to enterprise scale — every feature you need is included, configured, and ready.
            </p>
          </ParallaxCard>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (<ParallaxCard key={f.title} depth={i % 3 === 1 ? -0.8 : i % 3 === 0 ? -0.4 : -1.2}>
              <div className="feature-card rounded-2xl p-6 h-full cursor-pointer" style={{
                background: "#0a1628",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "6px 6px 16px rgba(0,0,0,0.4), -3px -3px 10px rgba(255,255,255,0.03)",
            }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{
                background: `${f.color}18`,
                border: `1px solid ${f.color}30`,
                boxShadow: `0 0 16px ${f.color}20`,
            }}>
                  <f.icon className="h-5 w-5" style={{ color: f.color }}/>
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ color: "#f1f5f9" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{f.desc}</p>
              </div>
            </ParallaxCard>))}
        </div>
      </section>

      {/* ─── MICRO-INTERACTIONS SHOWCASE ─── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto rounded-3xl p-10 relative overflow-hidden" style={{
            background: "linear-gradient(135deg, #0a1628 0%, #0f1f3a 100%)",
            border: "1px solid rgba(6,182,212,0.15)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.5), 0 0 60px rgba(6,182,212,0.05)",
        }}>
          <div className="absolute top-0 right-0 pointer-events-none" style={{
            width: 300,
            height: 300,
            background: "radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)",
        }}/>
          <div className="text-center mb-10">
            <p className="text-sm font-semibold mb-2" style={{ color: "#a78bfa" }}>MICRO-INTERACTIONS</p>
            <h2 className="font-bold text-2xl md:text-3xl mb-3" style={{ color: "#f1f5f9" }}>
              Buttons that respond to intent
            </h2>
            <p className="text-sm" style={{ color: "#64748b" }}>
              Three states — Normal, Hover, and After-click — each with smooth animated transitions.
            </p>
          </div>
          <MicroInteractionButtons />

          <div className="mt-10 pt-10 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="text-center mb-8">
              <p className="text-sm font-semibold mb-2" style={{ color: "#34d399" }}>SKELETON SCREEN</p>
              <h3 className="font-bold text-xl mb-2" style={{ color: "#f1f5f9" }}>
                Instant perceived performance
              </h3>
              <p className="text-sm" style={{ color: "#64748b" }}>
                Content placeholder cards shimmer while real data loads, eliminating blank-screen jank.
              </p>
            </div>
            <SkeletonCard />
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold mb-3" style={{ color: "#f472b6" }}>WHAT TEAMS ARE SAYING</p>
          <h2 className="font-bold" style={{
            fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
            background: "linear-gradient(135deg, #f0f9ff, #94a3b8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
        }}>
            Trusted by developers worldwide
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (<ParallaxCard key={t.name} depth={i === 1 ? -1.2 : -0.5}>
              <div className="feature-card rounded-2xl p-6 h-full" style={{
                background: "#0a1628",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "6px 6px 16px rgba(0,0,0,0.4), -3px -3px 10px rgba(255,255,255,0.03)",
            }}>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (<Star key={j} className="h-4 w-4 fill-current" style={{ color: "#fbbf24" }}/>))}
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "#94a3b8" }}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{
                background: `linear-gradient(135deg, ${["#06b6d4", "#a78bfa", "#34d399"][i]}, ${["#0ea5e9", "#7c3aed", "#059669"][i]})`,
                color: "#fff",
            }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>{t.name}</p>
                    <p className="text-xs" style={{ color: "#64748b" }}>{t.role}</p>
                  </div>
                </div>
              </div>
            </ParallaxCard>))}
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <PricingSection />

      {/* ─── CTA ─── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center rounded-3xl p-14 relative overflow-hidden" style={{
            background: "linear-gradient(135deg, #0c1e35 0%, #071424 100%)",
            border: "1px solid rgba(6,182,212,0.2)",
            boxShadow: "0 0 80px rgba(6,182,212,0.08), 0 32px 64px rgba(0,0,0,0.6)",
        }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 0%, rgba(6,182,212,0.12) 0%, transparent 65%)" }}/>
          <h2 className="font-black mb-4 relative z-10" style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            background: "linear-gradient(135deg, #ffffff 0%, #22d3ee 60%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
        }}>
            Ready to ship faster?
          </h2>
          <p className="text-base mb-8 relative z-10" style={{ color: "#64748b" }}>
            Get up and running in under 5 minutes. No credit card required.
          </p>
          <Link to="/login" className="relative z-10 inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-bold text-base transition-all duration-300 hover:scale-105 hover:shadow-2xl" style={{
            background: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
            color: "#fff",
            boxShadow: "0 8px 32px rgba(6,182,212,0.4)",
        }}>
            Get Started Free <ArrowRight className="h-5 w-5"/>
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="text-center py-8 text-xs" style={{ color: "#334155", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        © {new Date().getFullYear()} LicenseAdmin. Built with precision for developers who care.
      </footer>
    </div>);
}
