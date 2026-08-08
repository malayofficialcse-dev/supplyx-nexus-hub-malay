import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRequisition } from "@/lib/api";

export const Route = createFileRoute("/requisitions")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Create Purchase Requisition - SupplyX" },
      { name: "description", content: "Submit a new purchase requisition with line items, justification, and supporting documents." },
      { property: "og:title", content: "Create Purchase Requisition - SupplyX" },
      { property: "og:description", content: "Submit a new purchase requisition with line items, justification, and supporting documents." },
    ],
  }),
});

const btnGhost =
  "px-4 py-2 rounded font-body-md text-body-md text-on-surface-variant hover:bg-surface-container-high transition-colors";
const btnSecondary =
  "px-4 py-2 rounded bg-surface border border-outline-variant text-on-surface-variant font-body-md text-body-md hover:bg-surface-container transition-colors shadow-[0_1px_3px_rgba(15,23,42,0.04)]";
const btnPrimary =
  "px-4 py-2 rounded bg-primary text-on-primary font-body-md text-body-md font-medium hover:bg-primary/90 transition-colors shadow-[0_1px_3px_rgba(15,23,42,0.04)]";
const formLabel = "font-label-caps text-label-caps text-on-surface-variant uppercase block mb-1";
const formInput =
  "w-full bg-surface border border-outline-variant rounded p-2 text-body-md font-body-md focus:border-primary-container outline-none transition-all";
const formSelect = formInput;
const formTextarea = formInput;

interface LineItem {
  description: string;
  sku: string;
  qty: number;
  price: number;
}

function Page() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [department, setDepartment] = useState("Operations");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", sku: "", qty: 1, price: 0 },
  ]);

  const subtotal = lineItems.reduce((acc, item) => acc + item.qty * item.price, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const mutation = useMutation({
    mutationFn: createRequisition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requisitions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardAnalytics"] });
      navigate({ to: "/" });
    },
  });

  const handleAddItem = () => {
    setLineItems([...lineItems, { description: "", sku: "", qty: 1, price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setLineItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lineItems.some(item => !item.description || item.price <= 0)) {
      alert("Please ensure all line items have a description and a valid price.");
      return;
    }

    // Submit using the primary item description and cumulative total amount
    mutation.mutate({
      department,
      item: lineItems[0].description + (lineItems.length > 1 ? ` (+${lineItems.length - 1} other items)` : ""),
      amount: total,
    });
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <form onSubmit={handleSubmit} className="space-y-stack-lg">
          <div className="mb-stack-lg flex justify-between items-end">
            <div>
              <h1 className="font-page-title text-page-title text-on-surface">Create Purchase Requisition</h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Submit a new request for goods or services.</p>
            </div>
            <div className="flex gap-stack-sm">
              <button className={btnGhost} type="button" onClick={() => navigate({ to: "/" })}>Cancel</button>
              <button className={btnSecondary} type="button">Save Draft</button>
              <button className={btnPrimary} type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Submitting..." : "Submit for Approval"}
              </button>
            </div>
          </div>

          {/* General Information */}
          <section className="bg-white p-container-padding rounded border border-outline-variant shadow-sm">
            <h2 className="font-subsection-heading text-subsection-heading text-on-surface mb-stack-md pb-2 border-b border-outline-variant">General Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              <div>
                <label className={formLabel} htmlFor="requester">Requester</label>
                <input className={`${formInput} bg-surface-container-low text-on-surface-variant cursor-not-allowed`} id="requester" readOnly type="text" defaultValue="John Doe (Operations)" />
              </div>
              <div>
                <label className={formLabel} htmlFor="department">Department</label>
                <select
                  className={formSelect}
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="Operations">Operations</option>
                  <option value="IT Infrastructure">IT Infrastructure</option>
                  <option value="Facilities">Facilities</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
              <div>
                <label className={formLabel} htmlFor="costCenter">Cost Center</label>
                <select className={formSelect} id="costCenter" defaultValue="cc1">
                  <option value="cc1">CC-1001 (Main HQ)</option>
                  <option value="cc2">CC-1002 (Warehouse A)</option>
                  <option value="cc3">CC-1003 (Logistics Hub)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Line Items */}
          <section className="bg-white rounded border border-outline-variant shadow-sm overflow-hidden">
            <div className="p-container-padding pb-0 flex justify-between items-center mb-stack-sm">
              <h2 className="font-subsection-heading text-subsection-heading text-on-surface">Line Items</h2>
              <button
                className={`${btnSecondary} text-sm py-1 px-3 flex items-center gap-1`}
                type="button"
                onClick={handleAddItem}
              >
                <Icon name="add" className="text-[18px]" /> Add Item
              </button>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-y border-outline-variant">
                    <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase w-10">#</th>
                    <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase w-1/3">Item Description</th>
                    <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase w-1/6">SKU / Part No.</th>
                    <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase w-24">Qty</th>
                    <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase w-32">Est. Unit Price</th>
                    <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase w-32">Subtotal</th>
                    <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase w-12 text-center">Act</th>
                  </tr>
                </thead>
                <tbody className="font-body-sm text-body-sm">
                  {lineItems.map((item, index) => (
                    <tr key={index} className="border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors">
                      <td className="py-3 px-4 text-on-surface-variant">{index + 1}</td>
                      <td className="py-2 px-4">
                        <input
                          className={`${formInput} py-1`}
                          placeholder="Describe item..."
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => handleItemChange(index, "description", e.target.value)}
                        />
                      </td>
                      <td className="py-2 px-4">
                        <input
                          className={`${formInput} py-1 font-data-mono text-data-mono`}
                          placeholder="SKU..."
                          type="text"
                          value={item.sku}
                          onChange={(e) => handleItemChange(index, "sku", e.target.value)}
                        />
                      </td>
                      <td className="py-2 px-4">
                        <input
                          className={`${formInput} py-1 text-right`}
                          min={1}
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleItemChange(index, "qty", parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td className="py-2 px-4 flex items-center gap-1">
                        <span className="text-on-surface-variant">$</span>
                        <input
                          className={`${formInput} py-1 text-right`}
                          placeholder="0.00"
                          type="number"
                          step="0.01"
                          required
                          value={item.price || ""}
                          onChange={(e) => handleItemChange(index, "price", parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="py-3 px-4 font-data-mono text-data-mono text-right">
                        ${(item.qty * item.price).toFixed(2)}
                      </td>
                      <td className="py-2 px-4 text-center">
                        <button
                          className="text-on-surface-variant hover:text-error transition-colors disabled:opacity-40"
                          title="Remove"
                          type="button"
                          disabled={lineItems.length === 1}
                          onClick={() => handleRemoveItem(index)}
                        >
                          <Icon name="delete" className="text-[20px]" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-container-padding bg-[#F8FAFC] flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                  <span>Subtotal:</span>
                  <span className="font-data-mono text-data-mono">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                  <span>Estimated Tax (8%):</span>
                  <span className="font-data-mono text-data-mono">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-subsection-heading text-subsection-heading text-on-surface pt-2 border-t border-outline-variant">
                  <span>Total Request:</span>
                  <span className="font-data-mono text-data-mono font-bold">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Justification & Attachments */}
          <section className="bg-white p-container-padding rounded border border-outline-variant shadow-sm">
            <h2 className="font-subsection-heading text-subsection-heading text-on-surface mb-stack-md pb-2 border-b border-outline-variant">Justification &amp; Attachments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              <div>
                <label className={formLabel} htmlFor="justification">Business Justification</label>
                <textarea className={formTextarea} id="justification" placeholder="Explain why these items are necessary for business operations..." rows={4} />
              </div>
              <div>
                <label className={formLabel}>Supporting Documents</label>
                <div className="border-2 border-dashed border-outline-variant rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-surface-container-low transition-colors cursor-pointer h-[112px]">
                  <Icon name="upload_file" className="text-outline text-[24px] mb-2" />
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Drag and drop files here, or <span className="text-primary font-medium">browse</span></p>
                  <p className="font-body-sm text-[11px] text-outline mt-1">PDF, DOCX, JPG up to 10MB</p>
                </div>
              </div>
            </div>
          </section>
        </form>
      </div>
    </AppShell>
  );
}

