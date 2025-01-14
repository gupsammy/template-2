"use client";

import { useState } from "react";
import {
  ImageEditorState,
  ViewMode,
  ImageData,
  ModelConfig,
} from "@/types/image-editor";
import ImageWorkspace from "@/components/ImageWorkspace";
import HistoryPanel from "@/components/HistoryPanel";
import ActionButtons from "@/components/ActionButtons";
import ModelSelector from "@/components/ModelSelector";
import DynamicForm from "@/components/DynamicForm";
import { GENERATION_MODELS, EDITING_MODELS } from "@/lib/models";
import { generateImage } from "@/lib/api";

export default function ImageEditor() {
  const [state, setState] = useState<ImageEditorState>({
    currentImage: null,
    generatedImages: [],
    editMask: null,
    selectedModel: null,
    history: [],
    viewMode: "single",
    isLoading: false,
    error: null,
    parameters: {},
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleModelSelect = (model: ModelConfig) => {
    setState((prev) => ({ ...prev, selectedModel: model }));
  };

  const handleFormChange = (newFormData: Record<string, any>) => {
    setFormData(newFormData);
    setState((prev) => ({ ...prev, parameters: newFormData }));
  };

  const handleGenerate = async () => {
    if (!state.selectedModel) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await generateImage({
        modelId: state.selectedModel.id,
        parameters: {
          ...state.parameters,
          mask: state.editMask,
          image: state.currentImage?.url,
        },
      });

      const newImages = result.urls.map((url, index) => ({
        id: `${Date.now()}-${index}`,
        url,
        prompt: state.parameters?.prompt,
        timestamp: Date.now(),
        modelId: state.selectedModel!.id,
        parameters: state.parameters,
      }));

      setState((prev) => ({
        ...prev,
        currentImage: newImages[0],
        generatedImages: newImages,
        history: [...newImages, ...prev.history],
        isLoading: false,
        editMask: null,
        selectedModel: state.editMask
          ? GENERATION_MODELS[0]
          : prev.selectedModel,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to generate image",
      }));
    }
  };

  const handleCancelEdit = () => {
    setState((prev) => ({
      ...prev,
      editMask: null,
      selectedModel: GENERATION_MODELS[0],
    }));
  };

  // Get basic and advanced parameters
  const basicParams =
    state.selectedModel?.parameters.filter((p) => p.name === "prompt") || [];
  const advancedParams =
    state.selectedModel?.parameters.filter((p) => p.name !== "prompt") || [];

  return (
    <main className="flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        <div className="flex-1">
          <ImageWorkspace state={state} setState={setState} />
        </div>
        <div className="w-96 bg-white border-l">
          <div className="h-full overflow-y-auto p-6 text-gray-900">
            <h2 className="text-xl font-semibold mb-6">Image Editor</h2>
            <div className="space-y-6">
              {/* Upload Button Only */}
              <ActionButtons state={state} setState={setState} uploadOnly />

              <ModelSelector
                models={state.editMask ? EDITING_MODELS : GENERATION_MODELS}
                selectedModel={state.selectedModel}
                onSelect={handleModelSelect}
              />

              {state.selectedModel && (
                <>
                  {/* Basic Parameters (Prompt) */}
                  <DynamicForm
                    parameters={basicParams}
                    values={formData}
                    onChange={handleFormChange}
                  />

                  {/* Generate/Edit Buttons */}
                  {state.editMask ? (
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 px-4 py-2 text-gray-900 bg-white border rounded-lg hover:bg-gray-50"
                      >
                        Cancel Edit
                      </button>
                      <button
                        onClick={handleGenerate}
                        disabled={state.isLoading}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {state.isLoading ? "Processing..." : "Apply Edit"}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleGenerate}
                      disabled={state.isLoading || !state.selectedModel}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {state.isLoading ? "Generating..." : "Generate"}
                    </button>
                  )}

                  {/* Advanced Settings Toggle */}
                  <div className="pt-4">
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                      <span>Advanced Settings</span>
                      <svg
                        className={`w-5 h-5 transition-transform ${
                          showAdvanced ? "rotate-180" : ""
                        }`}
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
                    </button>
                  </div>

                  {/* Advanced Parameters */}
                  {showAdvanced && (
                    <div className="pt-4">
                      <DynamicForm
                        parameters={advancedParams}
                        values={formData}
                        onChange={handleFormChange}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* History Panel */}
      <div className="h-48 border-t bg-white">
        <HistoryPanel
          history={state.history}
          onSelectImage={(image: ImageData) =>
            setState((prev) => ({ ...prev, currentImage: image }))
          }
          className="h-full"
        />
      </div>
    </main>
  );
}
