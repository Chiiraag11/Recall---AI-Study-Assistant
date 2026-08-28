import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#7c9eff", "#8fd9c4", "#f6c177", "#e8a2c0", "#a4a0e8", "#f28fad"];

export default function TopicChart({ confidence }) {
  const data = confidence.map((c) => ({ name: c.topic, value: c.score }));

  return (
    <div className="topic-chart">
      <h3 className="section-title">Topic breakdown</h3>
      <p className="topic-chart__caption">Relative weight/difficulty of each sub-topic, as estimated by the model.</p>
      <div className="topic-chart__container">
        <ResponsiveContainer width="100%" height={Math.max(180, data.length * 44)}>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              tick={{ fill: "var(--text-secondary)", fontSize: 13 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "var(--surface-hover)" }}
              contentStyle={{
                background: "var(--surface-raised)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--text-primary)",
              }}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
