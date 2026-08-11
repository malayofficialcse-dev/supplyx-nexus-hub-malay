import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRFQ, getContracts } from "@/lib/api";

export const Route = createFileRoute("/rfqs/new")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Create New RFQ - SupplyX" },
      { name: "description", content: "Create a new Request for Quotation with line items, terms, and supplier selection." },
      { property: "og:title", content: "Create New RFQ - SupplyX" },
      { property: "og:description", content: "Create a new Request for Quotation with line items, terms, and supplier selection." },
    ],
  }),
});

interface LineItem {
  name: string;
  quantity: number;
  uom: string;
  targetDate: string;
}

function Page() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: contracts } = useQuery({ queryKey: ["contracts"], queryFn: getContracts });

  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("IT Infrastructure");
  const [deadline, setDeadline] = useState("");
  const [terms, setTerms] = useState("");
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([]);
  const [items, setItems] = useState<LineItem[]>([
    { name: "", quantity: 1, uom: "EA", targetDate: "" },
  ]);

  const mutation = useMutation({
    mutationFn: createRFQ,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfqs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardAnalytics"] });
      navigate({ to: "/rfqs" });
    },
  });

  const addItem = () => setItems((prev) => [...prev, { name: "", quantity: 1, uom: "EA", targetDate: "" }]);
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: keyof LineItem, value: string | number) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const toggleSupplier = (id: string) => {
    setSelectedSupplierIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      title,
      department,
      deadline,
      items: items.map((i) => ({ name: i.name, quantity: i.quantity })),
    });
  };

  const suppliers = contracts ?? [];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center gap-2 text-body-sm text-on-surface-variant mb-1">
              <button onClick={() => navigate({ to: "/rfqs" })} className="hover:text-primary transition-colors">Procurement</button>
              <Icon name="chevron_right" className="text-[16px]" />
              <button onClick={() => navigate({ to: "/rfqs" })} className="hover:text-primary transition-colors">RFQs</button>
              <Icon name="chevron_right" className="text-[16px]" />
              <span className="text-on-surface">Create RFQ</span>
            </div>
            <h2 className="font-page-title text-page-title text-on-surface">Create New Request for Quotation</h2>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate({ to: "/rfqs" })}
              className="px-4 py-2 border border-outline-variant bg-surface text-on-surface rounded hover:bg-surface-container-low transition-colors font-body-md text-body-md shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="rfq-form"
              disabled={mutation.isPending}
              className="px-4 py-2 bg-primary-container text-on-primary rounded hover:bg-primary transition-colors font-body-md text-body-md shadow-sm flex items-center gap-2"
            >
              <Icon name="send" className="text-[18px]" />
              {mutation.isPending ? "Sending..." : "Send to Suppliers"}
            </button>
          </div>
        </div>

        <form id="rfq-form" onSubmit={handleSubmit}>
          <div className="grid grid-cols-12 gap-gutter">
            {/* Left Column: Scope & Items */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-gutter">
              {/* Basic Info Card */}
              <section className="bg-surface border border-outline-variant rounded-lg p-container-padding shadow-sm">
                <h3 className="font-section-heading text-section-heading text-on-surface mb-4 border-b border-outline-variant pb-2">RFQ Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase">
                      RFQ Title <span className="text-error">*</span>
                    </label>
                    <input
                      required
                      className="w-full px-3 py-2 border border-outline-variant rounded font-body-md text-body-md focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="e.g., Q3 Office Electronics Procurement"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase">Department</label>
                    <select
                      className="w-full px-3 py-2 border border-outline-variant rounded font-body-md text-body-md focus:border-primary outline-none bg-white"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    >
                      <option>IT Infrastructure</option>
                      <option>Marketing</option>
                      <option>Operations</option>
                      <option>Finance</option>
                      <option>Facilities</option>
                      <option>Logistics</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase">
                      Bidding Deadline <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <Icon name="calendar_today" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]" />
                      <input
                        required
                        className="w-full pl-9 pr-3 py-2 border border-outline-variant rounded font-body-md text-body-md focus:border-primary outline-none transition-all text-on-surface"
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Line Items Card */}
              <section className="bg-surface border border-outline-variant rounded-lg p-container-padding shadow-sm">
                <div className="flex justify-between items-center mb-4 border-b border-outline-variant pb-2">
                  <h3 className="font-section-heading text-section-heading text-on-surface">Line Items</h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-primary font-body-sm text-body-sm flex items-center gap-1 hover:underline"
                  >
                    <Icon name="add" className="text-[16px]" /> Add Item
                  </button>
                </div>
                <div className="overflow-x-auto border border-outline-variant rounded">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-outline-variant">
                        <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase w-10">#</th>
                        <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase">Item Description</th>
                        <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase w-24">Qty</th>
                        <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase w-32">UOM</th>
                        <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase w-32">Target Date</th>
                        <th className="py-2 px-4 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={idx} className="border-b border-outline-variant h-[40px] hover:bg-surface-container-lowest">
                          <td className="py-1 px-4 text-on-surface-variant font-data-mono text-xs">{idx + 1}</td>
                          <td className="py-1 px-4">
                            <input
                              className="w-full bg-transparent border-none p-0 font-body-sm text-body-sm focus:ring-0 outline-none"
                              type="text"
                              placeholder="Enter item name..."
                              value={item.name}
                              onChange={(e) => updateItem(idx, "name", e.target.value)}
                            />
                          </td>
                          <td className="py-1 px-4">
                            <input
                              className="w-full px-2 py-1 border border-outline-variant rounded font-data-mono text-data-mono focus:border-primary outline-none"
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => updateItem(idx, "quantity", parseInt(e.target.value) || 1)}
                            />
                          </td>
                          <td className="py-1 px-4">
                            <select
                              className="w-full px-2 py-1 border border-outline-variant rounded font-body-sm text-body-sm focus:border-primary outline-none bg-white"
                              value={item.uom}
                              onChange={(e) => updateItem(idx, "uom", e.target.value)}
                            >
                              <option>EA</option>
                              <option>BOX</option>
                              <option>KG</option>
                              <option>UNIT</option>
                            </select>
                          </td>
                          <td className="py-1 px-4">
                            <input
                              className="w-full px-2 py-1 border border-outline-variant rounded font-body-sm text-body-sm focus:border-primary outline-none text-on-surface-variant"
                              type="date"
                              value={item.targetDate}
                              onChange={(e) => updateItem(idx, "targetDate", e.target.value)}
                            />
                          </td>
                          <td className="py-1 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => removeItem(idx)}
                              className="text-outline hover:text-error transition-colors"
                            >
                              <Icon name="delete" className="text-[18px]" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 flex justify-between items-center text-body-sm">
                  <span className="text-on-surface-variant">{items.length} {items.length === 1 ? "item" : "items"} total</span>
                </div>
              </section>

              {/* Terms Card */}
              <section className="bg-surface border border-outline-variant rounded-lg p-container-padding shadow-sm">
                <h3 className="font-section-heading text-section-heading text-on-surface mb-4 border-b border-outline-variant pb-2">
                  Requirements &amp; Terms
                </h3>
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase">Terms &amp; Conditions</label>
                  <textarea
                    className="w-full px-3 py-2 border border-outline-variant rounded font-body-md text-body-md focus:border-primary outline-none transition-all resize-y"
                    placeholder="Specify delivery terms, incoterms, or compliance requirements..."
                    rows={3}
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                  />
                </div>
              </section>
            </div>

            {/* Right Column: Supplier Selection */}
            <div className="col-span-12 lg:col-span-4">
              <section className="bg-surface border border-outline-variant rounded-lg shadow-sm flex flex-col sticky top-[80px]">
                <div className="p-container-padding border-b border-outline-variant">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-section-heading text-section-heading text-on-surface">Select Suppliers</h3>
                    <span className="bg-[#EFF6FF] text-primary px-2 py-0.5 rounded-full text-[11px] font-bold">
                      {selectedSupplierIds.length} Selected
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Choose suppliers from your active contracts to invite to bid.
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[400px]">
                  {suppliers.length === 0 ? (
                    <div className="text-center py-6 text-on-surface-variant font-body-sm text-body-sm">
                      Loading suppliers...
                    </div>
                  ) : (
                    suppliers.map((s) => {
                      const isSelected = selectedSupplierIds.includes(s.id);
                      const initials = s.initials || s.supplier.slice(0, 2).toUpperCase();
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleSupplier(s.id)}
                          className={`w-full flex items-center justify-between p-2 rounded hover:bg-surface-container-lowest border transition-colors group ${
                            isSelected
                              ? "border-primary bg-[#EFF6FF]"
                              : "border-outline-variant bg-surface"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs ${
                              isSelected ? "bg-primary text-white" : "bg-[#F8FAFC] border border-outline-variant text-primary"
                            }`}>
                              {initials}
                            </div>
                            <div className="text-left">
                              <p className="font-body-sm text-body-sm text-on-surface font-medium leading-tight">{s.supplier}</p>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                s.status === "Active"
                                  ? "bg-[#DCFCE7] text-[#16A34A] border border-[#bbf7d0]"
                                  : "bg-[#FEF9C3] text-[#CA8A04] border border-[#fef08a]"
                              }`}>{s.status}</span>
                            </div>
                          </div>
                          <Icon
                            name={isSelected ? "check_circle" : "add_circle"}
                            className={`text-[20px] ${isSelected ? "text-primary" : "text-outline opacity-0 group-hover:opacity-100"} transition-opacity`}
                          />
                        </button>
                      );
                    })
                  )}
                </div>
                <div className="p-4 border-t border-outline-variant bg-[#F8FAFC] rounded-b-lg">
                  <div className="flex items-start gap-2">
                    <Icon name="info" className="text-[16px] text-[#CA8A04] mt-0.5" />
                    <p className="text-[11px] text-on-surface-variant leading-tight">
                      Minimum of 3 suppliers recommended to ensure competitive bidding.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
