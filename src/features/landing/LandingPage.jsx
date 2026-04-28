import { ArrowRight, Building2, Camera, MapPin, Menu, Sparkles, TimerReset, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ThemeSwitch } from "../../components/ui/ThemeSwitch.jsx";
import { getHomeForRole } from "../../lib/roles";
import { useAuth } from "../auth/useAuth";

const LOGO_SRC = "/logo.png";

const steps = [
  {
    icon: Camera,
    title: "Capture the issue",
    text: "Citizens upload a photo and short description from the browser.",
  },
  {
    icon: MapPin,
    title: "Locate the ward",
    text: "GPS coordinates are verified against ward boundaries before submission.",
  },
  {
    icon: Sparkles,
    title: "Classify with AI",
    text: "The AI suggests an issue type while citizens keep final control.",
  },
  {
    icon: TimerReset,
    title: "Track resolution",
    text: "Officials work against SLA timers and upload proof after fixing.",
  },
];

const metrics = [
  ["AI-assisted", "issue classification"],
  ["Ward-aware", "automatic routing"],
  ["SLA-backed", "official accountability"],
];

const navItems = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Roles", href: "#roles" },
  { label: "Login", to: "/login" },
];

export function LandingPage() {
  const { booting, isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = document.querySelectorAll(".fade-in");
    if (reduceMotion) {
      targets.forEach((node) => node.classList.add("in-view"));
      return undefined;
    }

    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("in-view", entry.isIntersecting);
        });
      },
      { threshold: 0.12, rootMargin: "-6% 0px -10% 0px" },
    );
    targets.forEach((node) => observer.observe(node));

    let rafId = 0;
    const onScroll = () => {
      window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        const offset = Math.min(90, window.scrollY * 0.12);
        document.documentElement.style.setProperty("--parallax-offset", `${offset}px`);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      document.documentElement.style.setProperty("--parallax-offset", "0px");
    };
  }, []);

  if (booting) return <div className="screen-message">Opening Cittilenz...</div>;
  if (isAuthenticated) return <Navigate to={getHomeForRole(user.role)} replace />;

  return (
    <main className="landing-page">
      <header className="landing-nav fade-in">
        <Link className="landing-logo" to="/">
          <span className="landing-logo-mark">
            <img alt="Cittilenz logo" className="brand-logo" height="30" src={LOGO_SRC} width="30" />
          </span>
          Cittilenz
        </Link>
        <nav className="landing-desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) =>
            item.to ? (
              <Link key={item.label} to={item.to}>{item.label}</Link>
            ) : (
              <a href={item.href} key={item.label}>{item.label}</a>
            ),
          )}
          <ThemeSwitch />
        </nav>
        <div className="landing-mobile-nav">
          <button
            aria-controls="landing-mobile-menu"
            aria-expanded={mobileMenuOpen}
            className="landing-menu-button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            type="button"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            <span>Menu</span>
          </button>
          {mobileMenuOpen ? (
            <nav className="landing-mobile-menu" id="landing-mobile-menu" aria-label="Mobile navigation">
              {navItems.map((item) =>
                item.to ? (
                  <Link key={item.label} onClick={() => setMobileMenuOpen(false)} to={item.to}>
                    {item.label}
                  </Link>
                ) : (
                  <a href={item.href} key={item.label} onClick={() => setMobileMenuOpen(false)}>
                    {item.label}
                  </a>
                ),
              )}
              <ThemeSwitch />
            </nav>
          ) : null}
        </div>
      </header>

      <section className="landing-hero">
        <div className="hero-copy fade-in">
          <p className="landing-kicker">Civic reporting, made accountable</p>
          <h1>Turn local issues into visible, trackable action.</h1>
          <p>
            Cittilenz connects citizens, officials, and ward superiors through geo-tagged reports,
            AI-assisted classification, SLA tracking, and proof-based resolution.
          </p>
          <div className="landing-actions">
            <Link className="lux-button" to="/register">
              Report as citizen
              <ArrowRight size={18} />
            </Link>
            <Link className="lux-button outline official-login-link" to="/login">Official login</Link>
          </div>
        </div>

        <div className="hero-visual fade-in delay-1" aria-hidden="true">
          <div className="visual-map">
            <span className="map-pin pin-one" />
            <span className="map-pin pin-two" />
            <span className="map-pin pin-three" />
          </div>
          <div className="visual-card issue-card">
            <span>Detected issue</span>
            <strong>Pothole</strong>
            <small>AI confidence 86%</small>
          </div>
          <div className="visual-card sla-card">
            <span>SLA status</span>
            <strong>18h left</strong>
            <small>Assigned to Roads Dept.</small>
          </div>
        </div>
      </section>

      <section className="landing-metrics fade-in delay-2">
        {metrics.map(([value, label]) => (
          <div key={value}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </section>

      <section className="landing-section" id="how-it-works">
        <div className="section-heading fade-in">
          <p className="landing-kicker">How it works</p>
          <h2>Designed around the complete complaint lifecycle.</h2>
        </div>
        <div className="landing-grid">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <article className="lux-card fade-in" style={{ transitionDelay: `${index * 90}ms` }} key={step.title}>
                <Icon size={24} />
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="landing-section split" id="roles">
        <div className="role-panel fade-in">
          <Building2 size={28} />
          <h2>One platform for every civic role.</h2>
          <p>
            Citizens submit and track reports. Officials resolve assigned work. Ward superiors
            intervene when SLAs slip. Admins configure staff, departments, and issue types.
          </p>
        </div>
        <div className="role-list fade-in delay-1">
          <div><strong>Citizens</strong><span>Report issues with photos, location, and status tracking.</span></div>
          <div><strong>Officials</strong><span>Start work, resolve issues, and upload fixed images.</span></div>
          <div><strong>Ward superiors</strong><span>Review escalations and reassign delayed complaints.</span></div>
          <div><strong>Admins</strong><span>Create staff accounts and manage civic classifications.</span></div>
        </div>
      </section>

      <section className="landing-cta fade-in">
        <p className="landing-kicker">Start with a report</p>
        <h2>A cleaner city begins with one visible complaint.</h2>
        <Link className="lux-button" to="/register">
          Create citizen account
          <ArrowRight size={18} />
        </Link>
      </section>

      <footer className="landing-footer fade-in">
        <div className="landing-footer-brand">
          <Link className="landing-logo" to="/">
            <span className="landing-logo-mark">
              <img alt="Cittilenz logo" className="brand-logo" height="30" src={LOGO_SRC} width="30" />
            </span>
            Cittilenz
          </Link>
          <p>Geo-tagged reporting, official workflows, and SLA visibility for cleaner civic response.</p>
        </div>
        <nav className="landing-footer-links" aria-label="Footer navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#roles">Roles</a>
          <Link to="/login">Official login</Link>
          <Link to="/register">Citizen signup</Link>
        </nav>
        <p className="landing-footer-meta">
          © {new Date().getFullYear()} Cittilenz. Built for accountable civic action.
        </p>
      </footer>
    </main>
  );
}
