import { useState } from "react";
import { Link, useLocation } from "wouter";
import { apiClient, auth } from "@/lib/api";

export default function Register() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload: Record<string, string> = { name: form.name, email: form.email, password: form.password };
      if (form.phone) payload.phone = form.phone;
      const res = await apiClient.post("/api/auth/register", payload);
      auth.setToken(res.data.token);
      navigate("/universities");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(135deg, hsl(222,47%,11%) 0%, hsl(180,100%,15%) 100%)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-white mb-2">Create Your Account</h1>
          <p className="text-white/60">Start your overseas education journey today</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(222,47%,11%)] text-sm"
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(222,47%,11%)] text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(222,47%,11%)] text-sm"
                placeholder="Min 6 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Phone Number <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(222,47%,11%)] text-sm"
                placeholder="+1234567890"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[hsl(222,47%,11%)] text-white font-semibold py-3 rounded-lg hover:bg-[hsl(222,47%,17%)] transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login">
              <span className="text-[hsl(180,100%,25%)] font-semibold cursor-pointer hover:underline">
                Sign In
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
