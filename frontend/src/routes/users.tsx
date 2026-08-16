import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Users,
  UserPlus,
  Pencil,
  Trash2,
  Shield,
  CheckSquare,
  Square,
  Lock,
  Mail,
  User,
  Settings,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/lib/auth.js";
import { api, unwrapList } from "@/lib/api.js";
import { Button } from "@/components/kit/Button";
import { PageHeader, Card } from "@/components/kit/Card";
import { Modal } from "@/components/kit/Modal";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "User Management — SupplyX SCM" },
    ],
  }),
  component: UserManagementPage,
});

const MODULES = [
  { key: "analytics", label: "Analytics Hub" },
  { key: "suppliers", label: "Suppliers Directory" },
  { key: "requisitions", label: "Requisitions" },
  { key: "rfqs", label: "RFQs" },
  { key: "orders", label: "Purchase Orders" },
  { key: "goods-receipts", label: "Goods Receipts" },
  { key: "invoices", label: "Invoices" },
  { key: "payments", label: "Payments" },
  { key: "budget", label: "Budgets & Ledger" },
  { key: "contracts", label: "Contracts" },
  { key: "warehouses", label: "Warehouses" },
  { key: "inventory", label: "Inventory" },
  { key: "shipments", label: "Shipments" },
  { key: "logistics", label: "Logistics Routes" },
  { key: "carriers", label: "Carriers" },
  { key: "customers", label: "Customers" },
];

const DEFAULT_PERMISSIONS = MODULES.reduce((acc, curr) => {
  acc[curr.key] = { view: false, create: false, edit: false, delete: false };
  return acc;
}, {} as Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean }>);

function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Route protection check: Only Superadmins can view User Management
  React.useEffect(() => {
    if (currentUser && currentUser.role !== "Superadmin") {
      toast.error("Access denied: Superadmin permission required.");
      void navigate({ to: "/" });
    }
  }, [currentUser, navigate]);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<any | null>(null);
  const [deletingUser, setDeletingUser] = React.useState<any | null>(null);

  // Form State
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState("User");
  const [permissions, setPermissions] = React.useState<Record<string, any>>(DEFAULT_PERMISSIONS);

  // Fetch Users
  const { data: users = [], isFetching, refetch } = useQuery({
    queryKey: ["/users"],
    queryFn: async () => unwrapList(await api.get("/users")),
    enabled: currentUser?.role === "Superadmin",
  });

  const openCreate = () => {
    setEditingUser(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("User");
    setPermissions(JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS)));
    setFormOpen(true);
  };

  const openEdit = (user: any) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword(""); // Keep password blank unless changing
    setRole(user.role);
    
    // Merge existing permissions with default permissions to ensure all keys exist
    const mergedPerms = JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS));
    if (user.permissions) {
      Object.keys(user.permissions).forEach((k) => {
        if (mergedPerms[k]) {
          mergedPerms[k] = { ...mergedPerms[k], ...user.permissions[k] };
        }
      });
    }
    setPermissions(mergedPerms);
    setFormOpen(true);
  };

  // Create or Update Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        email,
        role,
        permissions,
        ...(password ? { password } : {}),
      };

      if (editingUser) {
        return api.put(`/users/${editingUser.id}`, payload);
      } else {
        return api.post("/users", payload);
      }
    },
    onSuccess: () => {
      toast.success(editingUser ? "User updated successfully" : "User created successfully");
      setFormOpen(false);
      void qc.invalidateQueries({ queryKey: ["/users"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save user");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.del(`/users/${id}`),
    onSuccess: () => {
      toast.success("User deleted successfully");
      setDeletingUser(null);
      void qc.invalidateQueries({ queryKey: ["/users"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete user");
    },
  });

  const togglePermission = (moduleKey: string, action: "view" | "create" | "edit" | "delete") => {
    setPermissions((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next[moduleKey] = next[moduleKey] || { view: false, create: false, edit: false, delete: false };
      
      const newval = !next[moduleKey][action];
      next[moduleKey][action] = newval;

      // UX Guard: If checking create, edit, or delete, auto check view permission
      if (newval && (action === "create" || action === "edit" || action === "delete")) {
        next[moduleKey].view = true;
      }
      
      // UX Guard: If unchecking view, auto uncheck create, edit, and delete
      if (!newval && action === "view") {
        next[moduleKey].create = false;
        next[moduleKey].edit = false;
        next[moduleKey].delete = false;
      }

      return next;
    });
  };

  const toggleAllModule = (moduleKey: string, enable: boolean) => {
    setPermissions((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next[moduleKey] = {
        view: enable,
        create: enable,
        edit: enable,
        delete: enable,
      };
      return next;
    });
  };

  const toggleAllPermissions = (enable: boolean) => {
    const next = JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS));
    MODULES.forEach((m) => {
      next[m.key] = {
        view: enable,
        create: enable,
        edit: enable,
        delete: enable,
      };
    });
    setPermissions(next);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || (!editingUser && !password)) {
      toast.error("Please fill in all required fields.");
      return;
    }
    saveMutation.mutate();
  };

  if (currentUser?.role !== "Superadmin") {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Create users, assign system roles, and configure granular, module-by-module permissions."
        actions={
          <Button variant="primary" onClick={openCreate}>
            <UserPlus className="h-4 w-4 mr-1.5" />
            Add User
          </Button>
        }
      />

      {/* Users Table Card */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status / Access</th>
                <th className="px-4 py-3">Registered / Activity</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-[13px] text-foreground">
              {isFetching && users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Loading users list...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No users configured in this workspace.
                  </td>
                </tr>
              ) : (
                users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-muted/15 transition-colors">
                    <td className="px-4 py-3 font-medium flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-accent text-accent-foreground text-[10px] font-bold uppercase">
                        {u.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2)}
                      </div>
                      {u.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                          u.role === "Superadmin"
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "bg-muted text-muted-foreground border border-border"
                        }`}
                      >
                        <Shield className="h-3 w-3" />
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.role === "Superadmin" ? (
                        <span className="text-[12px] text-emerald-600 font-medium">All modules enabled</span>
                      ) : (
                        <span className="text-[12px] text-muted-foreground font-medium">
                          {Object.keys(u.permissions || {}).filter((k) => u.permissions[k]?.view).length} / {MODULES.length} modules visible
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-muted-foreground tabular-nums">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="subtle" size="sm" onClick={() => openEdit(u)}>
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="subtle"
                          size="sm"
                          disabled={u.id === currentUser?.id}
                          onClick={() => setDeletingUser(u)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          <span className="text-destructive">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create / Edit User Drawer/Modal */}
      <Modal
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editingUser ? "Edit User Account" : "Register New User"}
        description={
          editingUser
            ? `Modify basic information and access credentials for ${editingUser.name}.`
            : "Set up basic credentials and allocate module permission layers."
        }
        width="lg"
        footer={
          <>
            <Button onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : editingUser ? "Save Changes" : "Create Account"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4 text-foreground">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Name <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="h-9 w-full rounded-sm border border-border bg-surface pl-9 pr-3 text-[13px] text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Email Address <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="johndoe@company.com"
                  className="h-9 w-full rounded-sm border border-border bg-surface pl-9 pr-3 text-[13px] text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Password {editingUser ? "(leave blank to keep current)" : <span className="text-destructive">*</span>}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingUser ? "••••••••" : "Minimum 6 chars"}
                  className="h-9 w-full rounded-sm border border-border bg-surface pl-9 pr-3 text-[13px] text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Workspace Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-9 w-full rounded-sm border border-border bg-surface px-3 text-[13px] text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="User">Standard User</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Administrator</option>
                <option value="Superadmin">Super Administrator</option>
              </select>
            </div>
          </div>

          {/* Module-Wise Permission Selector Section */}
          {role !== "Superadmin" ? (
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-semibold flex items-center gap-1.5">
                  <Settings className="h-4 w-4 text-primary" />
                  Module-Wise Access Rights
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => toggleAllPermissions(true)}
                    className="text-[11px] text-primary font-semibold hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-muted-foreground">|</span>
                  <button
                    type="button"
                    onClick={() => toggleAllPermissions(false)}
                    className="text-[11px] text-muted-foreground font-semibold hover:underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Checkboxes Grid */}
              <div className="rounded-sm border border-border max-h-[300px] overflow-y-auto divide-y divide-border">
                {MODULES.map((m) => {
                  const perm = permissions[m.key] || { view: false, create: false, edit: false, delete: false };
                  const allActive = perm.view && perm.create && perm.edit && perm.delete;
                  return (
                    <div key={m.key} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2 hover:bg-muted/10 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-semibold w-36 shrink-0">{m.label}</span>
                        <button
                          type="button"
                          onClick={() => toggleAllModule(m.key, !allActive)}
                          className="text-[10px] text-muted-foreground border border-border px-1.5 py-0.5 rounded-sm hover:bg-muted font-medium transition-colors"
                        >
                          {allActive ? "Disable module" : "Full access"}
                        </button>
                      </div>

                      <div className="flex items-center gap-6">
                        {(["view", "create", "edit", "delete"] as const).map((act) => {
                          const checked = !!perm[act];
                          const Icon = checked ? CheckSquare : Square;
                          return (
                            <button
                              key={act}
                              type="button"
                              onClick={() => togglePermission(m.key, act)}
                              className={`flex items-center gap-1 text-[11px] font-medium transition-colors hover:text-primary ${
                                checked ? "text-primary font-semibold" : "text-muted-foreground"
                              }`}
                            >
                              <Icon className="h-4 w-4 shrink-0" />
                              <span className="capitalize">{act === "view" ? "read" : act}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-sm bg-[#0078d4]/10 border border-[#0078d4]/20 p-3 mt-4 text-[#0078d4] text-[12px] flex gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Super Administrator Warning:</span> Superadmins automatically bypass all security checks and retain full CRUD permissions on every module. Configured access rights will not apply to this user.
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deletingUser}
        onOpenChange={(o) => !o && setDeletingUser(null)}
        title="Delete User Account"
        description="This action cannot be undone and will revoke all workspace access."
        width="sm"
        footer={
          <>
            <Button onClick={() => setDeletingUser(null)}>Cancel</Button>
            <Button
              variant="danger"
              disabled={deleteMutation.isPending}
              onClick={() => deletingUser && deleteMutation.mutate(deletingUser.id)}
            >
              {deleteMutation.isPending ? "Revoking..." : "Revoke Access"}
            </Button>
          </>
        }
      >
        <p className="text-[13px] text-foreground">
          Are you sure you want to delete user account{" "}
          <strong>{deletingUser?.name} ({deletingUser?.email})</strong>?
        </p>
      </Modal>
    </div>
  );
}
