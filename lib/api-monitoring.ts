export function withApiLogging<
  TRequest extends Request,
  TContext extends unknown[],
>(
  handler: (
    request: TRequest,
    ...context: TContext
  ) => Response | Promise<Response>,
): (request: TRequest, ...context: TContext) => Promise<Response> {
  return async (request, ...context) => {
    const startedAt = Date.now();
    const path = new URL(request.url).pathname;
    const details = {
      method: request.method,
      path,
    };

    console.log("[api:be] request started", JSON.stringify(details));

    try {
      const response = await handler(request, ...context);
      console.log(
        "[api:be] request completed",
        JSON.stringify({
          ...details,
          status: response.status,
          durationMs: Date.now() - startedAt,
        }),
      );
      return response;
    } catch (error) {
      console.error(
        "[api:be] request failed",
        JSON.stringify({
          ...details,
          status: 500,
          durationMs: Date.now() - startedAt,
          errorName: error instanceof Error ? error.name : "UnknownError",
        }),
      );
      throw error;
    }
  };
}
