import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteCustomer, getCustomers, updateCustomer, Customer } from "@/lib/api";

export const Route = createFileRoute("/customers")({
  component: CustomersPage,
  head: () => ({
    meta: [
      { title: "Customers Directory - SupplyX" },
      { name: "description", content: "Access SCM customer accounts, sales records, and contract stats." },
    ],
  }),
});

function CustomersPage() {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, update }: { id: string; update: Partial<Omit<Customer, "id" | "createdAt">> }) =>
      updateCustomer(id, update),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });

  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });

  const initials = (name?: string) => {
    if (!name) return "--";
    return name
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Delete this customer?")) return;
    deleteMutation.mutate(id);
  };

  const handleEdit = (customer: Customer) => {
    const email = window.prompt("Update contact email:", customer.email);
    if (!email) return;
    updateMutation.mutate({ id: customer.id, update: { email } });
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-page-title text-page-title text-on-surface">Customers</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Browse and manage customer accounts, order history, and annual business volumes.
            </p>
          </div>
          <button
            onClick={() => navigate({ to: "/customers/new" })}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-container px-4 py-2 text-body-sm font-medium text-on-primary hover:opacity-90 transition-opacity"
          >
            <Icon name="add" className="text-[18px]" />
            New Customer
          </button>
        </div>

        <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase">Company Name</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase">Contact Person</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase">Email</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Sales (YTD)</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase">Status</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-[13px] text-on-surface">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-on-surface-variant">
                      Loading customers...
                    </td>
                  </tr>
                ) : !customers || customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-on-surface-variant">
                      No customer accounts found.
                    </td>
                  </tr>
                ) : (
                  customers.map((cust) => (
                    <tr
                      key={cust.id}
                      onClick={() => {
                        const path = ["/customers", "detail"].join("/");
                        window.location.href = path + "?id=" + cust.id;
                      }}
                      className="hover:bg-surface-container-low/50 transition-colors h-12 cursor-pointer"
                    >
                      <td className="px-4 font-medium flex items-center gap-2 h-12">
                        <div className="w-8 h-8 rounded flex items-center justify-center bg-secondary-container text-on-secondary-container font-bold text-sm">
                          {initials(cust.companyName)}
                        </div>
                        {cust.companyName}
                      </td>
                      <td className="px-4 font-medium">{cust.contact}</td>
                      <td className="px-4 font-data-mono text-data-mono text-on-surface-variant">{cust.email}</td>
                      <td className="px-4 font-data-mono text-data-mono text-right font-semibold">
                        ${cust.salesYTD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          cust.status === "Active"
                            ? "bg-[#DCFCE7] text-[#16A34A]"
                            : "bg-[#F1F5F9] text-[#64748B]"
                        }`}>
                          {cust.status}
                        </span>
                      </td>
                      <td className="px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(cust)}
                          className="text-primary hover:text-on-primary-fixed-variant"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cust.id)}
                          className="text-error hover:text-on-error"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <Outlet />
      </div>
    </AppShell>
  );
}
