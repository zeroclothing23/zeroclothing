import { listCustomRequests } from "@/server/queries/admin";
import { CustomRequestStatus } from "@/components/admin/custom-request-status";

export const dynamic = "force-dynamic";

export default async function AdminCustomRequestsPage() {
  const requests = await listCustomRequests();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">Custom Design Requests</h1>

      {requests.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          No custom design requests yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {requests.map((r) => (
            <li key={r.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{r.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.email} · {r.phone} · {new Date(r.createdAt).toLocaleString("en-LK")}
                  </p>
                </div>
                <CustomRequestStatus id={r.id} current={r.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                <span>Shirt: <span className="text-foreground">{r.shirtType}</span></span>
                <span>Color: <span className="text-foreground">{r.color}</span></span>
                <span>Size: <span className="text-foreground">{r.size}</span></span>
              </div>
              <p className="mt-3 text-sm">{r.description}</p>
              {r.fileUrls.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.fileUrls.map((url, i) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-border px-3 py-1 text-xs text-primary hover:border-primary"
                    >
                      Attachment {i + 1}
                    </a>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
