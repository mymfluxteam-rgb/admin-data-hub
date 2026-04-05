import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.8591-3.0477.8591-2.3441 0-4.3282-1.5831-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71c-.18-.54-.2823-1.1168-.2823-1.71s.1023-1.17.2823-1.71V4.9582H.9574A8.9961 8.9961 0 0 0 0 9c0 1.4523.3477 2.8268.9574 4.0418L3.964 10.71z" fill="#FBBC05"/>
      <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9574 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z" fill="#EA4335"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle OAuth redirect-back (token or error in URL)
  useEffect(() => {
    const oauthToken = searchParams.get("oauth_token");
    const oauthError = searchParams.get("oauth_error");

    if (oauthToken) {
      localStorage.setItem("admin_jwt", oauthToken);
      toast.success("Signed in successfully");
      navigate("/", { replace: true });
      return;
    }

    if (oauthError) {
      const msg =
        oauthError === "state_mismatch"
          ? "OAuth session expired. Please try again."
          : oauthError === "missing_code"
          ? "Authentication was cancelled."
          : `OAuth error: ${oauthError}`;
      toast.error(msg);
    }
  }, [searchParams, navigate]);

  // If already logged in, skip to dashboard
  useEffect(() => {
    if (localStorage.getItem("admin_jwt")) navigate("/", { replace: true });
  }, [navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      if (res) {
        toast.success("Signed in successfully");
        navigate("/", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }

  function handleOAuth(provider: "google" | "github") {
    setOauthLoading(provider);
    window.location.href = `/auth/${provider}`;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#050d1a", fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .login-card { animation: fadeUp 0.5s ease both; }
        .social-btn:hover { transform: translateY(-1px); }
        .social-btn:active { transform: translateY(0); }
        .social-btn { transition: all 0.2s ease; }
        .input-field:focus { outline: none; border-color: #06b6d4 !important; box-shadow: 0 0 0 3px rgba(6,182,212,0.15); }
        .sign-in-btn:hover:not(:disabled) { background: linear-gradient(135deg, #38bdf8, #22d3ee) !important; box-shadow: 0 0 24px rgba(6,182,212,0.45) !important; transform: translateY(-1px); }
        .sign-in-btn:active:not(:disabled) { transform: translateY(0); }
        .sign-in-btn { transition: all 0.2s ease; }
      `}</style>

      <div
        className="login-card w-full max-w-md rounded-2xl p-8"
        style={{
          background: "#0a1628",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(6,182,212,0.05)",
        }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-2xl font-bold mb-1">
            <span style={{ color: "#06b6d4" }}>◆</span>{" "}
            <span style={{ color: "#f1f5f9" }}>License</span>
            <span style={{ color: "#06b6d4" }}>Admin</span>
          </div>
          <p className="text-sm mt-2" style={{ color: "#64748b" }}>
            Sign in to your admin dashboard
          </p>
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleLogin} className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="input-field w-full rounded-xl px-4 py-2.5 text-sm"
              style={{
                background: "#0f1929",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#e2e8f0",
              }}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium" style={{ color: "#94a3b8" }}>
                Password
              </label>
              <a
                href="#"
                className="text-xs transition-colors duration-200 hover:text-cyan-400"
                style={{ color: "#06b6d4" }}
              >
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field w-full rounded-xl px-4 py-2.5 text-sm"
              style={{
                background: "#0f1929",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#e2e8f0",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="sign-in-btn w-full py-2.5 rounded-xl text-sm font-semibold mt-2"
            style={{
              background: loading
                ? "rgba(6,182,212,0.3)"
                : "linear-gradient(135deg, #0ea5e9, #06b6d4)",
              color: "#fff",
              boxShadow: "0 4px 16px rgba(6,182,212,0.25)",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          <span className="text-xs" style={{ color: "#475569" }}>or continue with</span>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => handleOAuth("google")}
            disabled={!!oauthLoading}
            className="social-btn flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-sm font-medium"
            style={{
              background: oauthLoading === "google" ? "rgba(255,255,255,0.03)" : "#0f1929",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#e2e8f0",
              cursor: oauthLoading ? "not-allowed" : "pointer",
              opacity: oauthLoading && oauthLoading !== "google" ? 0.5 : 1,
            }}
          >
            {oauthLoading === "google" ? (
              <div
                className="h-4 w-4 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "transparent" }}
              />
            ) : (
              <GoogleIcon />
            )}
            <span>{oauthLoading === "google" ? "Redirecting…" : "Google"}</span>
          </button>

          <button
            type="button"
            onClick={() => handleOAuth("github")}
            disabled={!!oauthLoading}
            className="social-btn flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-sm font-medium"
            style={{
              background: oauthLoading === "github" ? "rgba(255,255,255,0.03)" : "#0f1929",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#e2e8f0",
              cursor: oauthLoading ? "not-allowed" : "pointer",
              opacity: oauthLoading && oauthLoading !== "github" ? 0.5 : 1,
            }}
          >
            {oauthLoading === "github" ? (
              <div
                className="h-4 w-4 rounded-full border-2 animate-spin"
                style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "transparent" }}
              />
            ) : (
              <GitHubIcon />
            )}
            <span>{oauthLoading === "github" ? "Redirecting…" : "GitHub"}</span>
          </button>
        </div>

        {/* Create account */}
        <p className="text-center text-xs" style={{ color: "#475569" }}>
          Don't have an account?{" "}
          <a
            href="#"
            className="transition-colors duration-200 hover:text-cyan-400"
            style={{ color: "#06b6d4" }}
          >
            Create account
          </a>
        </p>

        {/* Back to landing */}
        <div className="mt-6 pt-5 border-t text-center" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <Link
            to="/landing"
            className="text-xs transition-colors duration-200 hover:text-slate-300"
            style={{ color: "#475569" }}
          >
            ← Back to landing page
          </Link>
        </div>
      </div>
    </div>
  );
}
