import { ModelConfig } from "@/types/image-editor";

interface ModelSelectorProps {
  models: ModelConfig[];
  selectedModel: ModelConfig | null;
  onSelect: (model: ModelConfig) => void;
}

export default function ModelSelector({
  models,
  selectedModel,
  onSelect,
}: ModelSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900">
        Select Model
      </label>
      <div className="relative">
        <select
          value={selectedModel?.id || ""}
          onChange={(e) => {
            const model = models.find((m) => m.id === e.target.value);
            if (model) onSelect(model);
          }}
          className="w-full px-3 py-2 text-gray-900 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
        >
          <option value="" disabled>
            Select a model...
          </option>
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name} ({model.type})
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
      {selectedModel && (
        <div className="text-sm text-gray-600">
          Current: {selectedModel.name} ({selectedModel.type})
        </div>
      )}
    </div>
  );
}
