interface GenerateImageParams {
  modelId: string;
  parameters: Record<string, any>;
}

interface GenerateImageResponse {
  urls: string[];
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

  return await response.json();
}
