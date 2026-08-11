import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { useQuery } from "@tanstack/react-query";
import { getInvoiceById, getInvoices, Invoice } from "@/lib/api";

export const Route = createFileRoute("/invoices/detail")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Invoice Details - SupplyX" },
      { name: "description", content: "Review extracted invoice data, line items, and approve or reject for payment." },
      { property: "og:title", content: "Invoice Details - SupplyX" },
      { property: "og:description", content: "Review extracted invoice data, line items, and approve or reject for payment." },
    ],
  }),
});

function Page() {
  const navigate = useNavigate();
  const invoiceId = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("id") : null;

  const invoiceQuery = useQuery<Invoice>({
    queryKey: ["invoice", invoiceId],
    queryFn: () => getInvoiceById(invoiceId ?? ""),
    enabled: Boolean(invoiceId),
  });

  if (!invoiceId) {
    return (
      <AppShell>
        <div className="max-w-7xl mx-auto py-16 text-center">
          <p className="font-page-title text-page-title text-error">No invoice selected.</p>
          <p className="mt-3 text-body-md text-on-surface-variant">Please return to the invoice list and choose an invoice to view details.</p>
        </div>
      </AppShell>
    );
  }

  if (invoiceQuery.isLoading) {
    return (
      <AppShell>
        <div className="max-w-7xl mx-auto py-16 text-center text-on-surface-variant">Loading invoice details...</div>
      </AppShell>
    );
  }

  if (invoiceQuery.isError || !invoiceQuery.data) {
    return (
      <AppShell>
        <div className="max-w-7xl mx-auto py-16 text-center">
          <p className="font-page-title text-page-title text-error">Unable to load invoice details.</p>
          <p className="mt-3 text-body-md text-on-surface-variant">Please go back to the invoice list and try again.</p>
        </div>
      </AppShell>
    );
  }

  const invoice = invoiceQuery.data;

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-stack-lg">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate({ to: "/invoices" })}
              className="w-10 h-10 rounded-lg flex items-center justify-center border border-outline-variant hover:bg-surface-container-low transition-colors text-on-surface-variant bg-surface"
            >
              <Icon name="arrow_back" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-page-title text-page-title text-on-surface">
                  Invoice #{isLoading ? "..." : invoice.invoiceId}
                </h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm font-label-caps text-[11px] uppercase tracking-wider border ${
                  invoice.status === "Paid"
                    ? "bg-[#DCFCE7] text-[#16A34A] border-[#bbf7d0]"
                    : invoice.status === "Overdue"
                      ? "bg-[#FEE2E2] text-[#DC2626] border-[#fecaca]"
                      : "bg-surface-variant text-on-surface-variant border-outline-variant"
                }`}>
                  {invoice.status}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 flex items-center gap-2">
                Supplier: <span className="font-medium text-on-surface">{invoice.supplier}</span>
                <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                Date: <span className="font-data-mono text-data-mono text-on-surface">{invoice.date}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-surface text-on-surface border border-outline-variant rounded-lg font-body-md text-body-md font-medium hover:bg-surface-container-low transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <Icon name="share" className="text-[18px]" />
              Share
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-surface text-on-surface border border-outline-variant rounded-lg font-body-md text-body-md font-medium hover:bg-surface-container-low transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <Icon name="download" className="text-[18px]" />
              Download PDF
            </button>
          </div>
        </div>
        {/* Side-by-Side Layout Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter h-[calc(100vh-220px)] min-h-[700px]">
          {/* Left Panel: Digital Invoice Preview (7 Columns) */}
          <section className="xl:col-span-7 flex flex-col bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            {/* Toolbar for Document */}
            <div className="h-12 border-b border-outline-variant bg-surface-container-low flex items-center justify-between px-4 shrink-0">
              <div className="flex items-center gap-2">
                <Icon name="description" className="text-on-surface-variant text-[20px]" />
                <span className="font-body-sm text-body-sm font-medium text-on-surface">
                  Original Document
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant ml-2">
                  (Page 1 of 2)
                </span>
              </div>
              <div className="flex items-center gap-1 bg-surface border border-outline-variant rounded-md overflow-hidden">
                <button
                  className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors border-r border-outline-variant"
                  title="Zoom Out"
                >
                  <Icon name="zoom_out" className="text-[18px]" />
                </button>
                <span className="px-3 font-data-mono text-data-mono text-on-surface text-[12px]">
                  100%
                </span>
                <button
                  className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors border-l border-outline-variant"
                  title="Zoom In"
                >
                  <Icon name="zoom_in" className="text-[18px]" />
                </button>
                <button
                  className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors border-l border-outline-variant"
                  title="Fit to Width"
                >
                  <Icon name="fit_screen" className="text-[18px]" />
                </button>
              </div>
            </div>
            {/* Document Viewer Canvas */}
            <div className="flex-1 bg-surface-container-highest overflow-auto p-6 relative custom-scrollbar flex justify-center pdf-overlay">
              <div className="w-full max-w-[800px] h-fit bg-surface shadow-md relative group border border-outline-variant border-opacity-50">
                <div
                  className="bg-cover bg-top w-full aspect-[1/1.414]"
                  role="img"
                  aria-label="A highly detailed, professional digital rendering of a scanned corporate invoice document displayed straight-on. The invoice contains neat rows of tabular data, typical corporate business letterhead at the top right, an 'INVOICE' title in large sans-serif font, a barcode, and official-looking subtle digital stamps. The document is white with mostly black text and subtle blue header backgrounds for tables. The lighting is crisp and even, simulating a high-quality scanner output. The overall aesthetic is clean, corporate, modern, and realistic, fitting seamlessly into an enterprise verification workflow interface."
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAiqQqNXfWKw_Me_8ZAcif9E4GwQ6hYiXr1rbIEuofVR6-ky9Ms0ogDyQLMyozqGkdbMlC4r4Tvkav-3ys_xMzl5ZP1_ARzgbGGBPTbF5KjLyXcMj-GKgfTkYYfvi_UBF99yRlD5JiEzfBij439vD3QevskuxtCGG1FVPUFoJPM5pbV3Zfwerux3faqNqK1zNy0ISxWdexed9RQdX3dw_yrLc-MlwBUWxaBhgVxQasG7IvMonfJn0c')",
                  }}
                ></div>
                <div className="absolute top-[15%] right-[10%] w-[20%] h-[3%] border-2 border-tertiary-container bg-tertiary-container bg-opacity-10 rounded-sm cursor-help opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Icon name="check" className="text-tertiary-container text-[14px]" />
                </div>
                <div className="absolute top-[45%] left-[5%] w-[90%] h-[20%] border-2 border-primary-container bg-primary-container bg-opacity-5 rounded-sm cursor-help opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
          </section>
          {/* Right Panel: Extracted Data & Actions (5 Columns) */}
          <section className="xl:col-span-5 flex flex-col gap-stack-md h-full relative">
            {/* Scrollable Data Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-24 flex flex-col gap-stack-md">
              {/* Header / Warning Info */}
              <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex gap-3 shadow-[0_1px_3px_rgba(15,23,42,0.02)]">
                <Icon name="info" className="text-primary-container mt-0.5" />
                <div>
                  <h3 className="font-subsection-heading text-subsection-heading text-on-surface">
                    Verification Required
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">
                    AI has successfully extracted the data, but human review is recommended for invoices exceeding $50k before final approval workflow.
                  </p>
                </div>
              </div>
              {/* Bento Grid for Key Meta Data */}
              <div className="grid grid-cols-2 gap-stack-sm">
                {/* Vendor Details */}
                <div className="col-span-2 bg-surface border border-outline-variant rounded-xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] relative group">
                  <div className="absolute top-4 right-4 text-tertiary-container opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon name="verified" className="text-[18px]" />
                  </div>
                  <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-3">
                    Vendor Details
                  </h4>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-secondary-container rounded flex items-center justify-center text-on-secondary-container font-bold text-lg">
                      AE
                    </div>
                    <div>
                      <p className="font-subsection-heading text-[15px] text-on-surface font-semibold leading-tight">
                        Acme Electronics Corp.
                      </p>
                      <p className="font-data-mono text-[12px] text-on-surface-variant mt-0.5">
                        ID: VEND-88392
                      </p>
                    </div>
                  </div>
                  <div className="text-body-sm text-on-surface-variant leading-tight">
                    1294 Technology Blvd, Suite 400
                    <br />
                    San Jose, CA 95110
                    <br />
                    <span className="font-data-mono text-[12px] mt-1 block">TIN: 94-XXXXXX</span>
                  </div>
                </div>
                {/* Dates & Terms */}
                <div className="bg-surface border border-outline-variant rounded-xl p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                  <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-3">
                    Timeline
                  </h4>
                  <div className="flex flex-col gap-3">
                    <div>
                      <span className="block font-body-sm text-[12px] text-on-surface-variant">
                        Invoice Date
                      </span>
                      <span className="block font-data-mono text-data-mono text-on-surface font-medium mt-0.5">
                        2023-10-22
                      </span>
                    </div>
                    <div>
                      <span className="block font-body-sm text-[12px] text-on-surface-variant">
                        Due Date
                      </span>
                      <span className="block font-data-mono text-data-mono text-error font-medium mt-0.5">
                        {invoice.date}
                      </span>
                    </div>
                    <div>
                      <span className="block font-body-sm text-[12px] text-on-surface-variant">
                        Terms
                      </span>
                      <span className="block font-body-sm text-body-sm text-on-surface mt-0.5">
                        Net 30
                      </span>
                    </div>
                  </div>
                </div>
                {/* Financial Summary */}
                <div className="bg-surface border border-outline-variant rounded-xl p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col justify-between">
                  <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-3">
                    Totals
                  </h4>
                  {(() => {
                    const subtotal = invoice.items.reduce((s: number, it: {description: string; amount: number}) => s + it.amount, 0);
                    const tax = Math.round(subtotal * 0.085);
                    const shipping = 450;
                    const total = subtotal + tax + shipping;
                    return (
                      <div className="flex flex-col gap-2 w-full">
                        <div className="flex justify-between items-center w-full">
                          <span className="font-body-sm text-[12px] text-on-surface-variant">Subtotal</span>
                          <span className="font-data-mono text-data-mono text-on-surface">${subtotal.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
                        </div>
                        <div className="flex justify-between items-center w-full">
                          <span className="font-body-sm text-[12px] text-on-surface-variant">Tax (8.5%)</span>
                          <span className="font-data-mono text-data-mono text-on-surface">${tax.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
                        </div>
                        <div className="flex justify-between items-center w-full">
                          <span className="font-body-sm text-[12px] text-on-surface-variant">Shipping</span>
                          <span className="font-data-mono text-data-mono text-on-surface">$450.00</span>
                        </div>
                        <div className="border-t border-outline-variant pt-2 mt-1 flex justify-between items-end w-full">
                          <span className="font-body-md text-on-surface font-semibold">Total</span>
                          <span className="font-data-mono text-[18px] font-bold text-on-surface">
                            ${total.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
              {/* Line Items Table */}
              <div className="bg-surface border border-outline-variant rounded-xl shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
                  <h4 className="font-subsection-heading text-[15px] text-on-surface">
                    Invoice Line Items
                  </h4>
                  <span className="bg-surface-container-high text-primary px-2 py-0.5 rounded text-[11px] font-bold">
                    {invoice.items.length} {invoice.items.length === 1 ? "Item" : "Items"}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant">
                        <th className="py-2 px-4 font-label-caps text-[11px] text-on-surface-variant font-medium uppercase tracking-wider w-[5%]">#</th>
                        <th className="py-2 px-4 font-label-caps text-[11px] text-on-surface-variant font-medium uppercase tracking-wider w-[60%]">Description</th>
                        <th className="py-2 px-4 font-label-caps text-[11px] text-on-surface-variant font-medium uppercase tracking-wider text-right w-[35%]">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="font-data-mono text-[12px] text-on-surface">
                      {invoice.items.map((item: {description: string; amount: number}, idx: number) => (
                        <tr key={idx} className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                          <td className="py-2.5 px-4 text-on-surface-variant">{idx + 1}</td>
                          <td className="py-2.5 px-4 font-body-sm">{item.description}</td>
                          <td className="py-2.5 px-4 text-right font-medium">${item.amount.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Related Documents (3-way Matching logic) */}
              <div className="bg-surface border border-outline-variant rounded-xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-4">
                  Related Documents (3-Way Match)
                </h4>
                <div className="flex flex-col gap-3">
                  {/* PO Link */}
                  <a
                    className="flex items-center justify-between p-3 border border-outline-variant rounded-lg hover:border-primary hover:bg-surface-container-low transition-all group"
                    href="#"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-surface-container-highest rounded flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                        <Icon name="shopping_cart" className="text-[18px]" />
                      </div>
                      <div>
                        <p className="font-subsection-heading text-[14px] text-on-surface">
                          Invoice <span className="font-data-mono font-normal">#{invoice.invoiceId}</span>
                        </p>
                        <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5 flex items-center gap-2">
                          Status:{" "}
                          <span className="text-tertiary-container flex items-center gap-1">
                            <Icon name="check_circle" className="text-[14px]" /> {invoice.status}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block font-data-mono text-[13px] text-on-surface">
                        ${invoice.amount.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}
                      </span>
                      <span className="block font-body-sm text-[11px] text-tertiary-container font-medium mt-0.5">
                        3-Way Match Pending
                      </span>
                    </div>
                  </a>
                  {/* Goods Receipt Link */}
                  <a
                    className="flex items-center justify-between p-3 border border-outline-variant rounded-lg hover:border-primary hover:bg-surface-container-low transition-all group"
                    href="#"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-surface-container-highest rounded flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                        <Icon name="inventory" className="text-[18px]" />
                      </div>
                      <div>
                        <p className="font-subsection-heading text-[14px] text-on-surface">
                          Goods Receipt <span className="font-data-mono font-normal">#GR-4022</span>
                        </p>
                        <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5 flex items-center gap-2">
                          Received by: J. Smith on Oct 23
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block font-data-mono text-[13px] text-on-surface">
                        350 Units
                      </span>
                      <span className="block font-body-sm text-[11px] text-tertiary-container font-medium mt-0.5">
                        Fully Received
                      </span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
            {/* Sticky Action Bar at the bottom of the right panel */}
            <div className="absolute bottom-0 left-0 w-full bg-surface/95 backdrop-blur-md border-t border-outline-variant p-4 flex items-center justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.03)] rounded-b-xl">
              <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-[12px]">
                <Icon name="account_tree" className="text-[16px]" />
                Workflow: Standard AP
              </div>
              <div className="flex items-center gap-3">
                <button className="px-5 py-2.5 rounded border border-outline-variant bg-surface hover:bg-error-container hover:text-on-error-container hover:border-error-container transition-colors font-body-md text-on-surface font-medium">
                  Reject
                </button>
                <button className="px-6 py-2.5 rounded bg-primary text-on-primary hover:bg-primary-fixed-variant transition-colors font-body-md font-medium shadow-sm flex items-center gap-2">
                  <Icon name="payments" className="text-[18px]" />
                  Approve for Payment
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
