import { useState } from "react";
import { Link } from "wouter";
import { apiClient, type Application } from "@/lib/api";
import { useListApplications, getListApplicationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  under_review: "bg-blue-100 text-blue-800 border-blue-200",
  accepted: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  under_review: "Under Review",
  accepted: "Accepted",
  rejected: "Rejected",
};

function PayModal({ application, onClose }: { application: Application; onClose: () => void }) {
  const [step, setStep] = useState<"confirm" | "processing" | "done" | "error">("confirm");
  const [intentId, setIntentId] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const qc = useQueryClient();

  async function createOrder() {
    setStep("processing");
    try {
      const res = await apiClient.post("/api/payments/create-order", { applicationId: application._id });
      const pid = res.data.paymentIntentId;
      setIntentId(pid);
      // Simulate payment confirmation
      await new Promise((r) => setTimeout(r, 800));
      await apiClient.post("/api/payments/verify", { paymentIntentId: pid });
      qc.invalidateQueries({ queryKey: getListApplicationsQueryKey() });
      setStep("done");
    } catch (err: any) {
      setErrMsg(err.response?.data?.message || "Payment failed");
      setStep("error");
    }
  }

  const uni = application.university as any;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        {step === "confirm" && (
          <>
            <div className="text-4xl mb-4">💳</div>
            <h3 className="font-bold text-lg mb-1">Pay Application Fee</h3>
            <p className="text-sm text-muted-foreground mb-4">{uni?.name}</p>
            <div className="bg-muted rounded-lg p-3 mb-5 text-sm">
              Amount: <strong className="text-foreground">${uni?.applicationFee} USD</strong>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 border border-border py-2.5 rounded-lg text-sm hover:bg-muted">
                Cancel
              </button>
              <button onClick={createOrder} className="flex-1 bg-[hsl(222,47%,11%)] text-white py-2.5 rounded-lg text-sm font-medium">
                Confirm Payment
              </button>
            </div>
          </>
        )}
        {step === "processing" && (
          <>
            <div className="text-4xl mb-4 animate-spin">⏳</div>
            <p className="font-medium">Processing payment...</p>
          </>
        )}
        {step === "done" && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h3 className="font-bold text-lg mb-1">Payment Successful</h3>
            <p className="text-sm text-muted-foreground mb-4">Your application fee has been paid.</p>
            <button onClick={onClose} className="w-full bg-[hsl(222,47%,11%)] text-white py-2.5 rounded-lg text-sm font-medium">
              Done
            </button>
          </>
        )}
        {step === "error" && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h3 className="font-bold text-lg mb-1">Payment Failed</h3>
            <p className="text-sm text-destructive mb-4">{errMsg}</p>
            <button onClick={onClose} className="w-full border border-border py-2.5 rounded-lg text-sm">
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function Applications() {
  const [paying, setPaying] = useState<Application | null>(null);
  const { data, isLoading } = useListApplications({
    query: { queryKey: getListApplicationsQueryKey() },
  });

  const applications: Application[] = (data as any)?.applications ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">My Applications</h1>
        <p className="text-muted-foreground">Track the status of all your university applications</p>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse h-28" />
          ))}
        </div>
      )}

      {!isLoading && applications.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-4">You haven't applied to any universities yet.</p>
          <Link href="/universities">
            <span className="inline-block bg-[hsl(222,47%,11%)] text-white font-medium px-6 py-2.5 rounded-lg cursor-pointer hover:bg-[hsl(222,47%,17%)] text-sm">
              Browse Universities
            </span>
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {applications.map((app) => {
          const uni = app.university as any;
          return (
            <div
              key={app._id}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-foreground">{uni?.name ?? "University"}</h3>
                    <span className="text-xs text-muted-foreground">{uni?.country}</span>
                  </div>
                  <p className="text-sm text-[hsl(180,100%,25%)] mb-2">{uni?.course}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[app.status]}`}>
                      {statusLabels[app.status]}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${app.paymentStatus === "paid" ? "bg-green-100 text-green-800 border-green-200" : "bg-orange-100 text-orange-800 border-orange-200"}`}>
                      {app.paymentStatus === "paid" ? "Paid" : "Payment Pending"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Applied {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {app.paymentStatus === "unpaid" && (
                    <button
                      onClick={() => setPaying(app)}
                      className="text-xs bg-[hsl(43,100%,50%)] text-[hsl(222,47%,11%)] font-bold px-3 py-1.5 rounded-lg hover:brightness-110 transition-all"
                    >
                      Pay Fee
                    </button>
                  )}
                  <Link href={`/applications/${app._id}`}>
                    <span className="text-xs border border-border px-3 py-1.5 rounded-lg cursor-pointer hover:bg-muted transition-colors">
                      View
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {paying && <PayModal application={paying} onClose={() => setPaying(null)} />}
    </div>
  );
}
