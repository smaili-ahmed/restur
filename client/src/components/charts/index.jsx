import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const TOOLTIP_STYLE = {
  background: '#ffffff',
  border: '1px solid rgba(30,50,100,0.18)',
  borderRadius: 10,
  fontSize: 12,
  fontFamily: 'JetBrains Mono, monospace',
  color: '#1a2333',
  boxShadow: '0 8px 24px rgba(23,35,70,0.12)',
};

const AXIS = { stroke: 'rgba(30,50,100,0.3)', fontSize: 11, tickLine: false };

const GRID = { strokeDasharray: '3 6', stroke: 'rgba(30,50,100,0.08)', vertical: false };

export function ConnectionsAreaChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 6, right: 6, left: -14, bottom: 0 }}>
        <defs>
          <linearGradient id="gSuccess" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00e5ff" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#00e5ff" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gFailed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff4d6d" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#ff4d6d" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="day" {...AXIS} tickMargin={8} />
        <YAxis {...AXIS} allowDecimals={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Area type="monotone" dataKey="success" name="Success" stroke="#00e5ff" fill="url(#gSuccess)" strokeWidth={2} />
        <Area type="monotone" dataKey="failed" name="Failed" stroke="#ff4d6d" fill="url(#gFailed)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function IpsBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 6, right: 6, left: -14, bottom: 0 }}>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="ip_address" {...AXIS} tickMargin={8} />
        <YAxis {...AXIS} allowDecimals={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(79,70,229,0.06)' }} />
        <Bar dataKey="total" name="Connections" fill="#7c4dff" radius={[5, 5, 0, 0]} maxBarSize={34} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const PIE_COLORS = ['#00e5ff', '#7c4dff', '#ff4d6d', '#ffb020', '#00ffc8'];

export function StatusDonut({ data }) {
  const rows = data.map((d) => ({ name: d.status, value: d.total }));
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={rows} innerRadius={58} outerRadius={86} paddingAngle={3} dataKey="value" stroke="transparent">
          {rows.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Inter, sans-serif' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function EventsLineChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 6, right: 6, left: -14, bottom: 0 }}>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="day" {...AXIS} tickMargin={8} />
        <YAxis {...AXIS} allowDecimals={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Line type="monotone" dataKey="total" name="Events" stroke="#ffb020" strokeWidth={2} dot={{ r: 2 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
