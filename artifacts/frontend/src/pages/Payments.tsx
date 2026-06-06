import { useGetPaymentHistory, getGetPaymentHistoryQueryKey } from "@workspace/api-client-react";
import type { Payment } from "@/lib/api";
import { Link } from "wouter";

const statusColors: Record<string, string> = {
  created: "bg-yellow-100 text-yellow-800 border-yellow-200",
  succeeded: "bg-green-100 text-green-800 border-green-200",
  failed: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels: Record<string, string> = {
  created: "Pending",
  succeeded: "Successful",
  failed: "Failed",
};

export default function Payments() {
  const { data, isLoading } = useGetPaymentHistory({
    query: { queryKey: getGetPaymentHistoryQueryKey() },
  });

  const payments: Payment[] = (data as any)?.payments ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Payment History</h1>
        <p className="text-muted-foreground">All your application fee transactions</p>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse h-24" />
          ))}
        </div>
      )}

      {!isLoading && payments.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-4">No payment history yet.</p>
          <Link href="/applications">
            <span className="inline-block bg-[hsl(222,47%,11%)] text-white font-medium px-6 py-2.5 rounded-lg cursor-pointer text-sm hover:bg-[hsl(222,47%,17%)]">
              Go to Applications
            </span>
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {payments.map((p) => {
          const app = p.application as any;
          const uni = app?.university;
          return (
            <div key={p._id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-foreground">{uni?.name ?? "University"}</h3>
                  <p className="text-sm text-[hsl(180,100%,25%)]">{uni?.course}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(p.createdAt).toLocaleDateString(undefined, {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate max-w-xs">
                    {p.stripePaymentIntentId}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-foreground">
                    ${Number(p.amount).toFixed(2)}
                    <span className="text-xs text-muted-foreground font-normal ml-1">{p.currency.toUpperCase()}</span>
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[p.status]}`}>
                    {statusLabels[p.status]}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {payments.length > 0 && (
        <div className="mt-6 p-4 bg-muted rounded-xl text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total paid</span>
            <span className="font-bold text-foreground">
              ${(payments
                .filter((p) => p.status === "succeeded")
                .reduce((sum, p) => sum + Number(p.amount), 0)
              ).toFixed(2)} USD
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
