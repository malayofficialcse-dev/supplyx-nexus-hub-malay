import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createOrder, getContracts } from "@/lib/api";

export const Route = createFileRoute("/orders/new")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Create Purchase Order - SupplyX" },
      { name: "description", content: "Draft a new purchase order from an RFQ, including vendor, shipping, line items and totals." },
      { property: "og:title", content: "Create Purchase Order - SupplyX" },
      { property: "og:description", content: "Draft a new purchase order from an RFQ, including vendor, shipping, line items and totals." },
    ],
  }),
});

interface POLineItem {
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
}

function Page() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: contracts } = useQuery({
    queryKey: ["contracts"],
    queryFn: getContracts,
  });

  const suppliers = contracts?.map((c) => c.supplier) || [];

  const [supplier, setSupplier] = useState("");

  // Auto-select first supplier when contracts load
  if (suppliers.length > 0 && !supplier) {
    setSupplier(suppliers[0]);
  }
  const [deliveryDate, setDeliveryDate] = useState("2026-09-20");
  const [description, setDescription] = useState("Production materials & assembly components");
  const [lineItems, setLineItems] = useState<POLineItem[]>([
    { name: "Industrial Microcontroller V2", sku: "MCU-IND-202", quantity: 1500, unitPrice: 45.00 },
    { name: "Thermal Heat Sink (Aluminum)", sku: "THS-AL-050", quantity: 3000, unitPrice: 12.50 },
  ]);

  const subtotal = lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const shipping = 1250;
  const tax = subtotal * 0.085;
  const grandTotal = subtotal + shipping + tax;

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardAnalytics"] });
      navigate({ to: "/orders" });
    },
  });

  const handleAddItem = () => {
    setLineItems([
      ...lineItems,
      { name: "Standard Structural Component", sku: "COMP-001", quantity: 100, unitPrice: 25.00 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof POLineItem, value: string | number) => {
    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setLineItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier) {
      alert("Please select a vendor.");
      return;
    }

    mutation.mutate({
      supplier,
      amount: grandTotal,
      deliveryDate: new Date(deliveryDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      description,
      items: lineItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    });
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <form onSubmit={handleSubmit}>
          {/* Header Section */}
          <div className="flex justify-between items-end mb-6">
            <div>
              <div className="flex items-center gap-2 text-on-surface-variant mb-1">
                <span className="font-body-sm text-body-sm">From RFQ:</span>
                <span className="font-data-mono text-data-mono bg-surface-container px-2 py-0.5 rounded border border-outline-variant">RFQ-2026-001</span>
              </div>
              <h2 className="font-page-title text-page-title text-on-surface">Purchase Order: Draft</h2>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate({ to: "/orders" })}
                className="px-4 py-2 rounded bg-surface border border-outline-variant text-on-surface-variant font-body-md text-body-md hover:bg-surface-container transition-colors shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="px-4 py-2 rounded bg-[#2563EB] text-white font-body-md text-body-md font-medium hover:bg-blue-700 transition-colors shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
              >
                {mutation.isPending ? "Generating..." : "Generate PO"}
              </button>
            </div>
          </div>
          {/* Layout Grid */}
          <div className="grid grid-cols-12 gap-gutter items-start">
            {/* Left Column: Primary Data */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-stack-lg">
              {/* Vendor Information */}
              <div className="bg-surface rounded-xl border border-outline-variant shadow-[0_1px_3px_rgba(15,23,42,0.04)] p-container-padding flex flex-col gap-stack-md">
                <h3 className="font-subsection-heading text-subsection-heading text-on-surface flex items-center gap-2">
                  <Icon name="factory" fill className="text-primary" />
                  Vendor Details
                </h3>
                <div className="grid grid-cols-2 gap-gutter">
                  <div className="flex flex-col gap-1">
                    <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Select Vendor</label>
                    <select
                      className="w-full bg-surface border border-outline-variant rounded p-2 text-body-md font-body-md focus:border-primary-container outline-none transition-all"
                      value={supplier}
                      onChange={(e) => setSupplier(e.target.value)}
                    >
                      {suppliers.map((s, i) => (
                        <option key={i} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Vendor Contact</label>
                    <input className="w-full bg-surface-container-low border border-outline-variant rounded p-2 text-body-md font-body-md text-on-surface-variant cursor-not-allowed" readOnly type="text" value={`Representative (${supplier})`} />
                  </div>
                </div>
              </div>
              {/* Addresses */}
              <div className="bg-surface rounded-xl border border-outline-variant shadow-[0_1px_3px_rgba(15,23,42,0.04)] p-container-padding flex flex-col gap-stack-md">
                <h3 className="font-subsection-heading text-subsection-heading text-on-surface flex items-center gap-2">
                  <Icon name="local_shipping" fill className="text-primary" />
                  Shipping &amp; Billing
                </h3>
                <div className="grid grid-cols-2 gap-gutter">
                  {/* Shipping */}
                  <div className="border border-outline-variant rounded-lg p-4 bg-surface-bright flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Shipping Address</span>
                    </div>
                    <div className="font-body-md text-body-md text-on-surface leading-relaxed">
                      <strong>SupplyX Central Warehouse (WH-01)</strong><br />
                      1450 Logistics Boulevard<br />
                      Chicago, IL 60607, USA
                    </div>
                  </div>
                  {/* Billing */}
                  <div className="border border-outline-variant rounded-lg p-4 bg-surface-bright flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Billing Address</span>
                    </div>
                    <div className="font-body-md text-body-md text-on-surface leading-relaxed">
                      <strong>SupplyX Corporate Headquarters</strong><br />
                      Accounts Payable Dept<br />
                      New York, NY 10001, USA
                    </div>
                  </div>
                </div>
              </div>
              {/* Line Items Table */}
              <div className="bg-surface rounded-xl border border-outline-variant shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">
                <div className="p-container-padding border-b border-outline-variant flex justify-between items-center bg-surface-bright">
                  <h3 className="font-subsection-heading text-subsection-heading text-on-surface flex items-center gap-2">
                    <Icon name="inventory_2" fill className="text-primary" />
                    Line Items
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 text-primary hover:text-on-primary-fixed-variant transition-colors font-body-sm text-body-sm font-medium"
                  >
                    <Icon name="add" className="text-[18px]" /> Add Item
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant">
                        <th className="p-3 font-label-caps text-label-caps text-on-surface-variant uppercase">Item / SKU</th>
                        <th className="p-3 font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Qty</th>
                        <th className="p-3 font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Unit Price</th>
                        <th className="p-3 font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Ext. Price</th>
                        <th className="p-3 w-10 text-center">Act</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {lineItems.map((item, index) => (
                        <tr key={index} className="hover:bg-surface-bright transition-colors group">
                          <td className="p-3">
                            <input
                              className="w-full border border-outline-variant rounded p-1 text-body-md font-body-md mb-1"
                              placeholder="Item Name"
                              value={item.name}
                              onChange={(e) => handleItemChange(index, "name", e.target.value)}
                            />
                            <input
                              className="w-full border border-outline-variant rounded p-1 font-data-mono text-data-mono text-[11px]"
                              placeholder="SKU"
                              value={item.sku}
                              onChange={(e) => handleItemChange(index, "sku", e.target.value)}
                            />
                          </td>
                          <td className="p-3 text-right">
                            <input
                              className="w-20 border border-outline-variant rounded p-1 text-right text-body-md font-body-md outline-none"
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <span className="text-on-surface-variant">$</span>
                              <input
                                className="w-24 border border-outline-variant rounded p-1 text-right text-data-mono font-data-mono outline-none"
                                type="number"
                                step="0.01"
                                value={item.unitPrice || ""}
                                onChange={(e) => handleItemChange(index, "unitPrice", parseFloat(e.target.value) || 0)}
                              />
                            </div>
                          </td>
                          <td className="p-3 text-right font-data-mono text-data-mono font-medium text-on-surface">
                            ${(item.quantity * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              disabled={lineItems.length === 1}
                              onClick={() => handleRemoveItem(index)}
                              className="text-outline hover:text-error transition-colors disabled:opacity-40"
                            >
                              <Icon name="delete" className="text-[18px]" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {/* Right Column: Settings & Totals */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-stack-lg sticky top-24">
              {/* Logistics & Terms */}
              <div className="bg-surface rounded-xl border border-outline-variant shadow-[0_1px_3px_rgba(15,23,42,0.04)] p-container-padding flex flex-col gap-stack-md">
                <h3 className="font-subsection-heading text-subsection-heading text-on-surface border-b border-outline-variant pb-2">Logistics &amp; Terms</h3>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Expected Delivery Date</label>
                    <input
                      className="w-full bg-surface border border-outline-variant rounded p-2 text-body-md font-body-md focus:border-primary-container outline-none"
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              {/* Order Summary */}
              <div className="bg-surface-bright rounded-xl border border-primary-fixed shadow-[0_1px_3px_rgba(15,23,42,0.04)] p-container-padding flex flex-col gap-stack-md">
                <h3 className="font-subsection-heading text-subsection-heading text-on-surface">Order Summary</h3>
                <div className="flex flex-col gap-2 font-body-md text-body-md border-b border-outline-variant pb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Subtotal</span>
                    <span className="font-data-mono text-data-mono">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Shipping Estimate</span>
                    <span className="font-data-mono text-data-mono">${shipping.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Tax (Calculated at 8.5%)</span>
                    <span className="font-data-mono text-data-mono">${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-section-heading text-section-heading font-bold text-on-surface">Total</span>
                  <span className="font-data-mono text-[20px] font-bold text-primary">${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-outline-variant">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-2 block">Order Description</label>
                  <textarea
                    className="w-full bg-surface border border-outline-variant rounded p-2 text-body-sm font-body-sm focus:border-primary-container outline-none resize-none h-20"
                    placeholder="Add description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

