import { listCustomers } from "@/server/queries/admin";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await listCustomers();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">Customers</h1>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-border bg-card text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Orders</th>
              <th className="p-3">Verified</th>
              <th className="p-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No customers yet.</td></tr>
            )}
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-secondary/30">
                <td className="p-3 font-medium">{c.name ?? "—"}</td>
                <td className="p-3 text-muted-foreground">{c.email}</td>
                <td className="p-3 text-muted-foreground">{c.phone ?? "—"}</td>
                <td className="p-3">{c.orderCount}</td>
                <td className="p-3">
                  <span className={c.verified ? "text-green-400" : "text-muted-foreground"}>
                    {c.verified ? "Yes" : "No"}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">
                  {new Date(c.createdAt).toLocaleDateString("en-LK")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
