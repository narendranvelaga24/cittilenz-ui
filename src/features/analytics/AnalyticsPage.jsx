import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getFilteredSlaAnalytics, getLast30Analytics, getLast7Analytics, getSlaAnalytics } from "../../api/analytics.api";
import { getDepartments } from "../../api/departments.api";
import { getWards } from "../../api/wards.api";
import { Alert } from "../../components/ui/Alert.jsx";
import { AnalyticsChartSkeleton } from "../../components/ui/LoadingSkeletons.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { StatCard } from "../../components/ui/StatCard.jsx";
import { errorMessage } from "../../lib/apiResponse";
import { formatPercent } from "../../lib/format";
import { useAuth } from "../auth/useAuth";

export function AnalyticsPage() {
  const { user } = useAuth();
  const canChooseWard = user.role === "ADMIN";
  const [mode, setMode] = useState("overall");
  const [filters, setFilters] = useState({ wardId: "", departmentId: "", fromDate: "", toDate: "" });

  const dateRangeIsValid = useMemo(() => {
    if (!filters.fromDate || !filters.toDate) return true;
    return new Date(filters.fromDate).getTime() <= new Date(filters.toDate).getTime();
  }, [filters.fromDate, filters.toDate]);

  const analyticsQuery = useQuery({
    queryKey: ["sla-analytics", user.role, mode, filters],
    queryFn: async () => {
      if (!dateRangeIsValid) {
        throw new Error("From date must be earlier than or equal to To date.");
      }
      if (mode === "last7") {
        return getLast7Analytics({
          wardId: canChooseWard && filters.wardId ? Number(filters.wardId) : undefined,
          departmentId: filters.departmentId ? Number(filters.departmentId) : undefined,
        });
      }
      if (mode === "last30") {
        return getLast30Analytics({
          wardId: canChooseWard && filters.wardId ? Number(filters.wardId) : undefined,
          departmentId: filters.departmentId ? Number(filters.departmentId) : undefined,
        });
      }
      if (mode === "filter") {
        return getFilteredSlaAnalytics({
          wardId: canChooseWard && filters.wardId ? Number(filters.wardId) : undefined,
          departmentId: filters.departmentId ? Number(filters.departmentId) : undefined,
          fromDate: filters.fromDate ? `${filters.fromDate}T00:00:00` : undefined,
          toDate: filters.toDate ? `${filters.toDate}T23:59:59` : undefined,
        });
      }
      return getSlaAnalytics();
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });

  const { data, isLoading, error } = analyticsQuery;
  const { data: wards = [] } = useQuery({ queryKey: ["wards"], queryFn: getWards, staleTime: 30 * 60_000, enabled: canChooseWard });
  const { data: departments = [] } = useQuery({ queryKey: ["departments"], queryFn: getDepartments, staleTime: 30 * 60_000 });

  const chartData = [
    { name: "Assigned", value: data?.assignedIssues || 0 },
    { name: "In Progress", value: data?.inProgressIssues || 0 },
    { name: "Resolved", value: data?.resolvedIssues || 0 },
    { name: "Escalated", value: data?.escalatedIssues || 0 },
  ];

  const hasData = data && data.totalIssues > 0;

  return (
    <section className="page-stack analytics-shell">
      <PageHeader eyebrow="SLA analytics" title="Service health overview" description="Compliance, escalation pressure, and resolution throughput in one compact view." />
      <div className="panel form-grid two">
        <label>
          Mode
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value)}
          >
            <option value="overall">Overall</option>
            <option value="last7">Last 7 days</option>
            <option value="last30">Last 30 days</option>
            <option value="filter">Custom filter</option>
          </select>
        </label>
        <label>
          Department
          <select value={filters.departmentId} onChange={(event) => setFilters((current) => ({ ...current, departmentId: event.target.value }))}>
            <option value="">All departments</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>{department.name}</option>
            ))}
          </select>
        </label>
        {canChooseWard ? (
          <label>
            Ward
            <select value={filters.wardId} onChange={(event) => setFilters((current) => ({ ...current, wardId: event.target.value }))}>
              <option value="">All wards</option>
              {wards.map((ward) => (
                <option key={ward.id} value={ward.id}>{ward.wardName}</option>
              ))}
            </select>
          </label>
        ) : (
          <div className="muted">Ward scope is auto-restricted to your ward.</div>
        )}
        <label>
          From date
          <input
            type="date"
            value={filters.fromDate}
            onChange={(event) => {
              setFilters((current) => ({ ...current, fromDate: event.target.value }));
            }}
            disabled={mode !== "filter"}
          />
        </label>
        <label>
          To date
          <input
            type="date"
            value={filters.toDate}
            onChange={(event) => {
              setFilters((current) => ({ ...current, toDate: event.target.value }));
            }}
            disabled={mode !== "filter"}
          />
        </label>
      </div>
      {!dateRangeIsValid && mode === "filter" && <Alert tone="danger">From date must be earlier than or equal to To date.</Alert>}
      {error && <Alert tone="danger">{errorMessage(error)}</Alert>}
      <div className="stats-grid">
        <StatCard isLoading={isLoading} label="Total issues" value={data?.totalIssues || 0} />
        <StatCard isLoading={isLoading} label="SLA compliance" value={formatPercent(data?.slaCompliancePercentage)} tone="green" />
        <StatCard isLoading={isLoading} label="Escalation rate" value={formatPercent(data?.escalationRatePercentage)} tone="orange" />
        <StatCard isLoading={isLoading} label="Hard breaches" value={data?.hardSlaBreaches || 0} tone="red" />
      </div>
      {(hasData || isLoading) && (
        <div className="stats-grid">
          <StatCard isLoading={isLoading} label="Soft breaches" value={data?.softSlaBreaches || 0} tone="yellow" />
          <StatCard isLoading={isLoading} label="Avg acknowledgement" value={`${Number(data?.averageAcknowledgementMinutes || 0).toFixed(1)}m`} />
          <StatCard isLoading={isLoading} label="Avg resolution" value={`${Number(data?.averageResolutionMinutes || 0).toFixed(1)}m`} />
          <StatCard isLoading={isLoading} label="Reassignments" value={formatPercent(data?.reassignmentRatePercentage)} />
        </div>
      )}
      {hasData && data?.supervisorInterventionRequired > 0 && (
        <Alert tone="warning">⚠️ {data.supervisorInterventionRequired} issues require supervisor intervention.</Alert>
      )}
      <div className="panel chart-panel">
        {isLoading ? (
          <AnalyticsChartSkeleton />
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <CartesianGrid stroke="var(--lux-line)" strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="var(--lux-ink)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
