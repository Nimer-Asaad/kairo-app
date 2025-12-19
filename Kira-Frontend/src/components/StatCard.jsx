const StatCard = ({ label, value, icon = null, helperText = "", accent = "blue" }) => {
  const accentMap = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    yellow: "text-yellow-600 bg-yellow-100",
    red: "text-red-600 bg-red-100",
  };
  const badge = accentMap[accent] || accentMap.blue;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <div className="text-3xl font-semibold text-gray-900">{value}</div>
        {helperText ? <p className="text-xs text-gray-500 mt-1">{helperText}</p> : null}
      </div>
      {icon ? (
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${badge}`}>
          {icon}
        </div>
      ) : null}
    </div>
  );
};

export default StatCard;
