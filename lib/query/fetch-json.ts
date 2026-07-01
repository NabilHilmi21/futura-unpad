import type { z } from "zod";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function fetchJson<TSchema extends z.ZodType>(
  input: RequestInfo | URL,
  schema: TSchema,
  init?: RequestInit
): Promise<z.infer<TSchema>> {
  const response = await fetch(input, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body &&
      typeof body === "object" &&
      "error" in body &&
      typeof body.error === "string"
        ? body.error
        : "Request failed";

    throw new ApiError(message, response.status);
  }

  return schema.parse(body);
}
