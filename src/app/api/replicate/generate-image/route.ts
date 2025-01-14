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
        console.log("API Mask Data:", {
          mask: { x, y, width, height },
          image: { width: imageWidth, height: imageHeight },
        });

        // Create a canvas with the image dimensions
        const canvas = createCanvas(imageWidth, imageHeight);
        const ctx = canvas.getContext("2d");

        // Handle mask colors based on model and mode
        const isIdeogramModel = modelId.includes("ideogram-ai");
        const isOutpaintMode = parameters.paintMode === "outpaint";

        // For Ideogram models: invert colors only in inpainting mode
        // For other models: invert colors in outpainting mode
        const shouldInvertMask = isIdeogramModel
          ? parameters.paintMode === "inpaint" // Ideogram: invert for inpaint
          : parameters.paintMode === "outpaint"; // Others: invert for outpaint

        // Set background color
        ctx.fillStyle = shouldInvertMask ? "white" : "black";
        ctx.fillRect(0, 0, imageWidth, imageHeight);

        // Set mask color (opposite of background)
        ctx.fillStyle = shouldInvertMask ? "black" : "white";
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
        delete input.paintMode; // Remove paintMode from input as it's only used for mask processing
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

    // Handle array output (multiple images)
    const urls = Array.isArray(output) ? output : [output];

    return NextResponse.json({ urls });
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
