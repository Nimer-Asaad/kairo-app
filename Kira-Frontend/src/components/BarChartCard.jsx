import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

const BarChartCard = ({ data = [], barKey = "value", xKey = "name", title = "" }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-80">
      {title ? <h3 className="text-base font-semibold text-gray-900 mb-4">{title}</h3> : null}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey={xKey} stroke="#6b7280" />
          <YAxis stroke="#6b7280" allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey={barKey} fill="#2563eb" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartCard;
