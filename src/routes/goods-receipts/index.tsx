// import { createFileRoute, useNavigate } from "@tanstack/react-router";
// import { AppShell } from "@/components/AppShell";
// import { Icon } from "@/components/Icon";
// import { useEffect, useState } from "react";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { createGoodsReceipt, getOrders } from "@/lib/api";

// export const Route = createFileRoute("/goods-receipts/")({
//   component: Page,
//   head: () => ({
//     meta: [
//       { title: "Goods Receipt | SupplyX" },
//       { name: "description", content: "Log received items against an incoming purchase order." },
//       { property: "og:title", content: "Goods Receipt | SupplyX" },
//       { property: "og:description", content: "Log received items against an incoming purchase order." },
//     ],
//   }),
// });

// function Page() {
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();

//   const { data: orders, isLoading } = useQuery({
//     queryKey: ["orders"],
//     queryFn: getOrders,
//   });

//   const availableOrders = orders || [];
//   const [selectedOrderId, setSelectedOrderId] = useState<string>("");

//   useEffect(() => {
//     if (!selectedOrderId && availableOrders.length > 0) {
//       setSelectedOrderId(availableOrders[0].orderId);
//     }
//   }, [availableOrders, selectedOrderId]);

//   const selectedOrder = availableOrders.find((o) => o.orderId === selectedOrderId);

//   const [receivedQty, setReceivedQty] = useState<number>(0);
//   const [damagedQty, setDamagedQty] = useState<number>(0);
//   const [binLocation, setBinLocation] = useState<string>("A-12-B");
//   const [qualityStatus, setQualityStatus] = useState<string>("Passed Inspection");
//   const [notes, setNotes] = useState<string>("");

//   const mutation = useMutation({
//     mutationFn: createGoodsReceipt,
//     onSuccess: (data) => {
//       queryClient.invalidateQueries({ queryKey: ["goodsReceipts"] });
//       queryClient.invalidateQueries({ queryKey: ["dashboardAnalytics"] });
//       navigate({ to: "/goods-receipts/detail" });
//     },
//   });

//   const handleCompleteReceipt = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedOrder) {
//       return;
//     }

//     const firstItem = selectedOrder.items?.[0];
//     mutation.mutate({
//       orderId: selectedOrder.orderId,
//       supplier: selectedOrder.supplier,
//       deliveryDate: selectedOrder.deliveryDate,
//       status: damagedQty > 0 ? "Partially Received" : "Fully Received",
//       items: [
//         {
//           name: firstItem?.name ?? "Component Batch",
//           receivedQty,
//           expectedQty: firstItem?.quantity ?? receivedQty,
//         },
//       ],
//     });
//   };

//   return (
//     <AppShell>
//       <div className="max-w-4xl mx-auto space-y-stack-lg">
//         {/* Page Header */}
//         <div className="flex justify-between items-end">
//           <div>
//             <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm mb-1">
//               <span className="hover:text-primary cursor-pointer">Inventory</span>
//               <Icon name="chevron_right" className="text-[16px]" />
//               <span className="hover:text-primary cursor-pointer">Receipts</span>
//             </div>
//             <h2 className="font-page-title text-page-title text-on-surface">Goods Receipt</h2>
//           </div>
//           <div>
//             <span className="inline-flex items-center gap-1 bg-surface-container-high text-primary px-3 py-1 rounded font-body-sm text-body-sm">
//               <Icon name="qr_code_scanner" className="text-[16px]" />
//               Scan Barcode
//             </span>
//           </div>
//         </div>

//         {isLoading ? (
//           <div className="bg-surface rounded-xl border border-outline-variant shadow-slight p-container-padding text-center py-20 text-on-surface-variant">
//             Loading purchase orders...
//           </div>
//         ) : availableOrders.length === 0 ? (
//           <div className="bg-surface rounded-xl border border-outline-variant shadow-slight p-container-padding text-center py-20 text-on-surface-variant">
//             No purchase orders are available to receive. Create a purchase order first.
//           </div>
//         ) : (
//           <form onSubmit={handleCompleteReceipt}>
//             {/* Main Form Card */}
//             <div className="bg-surface rounded-xl border border-outline-variant shadow-slight p-container-padding">
//             {/* Reference Section (Read Only context) */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter pb-stack-lg border-b border-outline-variant">
//               <div>
//                 <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">PO Reference</label>
//                 <div className="flex items-center gap-2">
//                   <select
//                     className="font-data-mono text-data-mono text-on-surface bg-surface-container px-2 py-1 rounded border border-outline-variant outline-none"
//                     value={selectedOrderId}
//                     onChange={(e) => {
//                       setSelectedOrderId(e.target.value);
//                       const sel = availableOrders.find((o) => o.orderId === e.target.value);
//                       if (sel && sel.items?.[0]) {
//                         setReceivedQty(sel.items[0].quantity);
//                       }
//                     }}
//                   >
//                     {availableOrders.map((o) => (
//                       <option key={o.id} value={o.orderId}>{o.orderId} - {o.supplier}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//               <div>
//                 <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Expected Delivery</label>
//                 <p className="font-body-md text-body-md text-on-surface">{selectedOrder?.deliveryDate ?? "TBD"}</p>
//               </div>
//               <div>
//                 <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Supplier</label>
//                 <div className="flex items-center gap-2">
//                   <Icon name="factory" className="text-on-surface-variant text-[18px]" />
//                   <p className="font-body-md text-body-md text-on-surface">{selectedOrder?.supplier ?? "Unknown Supplier"}</p>
//                 </div>
//               </div>
//             </div>

//             {/* Line Items Logging */}
//             <div className="pt-stack-lg">
//               <h3 className="font-subsection-heading text-subsection-heading text-on-surface mb-stack-md flex items-center gap-2">
//                 <Icon name="view_list" className="text-primary" />
//                 Receiving Items (1 Item Selected)
//               </h3>
//               {/* Item Card (Active) */}
//               <div className="border border-outline-variant rounded-lg p-stack-md bg-surface-bright relative">
//                 {/* Status Indicator */}
//                 <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-lg"></div>
//                 <div className="flex justify-between items-start mb-stack-md">
//                   <div>
//                     <div className="flex items-center gap-2 mb-1">
//                       <span className="font-data-mono text-data-mono text-on-surface-variant text-[11px]">ORDER: {selectedOrder.orderId}</span>
//                       <span className="bg-[#EFF6FF] text-[#2563EB] text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">
//                         Expected: {(selectedOrder.items as any)?.[0]?.quantity || 500} Units
//                       </span>
//                     </div>
//                     <h4 className="font-body-md text-body-md font-medium text-on-surface">
//                       {(selectedOrder.items as any)?.[0]?.name || "Industrial Component Batch"}
//                     </h4>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-end">
//                   {/* Received Qty */}
//                   <div className="md:col-span-3">
//                     <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Received Qty <span className="text-error">*</span></label>
//                     <input
//                       className="w-full border border-outline-variant rounded p-2 font-data-mono text-data-mono text-on-surface input-focus-ring"
//                       type="number"
//                       value={receivedQty}
//                       onChange={(e) => setReceivedQty(parseInt(e.target.value) || 0)}
//                     />
//                   </div>
//                   {/* Damaged Qty */}
//                   <div className="md:col-span-3">
//                     <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Damaged/Rejected</label>
//                     <input
//                       className="w-full border border-outline-variant rounded p-2 font-data-mono text-data-mono text-error input-focus-ring"
//                       type="number"
//                       value={damagedQty}
//                       onChange={(e) => setDamagedQty(parseInt(e.target.value) || 0)}
//                     />
//                   </div>
//                   {/* Bin Location */}
//                   <div className="md:col-span-3">
//                     <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Bin Location</label>
//                     <div className="relative">
//                       <Icon name="shelves" className="absolute left-2 top-2 text-on-surface-variant text-[18px]" />
//                       <input
//                         className="w-full border border-outline-variant rounded p-2 pl-8 font-data-mono text-data-mono text-on-surface input-focus-ring uppercase"
//                         placeholder="e.g. A-12-B"
//                         type="text"
//                         value={binLocation}
//                         onChange={(e) => setBinLocation(e.target.value)}
//                       />
//                     </div>
//                   </div>
//                   {/* Quality Check */}
//                   <div className="md:col-span-3">
//                     <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Quality Status</label>
//                     <select
//                       className="w-full border border-outline-variant rounded p-2 font-body-sm text-body-sm text-on-surface input-focus-ring bg-white"
//                       value={qualityStatus}
//                       onChange={(e) => setQualityStatus(e.target.value)}
//                     >
//                       <option value="Passed Inspection">Passed Inspection</option>
//                       <option value="Pending QA">Pending QA</option>
//                       <option value="Failed Inspection">Failed - Quarantine</option>
//                     </select>
//                   </div>
//                 </div>
//                 {/* Notes Section (Optional) */}
//                 <div className="mt-stack-md pt-stack-sm border-t border-outline-variant border-dashed">
//                   <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Receiving Notes (Optional)</label>
//                   <textarea
//                     className="w-full border border-outline-variant rounded p-2 font-body-sm text-body-sm text-on-surface input-focus-ring"
//                     placeholder="Add any observations about packaging or transport conditions..."
//                     rows={2}
//                     value={notes}
//                     onChange={(e) => setNotes(e.target.value)}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//           {/* Action Footer */}
//           <div className="flex justify-end gap-3 items-center mt-6">
//             <button
//               type="button"
//               onClick={() => navigate({ to: "/orders" })}
//               className="px-4 py-2 rounded font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container-high transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={mutation.isPending}
//               className="px-6 py-2 bg-[#2563EB] text-white rounded font-body-sm text-body-sm font-medium hover:bg-primary transition-colors flex items-center gap-2 shadow-slight"
//             >
//               <Icon name="check_circle" className="text-[18px]" />
//               {mutation.isPending ? "Saving Receipt..." : "Complete Receipt"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </AppShell>
//   );
// }





import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { createGoodsReceipt, getOrders } from "@/lib/api";

export const Route = createFileRoute("/goods-receipts/")({
  component: Page,

  head: () => ({
    meta: [
      {
        title: "Goods Receipt | SupplyX",
      },
      {
        name: "description",
        content: "Log received items against an incoming purchase order.",
      },
      {
        property: "og:title",
        content: "Goods Receipt | SupplyX",
      },
      {
        property: "og:description",
        content: "Log received items against an incoming purchase order.",
      },
    ],
  }),
});

function Page() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const availableOrders = orders || [];

  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [receivedQty, setReceivedQty] = useState<number>(0);
  const [damagedQty, setDamagedQty] = useState<number>(0);
  const [binLocation, setBinLocation] = useState<string>("A-12-B");
  const [qualityStatus, setQualityStatus] =
    useState<string>("Passed Inspection");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    if (!selectedOrderId && availableOrders.length > 0) {
      setSelectedOrderId(availableOrders[0].orderId);
    }
  }, [availableOrders, selectedOrderId]);

  const selectedOrder = availableOrders.find(
    (order) => order.orderId === selectedOrderId,
  );

  const mutation = useMutation({
    mutationFn: createGoodsReceipt,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["goodsReceipts"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboardAnalytics"],
      });

      navigate({
        to: "/goods-receipts/detail",
      });
    },
  });

  const handleCompleteReceipt = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOrder) {
      return;
    }

    const firstItem = selectedOrder.items?.[0];

    mutation.mutate({
      orderId: selectedOrder.orderId,
      supplier: selectedOrder.supplier,
      deliveryDate: selectedOrder.deliveryDate,
      status:
        damagedQty > 0 ? "Partially Received" : "Fully Received",

      items: [
        {
          name: firstItem?.name ?? "Component Batch",
          receivedQty,
          expectedQty: firstItem?.quantity ?? receivedQty,
        },
      ],
    });
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-stack-lg">
        {/* Page Header */}
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm mb-1">
              <span className="hover:text-primary cursor-pointer">
                Inventory
              </span>

              <Icon
                name="chevron_right"
                className="text-[16px]"
              />

              <span className="hover:text-primary cursor-pointer">
                Receipts
              </span>
            </div>

            <h2 className="font-page-title text-page-title text-on-surface">
              Goods Receipt
            </h2>
          </div>

          <div>
            <span className="inline-flex items-center gap-1 bg-surface-container-high text-primary px-3 py-1 rounded font-body-sm text-body-sm">
              <Icon
                name="qr_code_scanner"
                className="text-[16px]"
              />

              Scan Barcode
            </span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="bg-surface rounded-xl border border-outline-variant shadow-slight p-container-padding text-center py-20 text-on-surface-variant">
            Loading purchase orders...
          </div>
        ) : availableOrders.length === 0 ? (
          /* Empty State */
          <div className="bg-surface rounded-xl border border-outline-variant shadow-slight p-container-padding text-center py-20 text-on-surface-variant">
            No purchase orders are available to receive. Create a purchase
            order first.
          </div>
        ) : (
          <form onSubmit={handleCompleteReceipt}>
            {/* Main Form Card */}
            <div className="bg-surface rounded-xl border border-outline-variant shadow-slight p-container-padding">
              {/* Reference Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter pb-stack-lg border-b border-outline-variant">
                {/* PO Reference */}
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">
                    PO Reference
                  </label>

                  <div className="flex items-center gap-2">
                    <select
                      className="font-data-mono text-data-mono text-on-surface bg-surface-container px-2 py-1 rounded border border-outline-variant outline-none"
                      value={selectedOrderId}
                      onChange={(e) => {
                        const orderId = e.target.value;

                        setSelectedOrderId(orderId);

                        const selected = availableOrders.find(
                          (order) => order.orderId === orderId,
                        );

                        if (selected?.items?.[0]) {
                          setReceivedQty(
                            selected.items[0].quantity,
                          );
                        }
                      }}
                    >
                      {availableOrders.map((order) => (
                        <option
                          key={order.id}
                          value={order.orderId}
                        >
                          {order.orderId} - {order.supplier}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Expected Delivery */}
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">
                    Expected Delivery
                  </label>

                  <p className="font-body-md text-body-md text-on-surface">
                    {selectedOrder?.deliveryDate ?? "TBD"}
                  </p>
                </div>

                {/* Supplier */}
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">
                    Supplier
                  </label>

                  <div className="flex items-center gap-2">
                    <Icon
                      name="factory"
                      className="text-on-surface-variant text-[18px]"
                    />

                    <p className="font-body-md text-body-md text-on-surface">
                      {selectedOrder?.supplier ?? "Unknown Supplier"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Line Items Logging */}
              <div className="pt-stack-lg">
                <h3 className="font-subsection-heading text-subsection-heading text-on-surface mb-stack-md flex items-center gap-2">
                  <Icon
                    name="view_list"
                    className="text-primary"
                  />

                  Receiving Items (1 Item Selected)
                </h3>

                {/* Item Card */}
                <div className="border border-outline-variant rounded-lg p-stack-md bg-surface-bright relative">
                  {/* Status Indicator */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-lg" />

                  <div className="flex justify-between items-start mb-stack-md">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-data-mono text-data-mono text-on-surface-variant text-[11px]">
                          ORDER: {selectedOrder.orderId}
                        </span>

                        <span className="bg-[#EFF6FF] text-[#2563EB] text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                          Expected:{" "}
                          {(selectedOrder.items as any)?.[0]?.quantity ||
                            500}{" "}
                          Units
                        </span>
                      </div>

                      <h4 className="font-body-md text-body-md font-medium text-on-surface">
                        {(selectedOrder.items as any)?.[0]?.name ||
                          "Industrial Component Batch"}
                      </h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-end">
                    {/* Received Quantity */}
                    <div className="md:col-span-3">
                      <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">
                        Received Qty{" "}
                        <span className="text-error">*</span>
                      </label>

                      <input
                        className="w-full border border-outline-variant rounded p-2 font-data-mono text-data-mono text-on-surface input-focus-ring"
                        type="number"
                        value={receivedQty}
                        onChange={(e) =>
                          setReceivedQty(
                            parseInt(e.target.value) || 0,
                          )
                        }
                      />
                    </div>

                    {/* Damaged Quantity */}
                    <div className="md:col-span-3">
                      <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">
                        Damaged/Rejected
                      </label>

                      <input
                        className="w-full border border-outline-variant rounded p-2 font-data-mono text-data-mono text-error input-focus-ring"
                        type="number"
                        value={damagedQty}
                        onChange={(e) =>
                          setDamagedQty(
                            parseInt(e.target.value) || 0,
                          )
                        }
                      />
                    </div>

                    {/* Bin Location */}
                    <div className="md:col-span-3">
                      <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">
                        Bin Location
                      </label>

                      <div className="relative">
                        <Icon
                          name="shelves"
                          className="absolute left-2 top-2 text-on-surface-variant text-[18px]"
                        />

                        <input
                          className="w-full border border-outline-variant rounded p-2 pl-8 font-data-mono text-data-mono text-on-surface input-focus-ring uppercase"
                          placeholder="e.g. A-12-B"
                          type="text"
                          value={binLocation}
                          onChange={(e) =>
                            setBinLocation(e.target.value)
                          }
                        />
                      </div>
                    </div>

                    {/* Quality Check */}
                    <div className="md:col-span-3">
                      <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">
                        Quality Status
                      </label>

                      <select
                        className="w-full border border-outline-variant rounded p-2 font-body-sm text-body-sm text-on-surface input-focus-ring bg-white"
                        value={qualityStatus}
                        onChange={(e) =>
                          setQualityStatus(e.target.value)
                        }
                      >
                        <option value="Passed Inspection">
                          Passed Inspection
                        </option>

                        <option value="Pending QA">
                          Pending QA
                        </option>

                        <option value="Failed Inspection">
                          Failed - Quarantine
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Receiving Notes */}
                  <div className="mt-stack-md pt-stack-sm border-t border-outline-variant border-dashed">
                    <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">
                      Receiving Notes (Optional)
                    </label>

                    <textarea
                      className="w-full border border-outline-variant rounded p-2 font-body-sm text-body-sm text-on-surface input-focus-ring"
                      placeholder="Add any observations about packaging or transport conditions..."
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex justify-end gap-3 items-center mt-6">
              <button
                type="button"
                onClick={() => navigate({ to: "/orders" })}
                className="px-4 py-2 rounded font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={mutation.isPending}
                className="px-6 py-2 bg-[#2563EB] text-white rounded font-body-sm text-body-sm font-medium hover:bg-primary transition-colors flex items-center gap-2 shadow-slight"
              >
                <Icon
                  name="check_circle"
                  className="text-[18px]"
                />

                {mutation.isPending
                  ? "Saving Receipt..."
                  : "Complete Receipt"}
              </button>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  );
}