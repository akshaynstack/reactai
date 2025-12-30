import { NextResponse } from "next/server";

/**
 * GET /api/models
 * Fetches available models from an OpenAI-compatible API endpoint.
 * Uses LLM_BASE_URL from environment to discover models via /v1/models.
 */
export async function GET() {
    try {
        const baseUrl = process.env.LLM_BASE_URL;
        const apiKey = process.env.LLM_API_KEY;

        if (!baseUrl) {
            return NextResponse.json(
                { error: "LLM_BASE_URL not configured" },
                { status: 500 }
            );
        }

        // Construct the models endpoint URL
        // Handle different URL formats (with or without /v1 suffix)
        let modelsUrl = baseUrl.replace(/\/$/, ""); // Remove trailing slash
        if (!modelsUrl.endsWith("/v1")) {
            modelsUrl = modelsUrl + "/v1";
        }
        modelsUrl = modelsUrl + "/models";

        console.log(`Fetching models from: ${modelsUrl}`);

        const response = await fetch(modelsUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to fetch models: ${response.status} ${errorText}`);
            return NextResponse.json(
                { error: `Failed to fetch models: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();

        // OpenAI-compatible API returns { data: [...models], object: "list" }
        const models = data.data || [];

        // Transform to our format: { label, value }
        const formattedModels = models.map((model: { id: string; name?: string }) => ({
            label: model.name || model.id,
            value: model.id,
        }));

        // Sort models alphabetically by label
        formattedModels.sort((a: { label: string }, b: { label: string }) =>
            a.label.localeCompare(b.label)
        );

        return NextResponse.json({
            models: formattedModels,
            count: formattedModels.length,
        });
    } catch (error) {
        console.error("Error fetching models:", error);
        return NextResponse.json(
            { error: "Failed to fetch models", details: String(error) },
            { status: 500 }
        );
    }
}
