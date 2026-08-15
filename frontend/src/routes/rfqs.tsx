import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Award, MessageSquarePlus, AlertCircle } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { CrudPage } from "@/components/CrudPage";
import { Button } from "@/components/kit/Button";
import type { Row } from "@/components/kit/DataTable";
import { Field, Input, Textarea } from "@/components/kit/Input";
import { Modal } from "@/components/kit/Modal";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { DEPARTMENTS, col, STATUS } from "@/lib/scm";

export const Route = createFileRoute("/rfqs")({
  head: () => ({
    meta: [
      { title: "RFQs — SupplyX SCM" },
      { name: "description", content: "Run sourcing events: collect supplier quotes and award business." },
      { property: "og:title", content: "RFQs — SupplyX SCM" },
      { property: "og:description", content: "Run sourcing events: collect supplier quotes and award business." },
    ],
  }),
  component: RfqsPage,
});

function RfqsPage() {
  const qc = useQueryClient();
  const [quoteFor, setQuoteFor] = React.useState<Row | null>(null);
  const [quote, setQuote] = React.useState({ vendor: "", amount: "", leadTimeDays: "", notes: "" });
  const [awardFor, setAwardFor] = React.useState<Row | null>(null);
  const [awardVendor, setAwardVendor] = React.useState("");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["/rfqs"] });

  const addQuote = useMutation({
    mutationFn: async () =>
      api.post(`/rfqs/${String(quoteFor?.["id"])}/quotes`, {
        vendor: quote.vendor,
        amount: Number(quote.amount || 0),
        leadTimeDays: Number(quote.leadTimeDays || 0),
        notes: quote.notes,
      }),
    onSuccess: () => {
      toast.success("Supplier quote recorded");
      setQuoteFor(null);
      setQuote({ vendor: "", amount: "", leadTimeDays: "", notes: "" });
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
        title="RFQs"
        description="Sourcing events, supplier responses and award decisions."
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
          col.num("vendorCount", "Vendors"),
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
        rowActionsExtra={(row) => (
          <>
            <Button variant="subtle" size="sm" onClick={() => setQuoteFor(row)}>
              <MessageSquarePlus className="h-3.5 w-3.5" />
              Quote
            </Button>
            <Button variant="subtle" size="sm" onClick={() => setAwardFor(row)}>
              <Award className="h-3.5 w-3.5 text-primary" />
              Award
            </Button>
          </>
        )}
      />

      {/* Add Supplier Quote Modal */}
      <Modal
        open={!!quoteFor}
        onOpenChange={(o) => !o && setQuoteFor(null)}
        title="Add Supplier Quote"
        description={`Record a bid response for ${String(quoteFor?.["rfqId"] ?? "")}`}
        width="sm"
        footer={
          <>
            <Button onClick={() => setQuoteFor(null)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={addQuote.isPending || !quote.vendor.trim()}
              onClick={() => addQuote.mutate()}
            >
              {addQuote.isPending ? "Saving…" : "Record Quote"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Vendor / Supplier name" required>
            <Input
              placeholder="e.g. Acme Corporation"
              value={quote.vendor}
              onChange={(e) => setQuote({ ...quote, vendor: e.target.value })}
            />
          </Field>
          <Field label="Quoted amount (USD)" required>
            <Input
              type="number"
              placeholder="0.00"
              value={quote.amount}
              onChange={(e) => setQuote({ ...quote, amount: e.target.value })}
            />
          </Field>
          <Field label="Lead time (days)">
            <Input
              type="number"
              placeholder="7"
              value={quote.leadTimeDays}
              onChange={(e) => setQuote({ ...quote, leadTimeDays: e.target.value })}
            />
          </Field>
          <Field label="Terms / Notes">
            <Textarea
              placeholder="Payment terms, delivery conditions..."
              value={quote.notes}
              onChange={(e) => setQuote({ ...quote, notes: e.target.value })}
            />
          </Field>
        </div>
      </Modal>

      {/* Sourcing Matrix / Award Modal */}
      <Modal
        open={!!awardFor}
        onOpenChange={(o) => !o && setAwardFor(null)}
        title="Sourcing Award Matrix"
        description={`Compare submitted bids and award a Purchase Order for ${String(awardFor?.["rfqId"] ?? "")}`}
        width="lg"
        footer={<Button onClick={() => setAwardFor(null)}>Close</Button>}
      >
        <div className="space-y-4">
          <div className="overflow-hidden rounded border border-border">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3">Vendor / Supplier</th>
                  <th className="p-3 text-right">Bid Amount</th>
                  <th className="p-3 text-right">Lead Time</th>
                  <th className="p-3">Notes</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(() => {
                  const rawItems = (awardFor?.["items"] as any) || {};
                  const quotes: any[] = Array.isArray(rawItems.quotes) ? rawItems.quotes : [];

                  if (quotes.length === 0) {
                    return (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-muted-foreground">
                          No quotes submitted yet. Use the <strong>Quote</strong> button to record supplier bids.
                        </td>
                      </tr>
                    );
                  }

                  // Highlight lowest bid
                  const lowestAmount = Math.min(...quotes.map((q) => Number(q.amount ?? 0)));

                  return quotes.map((q: any, idx: number) => {
                    const amount = Number(q.amount ?? 0);
                    const isLowest = amount === lowestAmount && amount > 0;
                    return (
                      <tr key={idx} className={`transition-colors hover:bg-muted/40 ${isLowest ? "bg-emerald-500/5" : ""}`}>
                        <td className="p-3">
                          <div className="font-semibold text-foreground">{String(q.vendor || q.supplier || "—")}</div>
                          {isLowest && (
                            <span className="mt-0.5 inline-flex rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600">
                              LOWEST BID
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right font-mono font-semibold text-foreground">
                          {formatCurrency(amount)}
                        </td>
                        <td className="p-3 text-right text-muted-foreground">
                          {q.leadTimeDays ?? q.leadTime ?? "N/A"} days
                        </td>
                        <td className="max-w-[180px] truncate p-3 text-muted-foreground">
                          {String(q.notes ?? "—")}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={award.isPending}
                            onClick={() => {
                              setAwardVendor(String(q.vendor || q.supplier));
                              setTimeout(() => award.mutate(), 50);
                            }}
                          >
                            {award.isPending ? "Awarding…" : "Award PO"}
                          </Button>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>

          <div className="flex items-start gap-2 rounded bg-amber-500/10 p-3 text-[11px] text-amber-700">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Awarding a bid will automatically <strong>generate a Purchase Order</strong>, close this sourcing event,
              and mark all other bids as rejected.
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
}
