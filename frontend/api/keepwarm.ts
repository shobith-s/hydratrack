export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // Uses VITE_API_BASE_URL to ping the HuggingFace space /health endpoint
  // to prevent it from sleeping due to inactivity.
  
  const backendUrl = process.env.VITE_API_BASE_URL;
  if (!backendUrl) {
    return new Response(JSON.stringify({ error: "Backend URL not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const res = await fetch(`${backendUrl}/health`);
    if (res.ok) {
      return new Response(JSON.stringify({ status: "ok", message: "Backend is awake" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } else {
      return new Response(JSON.stringify({ status: "error", message: "Backend returned non-200" }), {
        status: 502,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (e: any) {
    return new Response(JSON.stringify({ status: "error", message: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
