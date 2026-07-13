"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader, StatusBadge } from "@/components/admin/ui/feedback";
import { Card } from "@/components/admin/ui/primitives";
import { useAuth } from "@/lib/admin/auth";
import { api } from "@/lib/admin/services";
import { formatDistanceToNow } from "date-fns";

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: installs } = useQuery({
    queryKey: ["installations", "profile"],
    queryFn: () => api.installations({ limit: 20 }),
    enabled: !!user,
  });
  const { data: dash } = useQuery({
    queryKey: ["dashboard"],
    queryFn: api.dashboard,
    enabled: !!user,
  });

  if (!user) return null;
  const mine = installs?.items ?? [];
  const activity = dash?.activity ?? [];

  return (
    <div>
      <PageHeader title="Profile" subtitle="Your account, assigned work and recent activity." />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-electric to-cyan text-lg font-bold text-white">
              {user.name
                .split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join("")}
            </span>
            <div>
              <div className="font-display text-lg text-white">{user.name}</div>
              <div className="text-sm text-white/50">{user.title}</div>
              <div className="mt-1 text-xs capitalize text-cyan">{user.role}</div>
            </div>
          </div>
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-white/40">Email</span>
              <span className="text-white/80">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Assigned jobs</span>
              <span className="text-white/80">{mine.length}</span>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="mb-4 text-sm font-medium text-white/80">Assigned work</h3>
            {mine.length ? (
              <div className="space-y-2">
                {mine.map((i) => (
                  <div
                    key={i.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                  >
                    <div>
                      <div className="text-sm text-white">
                        {i.ref} · {i.type}
                      </div>
                      <div className="text-xs text-white/40">
                        {i.customer} · {i.date}
                      </div>
                    </div>
                    <StatusBadge status={i.status} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/40">No assigned work.</p>
            )}
          </Card>
          <Card className="p-5">
            <h3 className="mb-4 text-sm font-medium text-white/80">Recent activity</h3>
            <div className="space-y-2">
              {activity.length === 0 ? (
                <p className="text-sm text-white/40">No recent activity.</p>
              ) : (
                activity.slice(0, 4).map((a) => (
                  <div key={a.id} className="text-sm text-white/70">
                    {a.action} <b className="text-white">{a.target}</b>{" "}
                    <span className="text-white/40">
                      · {formatDistanceToNow(new Date(a.at), { addSuffix: true })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
