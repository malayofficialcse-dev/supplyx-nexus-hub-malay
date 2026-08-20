import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  Award,
  MessageSquarePlus,
  AlertCircle,
  TrendingDown,
  Clock,
  CheckCircle2,
  SlidersHorizontal,
  DollarSign,
  Zap,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { CrudPage } from "@/components/CrudPage";
import { Button } from "@/components/kit/Button";
import type { Row } from "@/components/kit/DataTable";
import { Field, Input, Select, Textarea } from "@/components/kit/Input";
import { Modal } from "@/components/kit/Modal";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { DEPARTMENTS, col, STATUS } from "@/lib/scm";

export const Route = createFileRoute("/rfqs")({
  head: () => ({
    meta: [
      { title: "RFQs & Sourcing Events — SupplyX SCM" },
      { name: "description", content: "Run sourcing events: collect supplier quotes and award business." },
      { property: "og:title", content: "RFQs & Sourcing Events — SupplyX SCM" },
      { property: "og:description", content: "Run sourcing events: collect supplier quotes and award business." },
    ],
  }),
  component: RfqsPage,
});

function RfqsPage() {
  const qc = useQueryClient();
  const [quoteFor, setQuoteFor] = React.useState<Row | null>(null);
  const [quote, setQuote] = React.useState({
    vendor: "",
    amount: "",
    unitPrice: "",
    leadTimeDays: "7",
    validUntil: "",
    notes: "",
  });
  const [awardFor, setAwardFor] = React.useState<Row | null>(null);
  const [awardVendor, setAwardVendor] = React.useState("");
  const [sortBy, setSortBy] = React.useState<"cost" | "leadTime" | "vendor">("cost");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["/rfqs"] });

  const addQuote = useMutation({
    mutationFn: async () =>
      api.post(`/rfqs/${String(quoteFor?.["id"])}/quotes`, {
        vendor: quote.vendor,
        amount: Number(quote.amount || 0),
        unitPrice: Number(quote.unitPrice || 0),
        leadTimeDays: Number(quote.leadTimeDays || 0),
        validUntil: quote.validUntil || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        notes: quote.notes,
        submittedAt: new Date().toISOString(),
      }),
    onSuccess: () => {
      toast.success("Supplier quote recorded in sourcing matrix");
      setQuoteFor(null);
      setQuote({ vendor: "", amount: "", unitPrice: "", leadTimeDays: "7", validUntil: "", notes: "" });
      void invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const award = useMutation({
    mutationFn: async () =>
      api.post(`/rfqs/${String(awardFor?.["id"])}/award`, { vendor: awardVendor }),
    onSuccess: () => {
      toast.success("Sourcing event awarded — Purchase Order generated!");
      setAwardFor(null);
      setAwardVendor("");
      void invalidate();
      void qc.invalidateQueries({ queryKey: ["/orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <CrudPage
        title="RFQs & Bidding Events"
        description="Run sourcing events, record vendor quotations, and evaluate side-by-side bids to award Purchase Orders."
        endpoint="/rfqs"
        exportName="rfqs"
        labelKey="rfqId"
        createLabel="New RFQ"
        updateMethod="patch"
        filters={[
          { key: "status", label: "Status" },
          { key: "department", label: "Department" },
        ]}
        searchKeys={["rfqId", "title", "department", "status"]}
        columns={[
          col.code("rfqId", "RFQ"),
          col.text("title", "Title"),
          col.text("department", "Department"),
          col.date("deadline", "Deadline"),
          col.num("vendorCount", "Bids Received"),
          col.items(),
          col.status(),
        ]}
        fields={[
          { name: "rfqId", label: "RFQ ID", required: true, placeholder: "RFQ-7001" },
          { name: "title", label: "Title", required: true },
          { name: "department", label: "Department", type: "select", options: DEPARTMENTS, required: true },
          { name: "deadline", label: "Response deadline", type: "date", required: true },
          { name: "status", label: "Status", type: "select", options: STATUS.rfq, required: true, defaultValue: "Open" },
          { name: "vendorCount", label: "Invited vendors", type: "number" },
          { name: "items", label: "Scope lines", type: "items", required: true },
        ]}
        rowActionsExtra={(row) => {
          const isClosed = String(row["status"]).toLowerCase() === "closed";
          return (
            <>
              {!isClosed && (
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => {
                    setQuoteFor(row);
                    setQuote({
                      vendor: "",
                      amount: "",
                      unitPrice: "",
                      leadTimeDays: "7",
                      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
                      notes: "",
                    });
                  }}
                  title="Add Supplier Quote / Bid"
                >
                  <MessageSquarePlus className="h-3.5 w-3.5" />
                  Add Quote
                </Button>
              )}
              <Button
                variant="subtle"
                size="sm"
                onClick={() => setAwardFor(row)}
                title="Open Quote Comparison Matrix & Award"
                className="text-primary font-medium"
              >
                <Award className="h-3.5 w-3.5 text-primary" />
                Compare & Award
              </Button>
            </>
          );
        }}
      />

      {/* Add Supplier Quote Modal */}
      <Modal
        open={!!quoteFor}
        onOpenChange={(o) => !o && setQuoteFor(null)}
        title="Record Vendor Quote / Bid"
        description={`Record formal quote submission for ${String(quoteFor?.["rfqId"] ?? "")}`}
        width="md"
        footer={
          <>
            <Button onClick={() => setQuoteFor(null)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={addQuote.isPending || !quote.vendor.trim() || !quote.amount}
              onClick={() => addQuote.mutate()}
            >
              {addQuote.isPending ? "Recording Quote…" : "Save Quote to Matrix"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Vendor / Supplier Name" required>
            <Input
              placeholder="e.g. Apex Industrial Supplies"
              value={quote.vendor}
              onChange={(e) => setQuote({ ...quote, vendor: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Total Bid Amount (USD)" required>
              <Input
                type="number"
                placeholder="0.00"
                value={quote.amount}
                onChange={(e) => setQuote({ ...quote, amount: e.target.value })}
              />
            </Field>
            <Field label="Unit Price ($)">
              <Input
                type="number"
                placeholder="0.00"
                value={quote.unitPrice}
                onChange={(e) => setQuote({ ...quote, unitPrice: e.target.value })}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Lead Time (Days)" required>
              <Input
                type="number"
                placeholder="7"
                value={quote.leadTimeDays}
                onChange={(e) => setQuote({ ...quote, leadTimeDays: e.target.value })}
              />
            </Field>
            <Field label="Quote Valid Until">
              <Input
                type="date"
                value={quote.validUntil}
                onChange={(e) => setQuote({ ...quote, validUntil: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Terms, Warranty & Bidding Notes">
            <Textarea
              placeholder="e.g. Net-30 payment terms, 2-year warranty included, CIF shipping"
              value={quote.notes}
              onChange={(e) => setQuote({ ...quote, notes: e.target.value })}
            />
          </Field>
        </div>
      </Modal>

      {/* Sourcing Matrix / Side-by-Side Comparison & Award Modal */}
      <Modal
        open={!!awardFor}
        onOpenChange={(o) => !o && setAwardFor(null)}
        title="RFQ Vendor Quote Comparison Matrix"
        description={`Side-by-side evaluation of submitted bids for ${String(awardFor?.["rfqId"] ?? "")} — ${String(awardFor?.["title"] ?? "")}`}
        width="lg"
        footer={<Button onClick={() => setAwardFor(null)}>Close Matrix</Button>}
      >
        <div className="space-y-4">
          {(() => {
            const rawItems = (awardFor?.["items"] as any) || {};
            const quotes: any[] = Array.isArray(rawItems.quotes) ? rawItems.quotes : [];

            if (quotes.length === 0) {
              return (
                <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-xs text-muted-foreground">
                  <Award className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="font-semibold text-foreground text-sm">No Supplier Quotes Recorded</p>
                  <p className="mt-1 text-muted-foreground">
                    Click <strong>Add Quote</strong> on the RFQ row to log vendor bids and compare them side-by-side.
                  </p>
                </div>
              );
            }

            const amounts = quotes.map((q) => Number(q.amount ?? 0)).filter((a) => a > 0);
            const leadTimes = quotes.map((q) => Number(q.leadTimeDays ?? q.leadTime ?? 999));
            const lowestAmount = amounts.length > 0 ? Math.min(...amounts) : 0;
            const highestAmount = amounts.length > 0 ? Math.max(...amounts) : 0;
            const fastestLeadTime = leadTimes.length > 0 ? Math.min(...leadTimes) : 0;
            const avgAmount = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0;
            const isClosed = String(awardFor?.["status"]).toLowerCase() === "closed";

            // Sort quotes
            const sortedQuotes = [...quotes].sort((a, b) => {
              if (sortBy === "cost") return Number(a.amount ?? 0) - Number(b.amount ?? 0);
              if (sortBy === "leadTime") return (Number(a.leadTimeDays || 0)) - (Number(b.leadTimeDays || 0));
              return String(a.vendor || a.supplier).localeCompare(String(b.vendor || b.supplier));
            });

            return (
              <>
                {/* KPI Sourcing Summary Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-sm border border-border bg-muted/30 p-3">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Lowest Bid</span>
                    <div className="text-base font-bold text-emerald-600 font-mono mt-0.5">
                      {formatCurrency(lowestAmount)}
                    </div>
                    {highestAmount > lowestAmount && (
                      <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 mt-0.5">
                        <TrendingDown className="h-3 w-3" /> Save {formatCurrency(highestAmount - lowestAmount)} vs max
                      </span>
                    )}
                  </div>
                  <div className="rounded-sm border border-border bg-muted/30 p-3">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Fastest Lead Time</span>
                    <div className="text-base font-bold text-foreground font-mono mt-0.5">
                      {fastestLeadTime} days
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-0.5 block">
                      {quotes.length} total vendor quotes
                    </span>
                  </div>
                  <div className="rounded-sm border border-border bg-muted/30 p-3">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Average Bid</span>
                    <div className="text-base font-bold text-foreground font-mono mt-0.5">
                      {formatCurrency(avgAmount)}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-0.5 block">
                      Status: {String(awardFor?.["status"])}
                    </span>
                  </div>
                </div>

                {/* Sorter bar */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    Vendor Quotes ({quotes.length})
                  </span>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-muted-foreground text-[11px]">Sort by:</span>
                    <button
                      type="button"
                      onClick={() => setSortBy("cost")}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        sortBy === "cost" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      Cost (Lowest)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSortBy("leadTime")}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        sortBy === "leadTime" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      Lead Time
                    </button>
                    <button
                      type="button"
                      onClick={() => setSortBy("vendor")}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        sortBy === "vendor" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      Vendor
                    </button>
                  </div>
                </div>

                {/* Comparison Table */}
                <div className="overflow-hidden rounded border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-border bg-muted text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="p-3">Vendor / Bidder</th>
                        <th className="p-3 text-right">Quoted Amount</th>
                        <th className="p-3 text-right">Lead Time</th>
                        <th className="p-3">Validity / Notes</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {sortedQuotes.map((q: any, idx: number) => {
                        const amount = Number(q.amount ?? 0);
                        const leadTime = Number(q.leadTimeDays ?? q.leadTime ?? 0);
                        const isLowest = amount === lowestAmount && amount > 0;
                        const isFastest = leadTime === fastestLeadTime && leadTime > 0;

                        return (
                          <tr
                            key={idx}
                            className={`transition-colors hover:bg-muted/40 ${isLowest ? "bg-emerald-500/5" : ""}`}
                          >
                            <td className="p-3">
                              <div className="font-semibold text-foreground flex items-center gap-1.5">
                                {String(q.vendor || q.supplier || "—")}
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                {isLowest && (
                                  <span className="inline-flex rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600">
                                    LOWEST BID
                                  </span>
                                )}
                                {isFastest && (
                                  <span className="inline-flex rounded bg-sky-500/10 px-1.5 py-0.5 text-[9px] font-bold text-sky-600">
                                    FASTEST ({leadTime}d)
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-foreground">
                              {formatCurrency(amount)}
                              {q.unitPrice ? (
                                <div className="text-[10px] font-normal text-muted-foreground">
                                  @ {formatCurrency(Number(q.unitPrice))}/unit
                                </div>
                              ) : null}
                            </td>
                            <td className="p-3 text-right text-muted-foreground">
                              <span className="font-semibold text-foreground">{leadTime}</span> days
                            </td>
                            <td className="max-w-[200px] p-3 text-muted-foreground">
                              <div className="truncate text-foreground text-[11px]">{String(q.notes || "Standard terms")}</div>
                              {q.validUntil && (
                                <div className="text-[10px] text-muted-foreground">Valid to: {formatDate(q.validUntil)}</div>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <Button
                                variant={isLowest ? "primary" : "secondary"}
                                size="sm"
                                disabled={award.isPending || isClosed}
                                onClick={() => {
                                  setAwardVendor(String(q.vendor || q.supplier));
                                  setTimeout(() => award.mutate(), 50);
                                }}
                                title={isClosed ? "RFQ Closed" : "Award Purchase Order to this vendor"}
                              >
                                {award.isPending ? "Awarding…" : isClosed ? "Closed" : "Award PO"}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-start gap-2 rounded bg-amber-500/10 p-3 text-[11px] text-amber-700">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    Awarding a bid will automatically <strong>generate a formal Purchase Order</strong> with this supplier,
                    commit the approved order value, and close the sourcing event.
                  </span>
                </div>
              </>
            );
          })()}
        </div>
      </Modal>
    </>
  );
}
