import { useState } from "react";
import { Link, useRoute } from "wouter";
import { apiClient } from "@/lib/api";
import { useGetApplication, getGetApplicationQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  under_review: "bg-blue-100 text-blue-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function ApplicationDetail() {
  const [, params] = useRoute("/applications/:id");
  const id = params?.id ?? "";
  const qc = useQueryClient();

  const { data, isLoading } = useGetApplication(id, {
    query: { queryKey: getGetApplicationQueryKey(id), enabled: !!id },
  });

  const app = (data as any)?.application;
  const uni = app?.university;

  const [paying, setPaying] = useState(false);
  const [payStep, setPayStep] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [payErr, setPayErr] = useState("");

  async function handlePay() {
    setPaying(true);
    setPayStep("processing");
    try {
      const res = await apiClient.post("/api/payments/create-order", { applicationId: id });
      await new Promise((r) => setTimeout(r, 800));
      await apiClient.post("/api/payments/verify", { paymentIntentId: res.data.paymentIntentId });
      qc.invalidateQueries({ queryKey: getGetApplicationQueryKey(id) });
      setPayStep("done");
    } catch (err: any) {
      setPayErr(err.response?.data?.message || "Payment failed");
      setPayStep("error");
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-card border border-border rounded-xl p-8 animate-pulse h-64" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-muted-foreground">Application not found.</p>
        <Link href="/applications">
          <span className="mt-4 inline-block text-sm text-[hsl(180,100%,25%)] cursor-pointer hover:underline">
            Back to Applications
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <Link href="/applications">
          <span className="text-sm text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-1">
            &larr; Back to Applications
          </span>
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-[hsl(222,47%,11%)] to-[hsl(180,100%,25%)]" />
        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">{uni?.name}</h1>
              <p className="text-[hsl(180,100%,25%)] font-medium mt-0.5">{uni?.course}</p>
              <p className="text-sm text-muted-foreground">{uni?.country}</p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusColors[app.status]}`}>
              {app.status.replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-muted rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-0.5">Application Fee</p>
              <p className="font-bold text-foreground">${uni?.applicationFee} USD</p>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-0.5">Applied On</p>
              <p className="font-bold text-foreground">{new Date(app.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {app.statement && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-foreground mb-2">Personal Statement</h3>
              <p className="text-sm text-muted-foreground leading-relaxed bg-muted rounded-lg p-3">
                {app.statement}
              </p>
            </div>
          )}

          {/* Payment section */}
          <div className="border-t border-border pt-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Payment Status</h3>
            {app.paymentStatus === "paid" ? (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm font-medium">
                <span>✓</span> Application fee paid
              </div>
            ) : payStep === "done" ? (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm font-medium">
                <span>✓</span> Payment successful!
              </div>
            ) : payStep === "error" ? (
              <div className="text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
                {payErr}
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3">
                <span className="text-sm text-orange-800 font-medium">Payment pending — ${uni?.applicationFee} USD</span>
                <button
                  onClick={handlePay}
                  disabled={paying}
                  className="text-xs bg-[hsl(222,47%,11%)] text-white px-4 py-1.5 rounded-lg hover:bg-[hsl(222,47%,17%)] font-medium disabled:opacity-50"
                >
                  {payStep === "processing" ? "Processing..." : "Pay Now"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
