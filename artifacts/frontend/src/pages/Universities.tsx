import { useState } from "react";
import { useLocation } from "wouter";
import { apiClient, auth, type University } from "@/lib/api";
import { useListUniversities, getListUniversitiesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

// ─── Apply Modal ────────────────────────────────────────────────────────────
function ApplyModal({ university, onClose }: { university: University; onClose: () => void }) {
  const [statement, setStatement] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const qc = useQueryClient();

  async function handleApply() {
    setError("");
    setLoading(true);
    try {
      await apiClient.post("/api/applications", { universityId: university._id, statement });
      setSuccess(true);
      qc.invalidateQueries({ queryKey: getListUniversitiesQueryKey() });
      setTimeout(onClose, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        {success ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-foreground mb-2">Application Submitted!</h3>
            <p className="text-muted-foreground text-sm">Your application to {university.name} has been received.</p>
          </div>
        ) : (
          <>
            <h3 className="font-serif text-xl font-bold text-foreground mb-1">Apply to {university.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{university.course} — {university.country}</p>
            {error && (
              <div className="mb-4 p-3 rounded bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Personal Statement <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <textarea
                rows={4}
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(222,47%,11%)] resize-none"
                placeholder="Tell the university why you want to join this program..."
              />
            </div>
            <div className="p-3 bg-muted rounded-lg mb-5 text-sm">
              <span className="text-muted-foreground">Application fee: </span>
              <span className="font-bold text-foreground">${university.applicationFee} USD</span>
              <span className="text-muted-foreground ml-1">(payable after submission)</span>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 border border-border py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={loading}
                className="flex-1 bg-[hsl(222,47%,11%)] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[hsl(222,47%,17%)] transition-colors disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Add University Modal ───────────────────────────────────────────────────
const COUNTRIES = [
  "United Kingdom", "United States", "Canada", "Australia", "Germany",
  "Singapore", "France", "Netherlands", "Sweden", "Japan", "South Korea",
  "New Zealand", "Ireland", "Switzerland", "Denmark", "Norway", "Finland",
  "India", "UAE", "South Africa",
];

function AddUniversityModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    country: "",
    course: "",
    applicationFee: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const fee = Number(form.applicationFee);
    if (!fee || fee <= 0) { setError("Application fee must be a positive number"); return; }
    setLoading(true);
    try {
      await apiClient.post("/api/universities", {
        name: form.name.trim(),
        country: form.country,
        course: form.course.trim(),
        applicationFee: fee,
        description: form.description.trim() || undefined,
      });
      setSuccess(true);
      qc.invalidateQueries({ queryKey: getListUniversitiesQueryKey() });
      setTimeout(onClose, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add university");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 my-auto">
        {success ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🎓</div>
            <h3 className="text-xl font-bold text-foreground mb-2">University Added!</h3>
            <p className="text-muted-foreground text-sm">The university has been listed successfully.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif text-xl font-bold text-foreground">Add University</h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">&times;</button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">University Name <span className="text-destructive">*</span></label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(222,47%,11%)]"
                  placeholder="e.g. University of Cambridge"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Country <span className="text-destructive">*</span></label>
                  <select
                    required
                    value={form.country}
                    onChange={(e) => set("country", e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(222,47%,11%)] bg-white"
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Application Fee (USD) <span className="text-destructive">*</span></label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.applicationFee}
                    onChange={(e) => set("applicationFee", e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(222,47%,11%)]"
                    placeholder="e.g. 100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Course / Program <span className="text-destructive">*</span></label>
                <input
                  type="text"
                  required
                  value={form.course}
                  onChange={(e) => set("course", e.target.value)}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(222,47%,11%)]"
                  placeholder="e.g. Computer Science & AI"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Description <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(222,47%,11%)] resize-none"
                  placeholder="Brief description about the university..."
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="flex-1 border border-border py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[hsl(222,47%,11%)] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[hsl(222,47%,17%)] transition-colors disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Add University"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Country filter pills ───────────────────────────────────────────────────
const FILTER_COUNTRIES = ["All", "United Kingdom", "United States", "Canada", "Australia", "Germany", "Singapore"];

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function Universities() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("All");
  const [applying, setApplying] = useState<University | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const { data, isLoading, error } = useListUniversities({
    query: { queryKey: getListUniversitiesQueryKey() },
  });

  const universities: University[] = (data as any)?.universities ?? [];

  const filtered = universities.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      u.name.toLowerCase().includes(q) ||
      u.country.toLowerCase().includes(q) ||
      u.course.toLowerCase().includes(q);
    const matchCountry = countryFilter === "All" || u.country === countryFilter;
    return matchSearch && matchCountry;
  });

  function handleApplyClick(u: University) {
    if (!auth.isLoggedIn()) { navigate("/login"); return; }
    setApplying(u);
  }

  function handleAddClick() {
    if (!auth.isLoggedIn()) { navigate("/login"); return; }
    setShowAdd(true);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-1">Explore Universities</h1>
          <p className="text-muted-foreground text-sm">
            {universities.length} programs across our global network
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="inline-flex items-center gap-2 bg-[hsl(43,100%,50%)] text-[hsl(222,47%,11%)] font-bold px-5 py-2.5 rounded-lg hover:brightness-110 transition-all text-sm shadow-sm whitespace-nowrap"
        >
          <span className="text-base">＋</span> Add University
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, country, or course..."
          className="flex-1 max-w-lg px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(222,47%,11%)]"
        />
      </div>

      {/* Country pills */}
      <div className="flex flex-wrap gap-2 mb-7">
        {FILTER_COUNTRIES.map((c) => (
          <button
            key={c}
            onClick={() => setCountryFilter(c)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              countryFilter === c
                ? "bg-[hsl(222,47%,11%)] text-white border-[hsl(222,47%,11%)]"
                : "bg-white text-muted-foreground border-border hover:border-[hsl(222,47%,11%)] hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse h-44" />
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-20 text-muted-foreground">Failed to load universities.</div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-muted-foreground">No universities match your search.</p>
          {search || countryFilter !== "All" ? (
            <button
              onClick={() => { setSearch(""); setCountryFilter("All"); }}
              className="mt-3 text-sm text-[hsl(180,100%,25%)] hover:underline"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      )}

      {/* University cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((u) => (
          <div
            key={u._id}
            className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-[hsl(180,100%,25%)] transition-all group"
          >
            <div className="h-1.5 bg-gradient-to-r from-[hsl(222,47%,11%)] to-[hsl(180,100%,25%)]" />
            <div className="p-5">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="font-semibold text-foreground leading-snug text-sm">{u.name}</h3>
                <span className="shrink-0 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full whitespace-nowrap">
                  {u.country}
                </span>
              </div>
              <p className="text-sm text-[hsl(180,100%,25%)] font-medium mb-2">{u.course}</p>
              {u.description && (
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">{u.description}</p>
              )}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                <span className="text-sm font-bold text-foreground">
                  <span className="text-muted-foreground font-normal text-xs">Fee </span>
                  <span className="text-[hsl(43,100%,38%)]">${u.applicationFee}</span>
                </span>
                <button
                  onClick={() => handleApplyClick(u)}
                  className="text-xs bg-[hsl(222,47%,11%)] text-white px-4 py-1.5 rounded-lg hover:bg-[hsl(222,47%,17%)] transition-colors font-medium"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {applying && <ApplyModal university={applying} onClose={() => setApplying(null)} />}
      {showAdd && <AddUniversityModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
