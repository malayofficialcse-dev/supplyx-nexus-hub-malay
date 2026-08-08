import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";

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

function Page() {
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-stack-lg flex justify-between items-end">
          <div>
            <h1 className="font-page-title text-page-title text-on-surface">Create Purchase Requisition</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Submit a new request for goods or services.</p>
          </div>
          <div className="flex gap-stack-sm">
            <button className={btnGhost}>Cancel</button>
            <button className={btnSecondary}>Save Draft</button>
            <button className={btnPrimary}>Submit for Approval</button>
          </div>
        </div>
        <form className="space-y-stack-lg">
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
                <select className={formSelect} id="department" defaultValue="ops">
                  <option value="ops">Operations</option>
                  <option value="it">IT</option>
                  <option value="facilities">Facilities</option>
                  <option value="marketing">Marketing</option>
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
              <div>
                <label className={formLabel} htmlFor="reqDate">Requisition Date</label>
                <input className={formInput} id="reqDate" type="date" />
              </div>
              <div>
                <label className={formLabel} htmlFor="priority">Priority</label>
                <select className={formSelect} id="priority" defaultValue="standard">
                  <option value="standard">Standard</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </section>
          {/* Line Items */}
          <section className="bg-white rounded border border-outline-variant shadow-sm overflow-hidden">
            <div className="p-container-padding pb-0 flex justify-between items-center mb-stack-sm">
              <h2 className="font-subsection-heading text-subsection-heading text-on-surface">Line Items</h2>
              <button className={`${btnSecondary} text-sm py-1 px-3 flex items-center gap-1`} type="button">
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
                <tbody className="font-body-sm text-body-sm" id="lineItemsBody">
                  <tr className="border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-4 text-on-surface-variant">1</td>
                    <td className="py-2 px-4"><input className={`${formInput} py-1`} placeholder="Describe item..." type="text" /></td>
                    <td className="py-2 px-4"><input className={`${formInput} py-1 font-data-mono text-data-mono`} placeholder="SKU..." type="text" /></td>
                    <td className="py-2 px-4"><input className={`${formInput} py-1 text-right`} min={1} type="number" defaultValue={1} /></td>
                    <td className="py-2 px-4 flex items-center gap-1"><span className="text-on-surface-variant">$</span><input className={`${formInput} py-1 text-right`} placeholder="0.00" type="number" /></td>
                    <td className="py-3 px-4 font-data-mono text-data-mono text-right">$0.00</td>
                    <td className="py-2 px-4 text-center">
                      <button className="text-on-surface-variant hover:text-error transition-colors" title="Remove" type="button">
                        <Icon name="delete" className="text-[20px]" />
                      </button>
                    </td>
                  </tr>
                  <tr className="border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-4 text-on-surface-variant">2</td>
                    <td className="py-2 px-4"><input className={`${formInput} py-1`} placeholder="Describe item..." type="text" /></td>
                    <td className="py-2 px-4"><input className={`${formInput} py-1 font-data-mono text-data-mono`} placeholder="SKU..." type="text" /></td>
                    <td className="py-2 px-4"><input className={`${formInput} py-1 text-right`} min={1} type="number" defaultValue={1} /></td>
                    <td className="py-2 px-4 flex items-center gap-1"><span className="text-on-surface-variant">$</span><input className={`${formInput} py-1 text-right`} placeholder="0.00" type="number" /></td>
                    <td className="py-3 px-4 font-data-mono text-data-mono text-right">$0.00</td>
                    <td className="py-2 px-4 text-center">
                      <button className="text-on-surface-variant hover:text-error transition-colors" title="Remove" type="button">
                        <Icon name="delete" className="text-[20px]" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-container-padding bg-[#F8FAFC] flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                  <span>Subtotal:</span>
                  <span className="font-data-mono text-data-mono">$0.00</span>
                </div>
                <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                  <span>Estimated Tax (8%):</span>
                  <span className="font-data-mono text-data-mono">$0.00</span>
                </div>
                <div className="flex justify-between font-subsection-heading text-subsection-heading text-on-surface pt-2 border-t border-outline-variant">
                  <span>Total Request:</span>
                  <span className="font-data-mono text-data-mono font-bold">$0.00</span>
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
          <div className="flex justify-end gap-stack-sm pt-4">
            <button className={btnGhost} type="button">Cancel</button>
            <button className={btnSecondary} type="button">Save Draft</button>
            <button className={btnPrimary} type="submit">Submit for Approval</button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
