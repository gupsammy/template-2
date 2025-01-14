import { ModelParameter } from "@/types/image-editor";

interface DynamicFormProps {
  parameters: ModelParameter[];
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
}

export default function DynamicForm({
  parameters,
  values,
  onChange,
}: DynamicFormProps) {
  const handleChange = (name: string, value: any) => {
    onChange({ ...values, [name]: value });
  };

  return (
    <div className="space-y-4">
      {parameters.map((param) => (
        <div key={param.name} className="space-y-2">
          <label
            htmlFor={param.name}
            className="block text-sm font-medium text-gray-900"
          >
            {param.label}
          </label>

          {param.type === "text" && (
            <textarea
              id={param.name}
              value={values[param.name] || ""}
              onChange={(e) => handleChange(param.name, e.target.value)}
              className="w-full px-3 py-2 text-gray-900 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          )}

          {param.type === "number" && (
            <input
              type="number"
              id={param.name}
              value={values[param.name] || param.default || ""}
              onChange={(e) => handleChange(param.name, Number(e.target.value))}
              min={param.min}
              max={param.max}
              step={param.step}
              className="w-full px-3 py-2 text-gray-900 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          )}

          {param.type === "select" && param.options && (
            <div className="relative">
              <select
                id={param.name}
                value={values[param.name] || param.default || ""}
                onChange={(e) => handleChange(param.name, e.target.value)}
                className="w-full px-3 py-2 text-gray-900 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                {param.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          )}

          {param.type === "range" && (
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  id={param.name}
                  value={values[param.name] || param.default || param.min || 0}
                  onChange={(e) =>
                    handleChange(param.name, Number(e.target.value))
                  }
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  className="flex-1"
                />
                <span className="text-sm text-gray-900 tabular-nums">
                  {values[param.name] || param.default || param.min || 0}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{param.min}</span>
                <span>{param.max}</span>
              </div>
            </div>
          )}

          {param.default !== undefined && (
            <div className="text-xs text-gray-500">
              Default: {param.default}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
