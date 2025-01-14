import { NextResponse } from "next/server";
import Replicate from "replicate";
import { createCanvas } from "canvas";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    const { modelId, ...parameters } = await req.json();

    // Prepare input based on model type
    let input: Record<string, any> = { ...parameters };

    // Handle editing mode (image and mask)
    if (parameters.image) {
      // Pass the image URL directly
      input.image = parameters.image;

      // Handle mask if present
      if (parameters.mask && typeof parameters.mask === "object") {
        const { x, y, width, height, imageWidth, imageHeight } =
          parameters.mask;

        // Create a canvas with the image dimensions
        const canvas = createCanvas(imageWidth, imageHeight);
        const ctx = canvas.getContext("2d");

        // Draw black background
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, imageWidth, imageHeight);

        // Draw white rectangle for mask
        ctx.fillStyle = "white";
        ctx.fillRect(x, y, width, height);

        // Convert to base64
        const dataUrl = canvas.toDataURL("image/png");

        // Set the mask as a data URL
        input.mask = dataUrl;

        // Clean up the input object
        delete input.mask.x;
        delete input.mask.y;
        delete input.mask.width;
        delete input.mask.height;
        delete input.mask.imageWidth;
        delete input.mask.imageHeight;
      }
    }

    // Remove any undefined or null values
    Object.keys(input).forEach((key) => {
      if (input[key] === undefined || input[key] === null) {
        delete input[key];
      }
    });

    console.log("Sending to Replicate:", { modelId, input });

    const output = await replicate.run(modelId, { input });

    // Handle different output formats
    const url = Array.isArray(output) ? output[0] : output;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error generating image:", error);
    console.error(
      "Error details:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      {
        error: "Failed to generate image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
