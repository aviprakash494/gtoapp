import { Link } from "wouter";
import { auth } from "@/lib/api";

const features = [
  { icon: "🌍", title: "500+ Universities", desc: "Explore programs across 60+ countries" },
  { icon: "📋", title: "Simple Applications", desc: "Apply in minutes with a guided process" },
  { icon: "🔒", title: "Secure Payments", desc: "Pay application fees safely via Stripe" },
  { icon: "📊", title: "Track Progress", desc: "Monitor all applications in one dashboard" },
];

const destinations = [
  { country: "United Kingdom", emoji: "🇬🇧", courses: "Engineering, Law, Medicine" },
  { country: "United States", emoji: "🇺🇸", courses: "Business, Computer Science, Arts" },
  { country: "Canada", emoji: "🇨🇦", courses: "Data Science, Public Policy, Finance" },
  { country: "Australia", emoji: "🇦🇺", courses: "Environmental Science, Architecture, Nursing" },
  { country: "Germany", emoji: "🇩🇪", courses: "Mechanical Engineering, Physics, Philosophy" },
  { country: "Singapore", emoji: "🇸🇬", courses: "Finance, Information Systems, Biomedical" },
];

export default function Home() {
  const loggedIn = auth.isLoggedIn();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section
        className="relative min-h-[520px] flex items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(222,47%,11%) 0%, hsl(222,47%,17%) 50%, hsl(180,100%,15%) 100%)" }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, hsl(43,100%,50%) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(180,100%,50%) 0%, transparent 40%)" }} />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <span className="inline-block text-[hsl(43,100%,50%)] text-sm font-semibold tracking-widest uppercase mb-4">
            Your global education journey starts here
          </span>
          <h1 className="font-serif text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
            Study Abroad,<br />
            <span className="text-[hsl(43,100%,50%)]">Without the Stress</span>
          </h1>
          <p className="text-white/70 text-lg mb-10 leading-relaxed">
            Browse top universities worldwide, submit applications, and manage your fees
            all in one place. Thousands of students trust GlobeTrek every year.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {loggedIn ? (
              <Link href="/universities">
                <span className="inline-block bg-[hsl(43,100%,50%)] text-[hsl(222,47%,11%)] font-bold px-8 py-3.5 rounded-lg cursor-pointer hover:brightness-110 transition-all text-base shadow-lg">
                  Browse Universities
                </span>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <span className="inline-block bg-[hsl(43,100%,50%)] text-[hsl(222,47%,11%)] font-bold px-8 py-3.5 rounded-lg cursor-pointer hover:brightness-110 transition-all text-base shadow-lg">
                    Get Started Free
                  </span>
                </Link>
                <Link href="/login">
                  <span className="inline-block border border-white/30 text-white px-8 py-3.5 rounded-lg cursor-pointer hover:bg-white/10 transition-all text-base">
                    Sign In
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-[hsl(180,100%,25%)] text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { value: "500+", label: "Universities" },
            { value: "60+", label: "Countries" },
            { value: "12,000+", label: "Students" },
            { value: "98%", label: "Satisfaction" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-[hsl(43,100%,50%)]">{s.value}</div>
              <div className="text-xs text-white/70 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl font-bold text-center text-foreground mb-2">
            Everything You Need
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            One platform to manage your entire overseas application journey
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="py-20 px-4 bg-muted">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl font-bold text-center text-foreground mb-2">
            Popular Destinations
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Top countries where our students are accepted
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {destinations.map((d) => (
              <div
                key={d.country}
                className="bg-card border border-border rounded-xl p-5 flex items-start gap-4 hover:shadow-md hover:border-[hsl(180,100%,25%)] transition-all"
              >
                <span className="text-3xl">{d.emoji}</span>
                <div>
                  <h3 className="font-semibold text-foreground">{d.country}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{d.courses}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href={loggedIn ? "/universities" : "/register"}>
              <span className="inline-block bg-[hsl(222,47%,11%)] text-white font-semibold px-8 py-3 rounded-lg cursor-pointer hover:bg-[hsl(222,47%,17%)] transition-colors">
                Explore All Universities
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      {!loggedIn && (
        <section className="py-20 px-4 text-center" style={{ background: "hsl(222,47%,11%)" }}>
          <h2 className="font-serif text-3xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-white/60 mb-8 max-w-md mx-auto">
            Join thousands of students who have already secured their place at top universities worldwide.
          </p>
          <Link href="/register">
            <span className="inline-block bg-[hsl(43,100%,50%)] text-[hsl(222,47%,11%)] font-bold px-10 py-3.5 rounded-lg cursor-pointer hover:brightness-110 transition-all text-base">
              Create Free Account
            </span>
          </Link>
        </section>
      )}
    </div>
  );
}
