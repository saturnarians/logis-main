export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const requestUrl = input instanceof Request ? input.url : input.toString();
  const method = init?.method ?? (input instanceof Request ? input.method : 'GET');
  const path = new URL(
    requestUrl,
    typeof window === 'undefined' ? 'http://localhost' : window.location.origin,
  ).pathname;
  const startedAt = Date.now();
  const details = { method: method.toUpperCase(), path };

  console.log('[api:fe] request started', JSON.stringify(details));

  try {
    const response = await fetch(input, init);
    console.log(
      '[api:fe] request completed',
      JSON.stringify({
        ...details,
        status: response.status,
        durationMs: Date.now() - startedAt,
      }),
    );
    return response;
  } catch (error) {
    console.error(
      '[api:fe] request failed',
      JSON.stringify({
        ...details,
        durationMs: Date.now() - startedAt,
        errorName: error instanceof Error ? error.name : 'UnknownError',
      }),
    );
    throw error;
  }
}
