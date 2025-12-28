import { prisma } from "@/lib/prisma";
import { Section } from "@/components/ui/Section";
import { Text } from "@/components/ui/Text";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";


/* ---------- AUTH GUARD (SERVER-SIDE) ---------- */
async function requireAdminAuth() {
  const cookieStore = await cookies(); // ✅ MUST await
  const token = cookieStore.get("admin_session")?.value;

  if (!token) {
    redirect("/admin/login");
  }

  try {
    jwt.verify(token, process.env.ADMIN_JWT_SECRET!);
  } catch {
    redirect("/admin/login");
  }
}


/* ---------- Helpers ---------- */
function aggregateAnswers(sessions: any[]) {
  const fields = ["occasion", "drape", "style", "tone", "investment"];
  const result: Record<string, Record<string, number>> = {};
  fields.forEach((f) => (result[f] = {}));

  sessions.forEach((s) => {
    fields.forEach((f) => {
      const value = s.answers?.[f];
      if (!value) return;
      result[f][value] = (result[f][value] || 0) + 1;
    });
  });

  return result;
}

function getFromDate(range: string) {
  const now = new Date();
  if (range === "30") return new Date(now.setDate(now.getDate() - 30));
  if (range === "all") return new Date(0);
  return new Date(now.setDate(now.getDate() - 7));
}

/* ---------- Page ---------- */
export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  // 🔐 Enforce admin auth
  await requireAdminAuth();

  const { range = "7" } = await searchParams;
  const fromDate = getFromDate(range);

  const [
    totalSessions,
    totalWishlist,
    totalInquiry,
    totalAdvisorClicks,
    recentSessions,
    topWishlisted,
  ] = await Promise.all([
    prisma.advisorSession.count({
      where: { createdAt: { gte: fromDate } },
    }),

    prisma.conversionEvent.count({
      where: { type: "wishlist", createdAt: { gte: fromDate } },
    }),

    prisma.conversionEvent.count({
      where: { type: "inquiry", createdAt: { gte: fromDate } },
    }),

    prisma.conversionEvent.count({
      where: { type: "advisor_click", createdAt: { gte: fromDate } },
    }),

    prisma.advisorSession.findMany({
      where: { createdAt: { gte: fromDate } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    prisma.conversionEvent.groupBy({
      by: ["productId"],
      where: { type: "wishlist", createdAt: { gte: fromDate } },
      _count: { productId: true },
      orderBy: {
        _count: { productId: "desc" },
      },
      take: 5,
    }),
  ]);

  const preferenceStats = aggregateAnswers(recentSessions);

  const advisorCTR =
    totalSessions > 0
      ? Math.round((totalAdvisorClicks / totalSessions) * 100)
      : 0;

  const inquiryRate =
    totalSessions > 0
      ? Math.round((totalInquiry / totalSessions) * 100)
      : 0;

  return (
    <Section>
      {/* Header */}
      <div className="flex justify-between items-center">
        <Text as="h1">GoldenWeft Admin Dashboard</Text>
        <a
          href="/api/admin/logout"
          className="text-sm underline opacity-70 hover:opacity-100"
        >
          Logout
        </a>
      </div>

      {/* Date Range */}
      <div className="mt-6 flex gap-3 text-sm">
        <RangeButton label="Last 7 days" value="7" current={range} />
        <RangeButton label="Last 30 days" value="30" current={range} />
        <RangeButton label="All time" value="all" current={range} />
      </div>

      {/* Metrics */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-6">
        <Metric title="Advisor Sessions" value={totalSessions} />
        <Metric title="Advisor Clicks" value={totalAdvisorClicks} />
        <Metric title="Wishlists" value={totalWishlist} />
        <Metric title="Inquiries" value={totalInquiry} />
      </div>

      <Text className="mt-4 text-sm opacity-70">
        Showing data for{" "}
        <strong>
          {range === "all"
            ? "all time"
            : range === "30"
            ? "last 30 days"
            : "last 7 days"}
        </strong>
      </Text>

      <Text className="mt-2 text-sm opacity-70">
        Advisor click-through rate: <strong>{advisorCTR}%</strong>
      </Text>

      <Text className="mt-1 text-sm opacity-70">
        Inquiry conversion rate: <strong>{inquiryRate}%</strong>
      </Text>

      {/* Preferences */}
      <div className="mt-20">
        <Text as="h2">Advisor Preference Breakdown</Text>

        <div className="mt-10 space-y-12">
          {Object.entries(preferenceStats).map(([pref, choices]) => {
            const total = Object.values(choices).reduce((a, b) => a + b, 0);
            const sorted = Object.entries(choices).sort(
              (a, b) => b[1] - a[1]
            );

            return (
              <div key={pref}>
                <Text className="capitalize text-lg font-medium">
                  {pref}
                </Text>

                <table className="mt-4 w-full text-sm border border-black/10 rounded-soft">
                  <thead className="bg-black/5">
                    <tr>
                      <th className="p-3 text-left">Choice</th>
                      <th className="p-3 text-right">Count</th>
                      <th className="p-3 text-right">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map(([label, count]) => (
                      <tr key={label} className="border-t">
                        <td className="p-3">{label}</td>
                        <td className="p-3 text-right">{count}</td>
                        <td className="p-3 text-right">
                          {Math.round((count / total) * 100)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Wishlisted */}
      <div className="mt-16">
        <Text as="h2">Top Wishlisted Products</Text>

        {topWishlisted.length === 0 ? (
          <Text className="mt-4 text-sm opacity-70">
            No wishlist activity yet.
          </Text>
        ) : (
          <ul className="mt-6 space-y-3 text-sm">
            {topWishlisted.map((item) => (
              <li key={item.productId}>
                {item.productId} — {item._count.productId} wishlists
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* CSV Export */}
      <div className="mt-10">
        <Text as="h2">Export Reports</Text>

        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <a
            href="/api/admin/export?type=advisor_sessions"
            className="px-4 py-2 border rounded-soft hover:border-black"
          >
            Export Advisor Sessions
          </a>

          <a
            href="/api/admin/export?type=wishlists"
            className="px-4 py-2 border rounded-soft hover:border-black"
          >
            Export Wishlists
          </a>

          <a
            href="/api/admin/export?type=inquiries"
            className="px-4 py-2 border rounded-soft hover:border-black"
          >
            Export Inquiries
          </a>
        </div>
      </div>
    </Section>
  );
}

/* ---------- Components ---------- */
function Metric({ title, value }: { title: string; value: number }) {
  return (
    <div className="border border-black/10 rounded-soft p-6">
      <Text className="text-sm opacity-70">{title}</Text>
      <Text as="h2" className="mt-2">
        {value}
      </Text>
    </div>
  );
}

function RangeButton({
  label,
  value,
  current,
}: {
  label: string;
  value: string;
  current: string;
}) {
  return (
    <a
      href={`/admin?range=${value}`}
      className={`px-4 py-2 border rounded-soft transition ${
        current === value
          ? "border-black bg-black text-white"
          : "border-black/20 hover:border-black"
      }`}
    >
      {label}
    </a>
  );
}
