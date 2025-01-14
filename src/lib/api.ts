interface GenerateImageParams {
  modelId: string;
  parameters: Record<string, any>;
}

interface GenerateImageResponse {
  id: string;
  url: string;
}

export async function generateImage({
  modelId,
  parameters,
}: GenerateImageParams): Promise<GenerateImageResponse> {
  const response = await fetch("/api/replicate/generate-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      modelId,
      ...parameters,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate image");
  }

  const data = await response.json();
  return {
    id: data.id || Date.now().toString(),
    url: data.url,
  };
}
