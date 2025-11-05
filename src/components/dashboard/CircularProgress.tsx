interface CircularProgressProps {
  label: string;
  current: number;
  target: number;
  color: string;
  unit?: string;
}

export const CircularProgress = ({ label, current, target, color, unit = '' }: CircularProgressProps) => {
  const percentage = Math.min((current / target) * 100, 100);
  const circumference = 2 * Math.PI * 50;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
      <div className="relative w-40 h-40 mb-4">
        <svg className="transform -rotate-90 w-40 h-40">
          <circle
            cx="80"
            cy="80"
            r="50"
            stroke="#e5e7eb"
            strokeWidth="12"
            fill="none"
          />
          <circle
            cx="80"
            cy="80"
            r="50"
            stroke={color}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-xl font-bold text-gray-800">
            {Math.round(current).toLocaleString()}
          </span>
          <span className="text-xs text-gray-500">/ {Math.round(target).toLocaleString()}</span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-sm font-medium text-gray-600">{label}</div>
        {unit && <div className="text-xs text-gray-500 mt-1">{unit}</div>}
      </div>
    </div>
  );
};
