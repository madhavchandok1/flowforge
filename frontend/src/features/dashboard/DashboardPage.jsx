import { useAuthStore } from "@/stores/useAuthStore";
import { useProjectStore } from "@/stores/useProjectStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { recentActivity } from "@/lib/mock-data";
import { STATUS_LABELS, ACTION_TYPE_LABELS } from "@/lib/constants";
import {
  FolderKanban,
  CheckCircle2,
  Loader2,
  Clock,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const STAT_ICONS = {
  totalForges: FolderKanban,
  completed: CheckCircle2,
  inProgress: Loader2,
  blocked: AlertTriangle,
};

const STAT_COLORS = {
  totalForges: "text-primary",
  completed: "text-status-crafted",
  inProgress: "text-status-forging",
  blocked: "text-status-jammed",
};

const STAT_BG = {
  totalForges: "bg-primary/10",
  completed: "bg-status-crafted/20",
  inProgress: "bg-status-forging/20",
  blocked: "bg-status-jammed/20",
};

const PIE_COLORS = ["#facc15", "#3b82f6", "#f97316", "#22c55e"];

const monthlyData = [
  { month: "Jan", completed: 4, created: 6 },
  { month: "Feb", completed: 7, created: 8 },
  { month: "Mar", completed: 5, created: 5 },
  { month: "Apr", completed: 9, created: 7 },
  { month: "May", completed: 6, created: 4 },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const getStats = useProjectStore((s) => s.getStats);
  const stats = getStats();

  const statCards = [
    { key: "totalForges", label: "Total Forges", value: stats.totalForges },
    { key: "completed", label: "Crafted", value: stats.completed },
    { key: "inProgress", label: "Forging", value: stats.inProgress },
    { key: "blocked", label: "Jammed", value: stats.blocked },
  ];

  const pieData = [
    { name: STATUS_LABELS.queued, value: stats.queued },
    { name: STATUS_LABELS.forging, value: stats.inProgress },
    { name: STATUS_LABELS.jammed, value: stats.blocked },
    { name: STATUS_LABELS.crafted, value: stats.completed },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-xl font-bold tracking-tight">
          Welcome back, {user?.name?.split(" ")[0]}
        </h2>
        <p className="text-sm text-muted-foreground">
          Here's an overview of your workspace activity.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = STAT_ICONS[stat.key];
          return (
            <Card key={stat.key}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${STAT_BG[stat.key]}`}>
                    <Icon size={22} className={STAT_COLORS[stat.key]} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Task Status Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Action Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-xs text-muted-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Monthly Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-xs text-muted-foreground">{value}</span>
                    )}
                  />
                  <Bar dataKey="completed" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="created" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold text-white"
                  style={{ backgroundColor: activity.user.color }}
                >
                  {activity.user.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs">
                    <span className="font-medium">{activity.user.name}</span>
                    <span className="text-muted-foreground"> {activity.action} </span>
                    <span className="font-medium">{activity.target}</span>
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
