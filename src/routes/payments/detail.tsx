import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { useQuery } from "@tanstack/react-query";
import { getPaymentById, getPayments, Payment, AuditEntry } from "@/lib/api";

export const Route = createFileRoute("/payments/detail")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Payment Details | SupplyX" },
      { name: "description", content: "Transaction summary, invoices settled and audit trail for payment." },
      { property: "og:title", content: "Payment Details | SupplyX" },
      { property: "og:description", content: "Transaction summary, invoices settled and audit trail for payment." },
    ],
  }),
});

function Page() {
  const navigate = useNavigate();
  const paymentId = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("id") : null;

  const paymentQuery = useQuery<Payment>({
    queryKey: ["payment", paymentId],
    queryFn: () => getPaymentById(paymentId ?? ""),
    enabled: Boolean(paymentId),
  });

  if (!paymentId) {
    return (
      <AppShell>
        <div className="max-w-7xl mx-auto py-16 text-center">
          <p className="font-page-title text-page-title text-error">No payment selected.</p>
          <p className="mt-3 text-body-md text-on-surface-variant">Please return to the payment list and choose a transaction to view.</p>
        </div>
      </AppShell>
    );
  }

  if (paymentQuery.isLoading) {
    return (
      <AppShell>
        <div className="max-w-7xl mx-auto py-16 text-center text-on-surface-variant">Loading payment details...</div>
      </AppShell>
    );
  }

  if (paymentQuery.isError || !paymentQuery.data) {
    return (
      <AppShell>
        <div className="max-w-7xl mx-auto py-16 text-center">
          <p className="font-page-title text-page-title text-error">Unable to load payment details.</p>
          <p className="mt-3 text-body-md text-on-surface-variant">Please go back to payments and select a valid transaction.</p>
        </div>
      </AppShell>
    );
  }

  const latestPayment = paymentQuery.data;

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-stack-lg gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => navigate({ to: "/payments" })}
                className="text-on-surface-variant hover:text-primary font-body-sm text-body-sm flex items-center"
              >
                <Icon name="arrow_back" className="text-[16px] mr-1" />
                Back to Payments
              </button>
            </div>
            <h2 className="font-page-title text-page-title text-on-surface flex items-center gap-3">
              Payment #{latestPayment.paymentId}
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium bg-[#DCFCE7] text-[#16A34A] border border-[#bbf7d0]">
                {latestPayment.status}
              </span>
            </h2>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-surface text-primary border border-outline-variant rounded font-body-md text-body-md flex items-center gap-2 hover:bg-surface-container-low transition-colors shadow-sm"
            >
              <Icon name="print" className="text-[18px]" /> Print
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          {/* Left Column (Main Details) */}
          <div className="lg:col-span-2 space-y-gutter">
            {/* Summary Card */}
            <div className="bg-surface rounded-lg border border-outline-variant shadow-sm p-6">
              <h3 className="font-section-heading text-section-heading text-on-surface mb-6">Transaction Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div>
                  <p className="text-on-surface-variant font-body-sm text-body-sm mb-1">Total Amount</p>
                  <p className="font-data-mono text-[24px] font-semibold text-on-surface">
                    {isLoading ? "..." : `$${latestPayment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                  </p>
                </div>
                <div>
                  <p className="text-on-surface-variant font-body-sm text-body-sm mb-1">Payment Method</p>
                  <p className="font-body-md text-body-md font-medium text-on-surface">{latestPayment.method}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant font-body-sm text-body-sm mb-1">Beneficiary</p>
                  <p className="font-body-md text-body-md font-medium text-on-surface">{latestPayment.supplier}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant font-body-sm text-body-sm mb-1">Invoice Ref</p>
                  <p className="font-data-mono text-data-mono text-primary font-medium">{latestPayment.invoiceId}</p>
                </div>
              </div>
            </div>

            {/* Audit Trail Card */}
            <div className="bg-surface rounded-lg border border-outline-variant shadow-sm p-6">
              <h3 className="font-section-heading text-section-heading text-on-surface mb-4">Audit Trail</h3>
              <div className="space-y-4">
                {latestPayment.auditTrail.map((entry: AuditEntry, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-surface-container-low rounded border border-outline-variant">
                    <Icon name="check_circle" className="text-tertiary-container text-[20px]" />
                    <div className="flex-1 flex justify-between items-center text-sm">
                      <div>
                        <span className="font-semibold text-on-surface">{entry.action}</span> by <span className="text-primary">{entry.by}</span>
                      </div>
                      <span className="font-data-mono text-xs text-on-surface-variant">{entry.at}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
