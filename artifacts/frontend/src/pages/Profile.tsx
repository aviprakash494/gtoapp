import { useGetProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { auth } from "@/lib/api";
import { useLocation } from "wouter";

export default function Profile() {
  const [, navigate] = useLocation();
  const { data, isLoading } = useGetProfile({
    query: { queryKey: getGetProfileQueryKey() },
  });

  const user = (data as any)?.user;

  function handleLogout() {
    auth.clearToken();
    navigate("/login");
  }

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="bg-card border border-border rounded-xl p-8 animate-pulse h-64" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="font-serif text-3xl font-bold text-foreground mb-6">My Profile</h1>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-[hsl(222,47%,11%)] to-[hsl(43,100%,50%)]" />
        <div className="p-6">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0"
              style={{ background: "linear-gradient(135deg, hsl(222,47%,11%), hsl(180,100%,25%))" }}
            >
              {user?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div>
              <h2 className="font-bold text-xl text-foreground">{user?.name}</h2>
              <p className="text-sm text-muted-foreground">Student</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Email Address
              </label>
              <p className="text-sm text-foreground bg-muted rounded-lg px-3 py-2.5">{user?.email}</p>
            </div>

            {user?.phone && (
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <p className="text-sm text-foreground bg-muted rounded-lg px-3 py-2.5">{user.phone}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Member Since
              </label>
              <p className="text-sm text-foreground bg-muted rounded-lg px-3 py-2.5">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString(undefined, {
                      year: "numeric", month: "long", day: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-border">
            <button
              onClick={handleLogout}
              className="w-full border border-destructive text-destructive py-2.5 rounded-lg text-sm font-medium hover:bg-destructive/5 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
