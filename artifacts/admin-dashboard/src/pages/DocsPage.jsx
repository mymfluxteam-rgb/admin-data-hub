import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Zap, Key, CreditCard, Shield, ChevronRight, Terminal, CheckCircle2, ArrowRight, Copy, Check, } from "lucide-react";
// ── Code block with copy button ───────────────────────────────────────────────
function CodeBlock({ code, language = "bash" }) {
    const [copied, setCopied] = useState(false);
    return (<div className="relative rounded-xl text-sm font-mono mt-3 mb-5 group" style={{
            background: "#060e1c",
            border: "1px solid rgba(255,255,255,0.08)",
        }}>
      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <span className="text-xs" style={{ color: "#475569" }}>{language}</span>
        <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1800); }} className="flex items-center gap-1 text-xs transition-colors duration-200 hover:text-white" style={{ color: "#475569" }}>
          {copied ? <Check className="h-3 w-3"/> : <Copy className="h-3 w-3"/>}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto" style={{ color: "#94a3b8", margin: 0 }}>
        <code>{code}</code>
      </pre>
    </div>);
}
// ── Sidebar sections ──────────────────────────────────────────────────────────
const SIDEBAR = [
    { id: "getting-started", label: "Getting Started", icon: Zap },
    { id: "authentication", label: "Authentication", icon: Key },
    { id: "api-reference", label: "API Reference", icon: Terminal },
    { id: "plan-comparison", label: "Plan Comparison", icon: CreditCard },
    { id: "hwid-locking", label: "HWID Locking", icon: Shield },
    { id: "faq", label: "FAQ", icon: BookOpen },
];
// ── Plan comparison data ──────────────────────────────────────────────────────
const COMPARISON_ROWS = [
    { feature: "Licensed users", tester: "Up to 10", developer: "Unlimited", seller: "Unlimited" },
    { feature: "Applications", tester: "1", developer: "5", seller: "Unlimited" },
    { feature: "HWID locking", tester: "Basic", developer: "Advanced", seller: "Advanced" },
    { feature: "Credit-based billing", tester: "—", developer: "✓", seller: "✓" },
    { feature: "Analytics dashboard", tester: "—", developer: "✓", seller: "✓" },
    { feature: "Audit logs", tester: "—", developer: "✓", seller: "✓" },
    { feature: "API rate limit", tester: "100 / min", developer: "1,000 / min", seller: "10,000 / min" },
    { feature: "White-label UI", tester: "—", developer: "—", seller: "✓" },
    { feature: "Support", tester: "Community", developer: "Priority email", "seller": "Dedicated + SLA" },
    { feature: "Price", tester: "Free", developer: "$2.99 / mo", seller: "$4.99 / mo" },
];
export default function DocsPage() {
    const [active, setActive] = useState("getting-started");
    function scrollTo(id) {
        setActive(id);
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    return (<div className="min-h-screen" style={{
            background: "#050d1a",
            color: "#e2e8f0",
            fontFamily: "'Inter', system-ui, sans-serif",
        }}>
      {/* ── Top nav ──────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-8 py-4 sticky top-0 z-50" style={{
            background: "rgba(5,13,26,0.92)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(16px)",
        }}>
        <Link to="/landing" className="text-lg font-bold flex items-center gap-1.5">
          <span style={{ color: "#06b6d4" }}>◆</span>
          <span style={{ color: "#f1f5f9" }}>License</span>
          <span style={{ color: "#06b6d4" }}>Admin</span>
          <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-md" style={{ background: "rgba(6,182,212,0.12)", color: "#22d3ee", border: "1px solid rgba(6,182,212,0.2)" }}>
            Docs
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/about" className="text-sm transition-colors hover:text-white" style={{ color: "#94a3b8" }}>About</Link>
          <Link to="/landing#pricing" className="text-sm transition-colors hover:text-white" style={{ color: "#94a3b8" }}>Pricing</Link>
          <Link to="/login" className="text-sm px-5 py-2 rounded-xl font-semibold transition-all duration-200 hover:scale-105" style={{
            background: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
            color: "#fff",
            boxShadow: "0 4px 16px rgba(6,182,212,0.3)",
        }}>
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="flex max-w-7xl mx-auto">
        {/* ── Sidebar ────────────────────────────────────────────────── */}
        <aside className="hidden md:flex flex-col w-60 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-8 px-4" style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-xs font-semibold mb-4 px-3 tracking-widest" style={{ color: "#475569" }}>
            CONTENTS
          </p>
          <nav className="space-y-0.5">
            {SIDEBAR.map(({ id, label, icon: Icon }) => (<button key={id} onClick={() => scrollTo(id)} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-all duration-150" style={{
                background: active === id ? "rgba(6,182,212,0.1)" : "transparent",
                color: active === id ? "#22d3ee" : "#64748b",
                fontWeight: active === id ? 600 : 400,
            }}>
                <Icon className="h-4 w-4 shrink-0"/>
                {label}
                {active === id && <ChevronRight className="h-3 w-3 ml-auto"/>}
              </button>))}
          </nav>

          <div className="mt-8 mx-3 rounded-xl p-4" style={{
            background: "rgba(6,182,212,0.06)",
            border: "1px solid rgba(6,182,212,0.15)",
        }}>
            <p className="text-xs font-semibold mb-1" style={{ color: "#22d3ee" }}>Need help?</p>
            <p className="text-xs mb-3" style={{ color: "#475569" }}>
              Can't find what you're looking for?
            </p>
            <a href="mailto:support@licenseadmin.io" className="text-xs font-medium flex items-center gap-1 transition-colors hover:text-cyan-300" style={{ color: "#06b6d4" }}>
              Contact support <ArrowRight className="h-3 w-3"/>
            </a>
          </div>
        </aside>

        {/* ── Main content ───────────────────────────────────────────── */}
        <main className="flex-1 px-6 md:px-12 py-12 max-w-3xl">

          {/* ── Getting Started ─────────────────────────────────────── */}
          <section id="getting-started" className="mb-20 scroll-mt-20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.2)" }}>
                <Zap className="h-4 w-4" style={{ color: "#06b6d4" }}/>
              </div>
              <span className="text-xs font-semibold tracking-widest" style={{ color: "#06b6d4" }}>GETTING STARTED</span>
            </div>
            <h1 className="font-black mb-4" style={{ fontSize: "2rem", color: "#f1f5f9" }}>
              Up and running in 5 minutes
            </h1>
            <p className="text-base mb-8 leading-relaxed" style={{ color: "#64748b" }}>
              LicenseAdmin gives you a complete licensing backend through a simple REST API. This
              guide walks you from zero to your first validated license check.
            </p>

            {/* Step 1 */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: "linear-gradient(135deg,#0ea5e9,#06b6d4)", color: "#fff" }}>1</div>
                <h2 className="text-lg font-semibold" style={{ color: "#f1f5f9" }}>Create your account</h2>
              </div>
              <p className="text-sm mb-2 pl-9" style={{ color: "#94a3b8" }}>
                Sign up at <Link to="/login" className="underline hover:text-cyan-400" style={{ color: "#06b6d4" }}>licenseadmin.io</Link> — no credit card needed.
                Choose the <strong style={{ color: "#e2e8f0" }}>Tester</strong> plan to explore everything for free.
              </p>
            </div>

            {/* Step 2 */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: "linear-gradient(135deg,#0ea5e9,#06b6d4)", color: "#fff" }}>2</div>
                <h2 className="text-lg font-semibold" style={{ color: "#f1f5f9" }}>Grab your API key</h2>
              </div>
              <p className="text-sm mb-1 pl-9" style={{ color: "#94a3b8" }}>
                Navigate to <strong style={{ color: "#e2e8f0" }}>Settings → API Keys</strong> in your dashboard and create a new key.
                Store it securely — you won't see the full key again.
              </p>
              <div className="pl-9">
                <CodeBlock language="plaintext" code={`la_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`}/>
              </div>
            </div>

            {/* Step 3 */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: "linear-gradient(135deg,#0ea5e9,#06b6d4)", color: "#fff" }}>3</div>
                <h2 className="text-lg font-semibold" style={{ color: "#f1f5f9" }}>Make your first API call</h2>
              </div>
              <p className="text-sm mb-1 pl-9" style={{ color: "#94a3b8" }}>
                Check a user's license status by calling the <code className="px-1.5 py-0.5 rounded text-xs" style={{ background: "#0f1929", color: "#22d3ee" }}>/api/users/:id</code> endpoint:
              </p>
              <div className="pl-9">
                <CodeBlock language="bash" code={`curl https://api.licenseadmin.io/api/users/{user_id} \\
  -H "Authorization: Bearer la_live_xxxxxxxxxxxx" \\
  -H "Content-Type: application/json"`}/>
              </div>
            </div>

            {/* Step 4 */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: "linear-gradient(135deg,#0ea5e9,#06b6d4)", color: "#fff" }}>4</div>
                <h2 className="text-lg font-semibold" style={{ color: "#f1f5f9" }}>Handle the response</h2>
              </div>
              <p className="text-sm mb-1 pl-9" style={{ color: "#94a3b8" }}>
                Check the <code className="px-1.5 py-0.5 rounded text-xs" style={{ background: "#0f1929", color: "#22d3ee" }}>status</code> field to determine if the user is allowed to run your software:
              </p>
              <div className="pl-9">
                <CodeBlock language="json" code={`{
  "id": "usr_abc123",
  "email": "user@example.com",
  "status": "active",
  "credits": 42,
  "account_expiry": "2025-12-31T23:59:59Z",
  "verified": true
}`}/>
              </div>
            </div>

            {/* Step 5 */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: "linear-gradient(135deg,#0ea5e9,#06b6d4)", color: "#fff" }}>5</div>
                <h2 className="text-lg font-semibold" style={{ color: "#f1f5f9" }}>Enable HWID locking (optional)</h2>
              </div>
              <p className="text-sm mb-1 pl-9" style={{ color: "#94a3b8" }}>
                Tie a license to specific hardware by registering a device fingerprint. See the
                <a href="#hwid-locking" onClick={() => scrollTo("hwid-locking")} className="ml-1 underline hover:text-cyan-400" style={{ color: "#06b6d4" }}>
                  HWID Locking section
                </a> for details.
              </p>
            </div>

            {/* Quick checklist */}
            <div className="rounded-2xl p-6 mt-8" style={{
            background: "rgba(6,182,212,0.05)",
            border: "1px solid rgba(6,182,212,0.15)",
        }}>
              <p className="text-sm font-semibold mb-4" style={{ color: "#22d3ee" }}>✓ Quick-start checklist</p>
              <ul className="space-y-2.5">
                {[
            "Account created and verified",
            "API key generated and stored securely",
            "First API call returns 200 OK",
            "License status check integrated into your app",
            "HWID locking configured (recommended)",
        ].map((item) => (<li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: "#94a3b8" }}>
                    <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "#34d399" }}/>
                    {item}
                  </li>))}
              </ul>
            </div>
          </section>

          {/* ── Authentication ──────────────────────────────────────── */}
          <section id="authentication" className="mb-20 scroll-mt-20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.2)" }}>
                <Key className="h-4 w-4" style={{ color: "#a78bfa" }}/>
              </div>
              <span className="text-xs font-semibold tracking-widest" style={{ color: "#a78bfa" }}>AUTHENTICATION</span>
            </div>
            <h2 className="font-bold mb-4" style={{ fontSize: "1.6rem", color: "#f1f5f9" }}>
              Authenticating requests
            </h2>
            <p className="text-sm mb-4 leading-relaxed" style={{ color: "#94a3b8" }}>
              All API requests must include your API key in the <code className="px-1.5 py-0.5 rounded text-xs" style={{ background: "#0f1929", color: "#22d3ee" }}>Authorization</code> header as a Bearer token.
              Requests without a valid key will receive a <code className="px-1.5 py-0.5 rounded text-xs" style={{ background: "#0f1929", color: "#f87171" }}>401 Unauthorized</code> response.
            </p>
            <CodeBlock language="http" code={`Authorization: Bearer la_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`}/>
            <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
              Keep your API key secret. Never expose it in client-side JavaScript or commit it to
              source control. Use environment variables or a secrets manager.
            </p>
          </section>

          {/* ── API Reference ──────────────────────────────────────── */}
          <section id="api-reference" className="mb-20 scroll-mt-20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.2)" }}>
                <Terminal className="h-4 w-4" style={{ color: "#34d399" }}/>
              </div>
              <span className="text-xs font-semibold tracking-widest" style={{ color: "#34d399" }}>API REFERENCE</span>
            </div>
            <h2 className="font-bold mb-4" style={{ fontSize: "1.6rem", color: "#f1f5f9" }}>Core endpoints</h2>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: "#94a3b8" }}>
              Base URL: <code className="px-1.5 py-0.5 rounded text-xs" style={{ background: "#0f1929", color: "#22d3ee" }}>https://api.licenseadmin.io</code>
            </p>
            <div className="space-y-4">
              {[
            { method: "GET", path: "/api/users", desc: "List all users with pagination" },
            { method: "POST", path: "/api/users", desc: "Create a new user" },
            { method: "GET", path: "/api/users/:id", desc: "Get a single user by ID" },
            { method: "PATCH", path: "/api/users/:id", desc: "Update user status, credits, or expiry" },
            { method: "DELETE", path: "/api/users/:id", desc: "Delete a user permanently" },
            { method: "POST", path: "/api/users/:id/ban", desc: "Ban a user immediately" },
            { method: "POST", path: "/api/hwids", desc: "Register a new device fingerprint" },
            { method: "GET", path: "/api/metrics", desc: "Dashboard overview metrics" },
            { method: "GET", path: "/api/audit-logs", desc: "Full tamper-proof audit trail" },
        ].map(({ method, path, desc }) => {
            const colors = { GET: "#34d399", POST: "#0ea5e9", PATCH: "#f59e0b", DELETE: "#f87171" };
            return (<div key={path + method} className="flex items-start gap-4 rounded-xl px-4 py-3" style={{
                    background: "#0a1628",
                    border: "1px solid rgba(255,255,255,0.06)",
                }}>
                    <span className="text-xs font-bold font-mono mt-0.5 w-14 shrink-0 text-right" style={{ color: colors[method] ?? "#94a3b8" }}>
                      {method}
                    </span>
                    <code className="text-sm font-mono flex-1" style={{ color: "#e2e8f0" }}>{path}</code>
                    <span className="text-xs hidden sm:block" style={{ color: "#475569" }}>{desc}</span>
                  </div>);
        })}
            </div>
          </section>

          {/* ── Plan Comparison ────────────────────────────────────── */}
          <section id="plan-comparison" className="mb-20 scroll-mt-20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.2)" }}>
                <CreditCard className="h-4 w-4" style={{ color: "#fb923c" }}/>
              </div>
              <span className="text-xs font-semibold tracking-widest" style={{ color: "#fb923c" }}>PLAN COMPARISON</span>
            </div>
            <h2 className="font-bold mb-2" style={{ fontSize: "1.6rem", color: "#f1f5f9" }}>
              Choosing the right plan
            </h2>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: "#94a3b8" }}>
              All plans include core licensing features. Upgrade when you're ready — no migration
              needed, your data stays intact.
            </p>

            {/* Comparison table */}
            <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#0a1628", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <th className="text-left px-5 py-4 font-semibold" style={{ color: "#64748b" }}>Feature</th>
                    <th className="px-5 py-4 font-semibold text-center" style={{ color: "#94a3b8" }}>Tester</th>
                    <th className="px-5 py-4 font-semibold text-center" style={{ color: "#06b6d4" }}>Developer</th>
                    <th className="px-5 py-4 font-semibold text-center" style={{ color: "#a855f7" }}>Seller</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (<tr key={row.feature} style={{
                background: i % 2 === 0 ? "#070f1e" : "#080f1c",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}>
                      <td className="px-5 py-3.5 font-medium" style={{ color: "#94a3b8" }}>{row.feature}</td>
                      <td className="px-5 py-3.5 text-center" style={{ color: row.tester === "—" ? "#334155" : "#64748b" }}>{row.tester}</td>
                      <td className="px-5 py-3.5 text-center font-medium" style={{ color: row.developer === "—" ? "#334155" : "#22d3ee" }}>{row.developer}</td>
                      <td className="px-5 py-3.5 text-center font-medium" style={{ color: row.seller === "—" ? "#334155" : "#c084fc" }}>{row.seller}</td>
                    </tr>))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 text-center">
              <Link to="/landing#pricing" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105" style={{
            background: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
            color: "#fff",
            boxShadow: "0 4px 16px rgba(6,182,212,0.3)",
        }}>
                See pricing page <ArrowRight className="h-4 w-4"/>
              </Link>
            </div>
          </section>

          {/* ── HWID Locking ───────────────────────────────────────── */}
          <section id="hwid-locking" className="mb-20 scroll-mt-20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.2)" }}>
                <Shield className="h-4 w-4" style={{ color: "#06b6d4" }}/>
              </div>
              <span className="text-xs font-semibold tracking-widest" style={{ color: "#06b6d4" }}>HWID LOCKING</span>
            </div>
            <h2 className="font-bold mb-4" style={{ fontSize: "1.6rem", color: "#f1f5f9" }}>
              Hardware-binding a license
            </h2>
            <p className="text-sm mb-4 leading-relaxed" style={{ color: "#94a3b8" }}>
              HWID locking ties a user's license to one or more specific devices. On each app
              launch, call the HWID check endpoint with the current machine's fingerprint.
              If the fingerprint isn't registered (or is blacklisted), deny access.
            </p>
            <CodeBlock language="bash" code={`# Register a new device fingerprint
curl -X POST https://api.licenseadmin.io/api/hwids \\
  -H "Authorization: Bearer la_live_xxxxxxxxxxxx" \\
  -d '{
    "user_id": "usr_abc123",
    "device_id": "sha256-of-machine-fingerprint",
    "device_name": "Alex MacBook Pro 14\\"
  }'`}/>
            <p className="text-sm" style={{ color: "#64748b" }}>
              Generate the <code className="px-1.5 py-0.5 rounded text-xs" style={{ background: "#0f1929", color: "#22d3ee" }}>device_id</code> by hashing stable hardware identifiers
              (CPU ID, motherboard serial, MAC address). Never include volatile values like IP
              addresses or hostnames.
            </p>
          </section>

          {/* ── FAQ ────────────────────────────────────────────────── */}
          <section id="faq" className="mb-12 scroll-mt-20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(244,114,182,0.12)", border: "1px solid rgba(244,114,182,0.2)" }}>
                <BookOpen className="h-4 w-4" style={{ color: "#f472b6" }}/>
              </div>
              <span className="text-xs font-semibold tracking-widest" style={{ color: "#f472b6" }}>FAQ</span>
            </div>
            <h2 className="font-bold mb-6" style={{ fontSize: "1.6rem", color: "#f1f5f9" }}>
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              {[
            {
                q: "Can I switch plans at any time?",
                a: "Yes. Upgrades take effect immediately and are prorated. Downgrades take effect at the start of your next billing cycle.",
            },
            {
                q: "Is there a free trial for paid plans?",
                a: "The Tester plan is free forever and lets you fully evaluate the platform. No trial period or credit card needed.",
            },
            {
                q: "How is the API rate limit enforced?",
                a: "Limits are applied per API key on a rolling 60-second window. Exceeding the limit returns a 429 response with a Retry-After header.",
            },
            {
                q: "What happens to my data if I cancel?",
                a: "Your data is retained for 30 days after cancellation. Export it any time from the dashboard. After 30 days it is permanently deleted.",
            },
            {
                q: "Do you offer self-hosted or on-premise deployment?",
                a: "Not currently. LicenseAdmin is a fully managed cloud platform. If you need on-premise deployment, contact us to discuss enterprise options.",
            },
        ].map(({ q, a }) => (<div key={q} className="rounded-xl p-5" style={{
                background: "#0a1628",
                border: "1px solid rgba(255,255,255,0.07)",
            }}>
                  <p className="text-sm font-semibold mb-2" style={{ color: "#f1f5f9" }}>{q}</p>
                  <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{a}</p>
                </div>))}
            </div>
          </section>
        </main>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="text-center py-8 text-xs" style={{ color: "#334155", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        © {new Date().getFullYear()} LicenseAdmin. Built with precision for developers who care.
      </footer>
    </div>);
}
