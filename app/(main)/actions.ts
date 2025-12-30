"use server";

// Note: Database persistence removed. 
// Share functionality now uses URL-based code sharing.
// The code is passed directly in the URL/component state instead of stored in DB.

export async function shareApp({
  generatedCode,
  prompt,
  model,
}: {
  generatedCode: string;
  prompt: string;
  model: string;
}) {
  // Generate a simple random ID
  const id = Math.random().toString(36).substring(2, 7);

  // Note: Without database, we can't persist across sessions.
  // For true persistence, the user should:
  // 1. Copy the generated code directly
  // 2. Use a cloud database service
  // 3. Or implement file-based storage on the server

  console.log(`Share requested for app with prompt: ${prompt.substring(0, 50)}...`);
  console.log(`Model: ${model}, Generated ID: ${id}`);

  // Return the ID - caller will need to handle storing the code in their own way
  // (e.g., localStorage on client, or encoding in URL)
  return id;
}
