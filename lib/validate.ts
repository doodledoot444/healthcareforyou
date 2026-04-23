import { NextResponse, type NextRequest } from "next/server";
import { z, ZodError, type ZodTypeAny } from "zod";

type MaybePromise<T> = T | Promise<T>;

type InferSchema<T extends ZodTypeAny | undefined> = T extends ZodTypeAny ? z.infer<T> : undefined;

interface ValidationConfig<
  TBody extends ZodTypeAny | undefined,
  TQuery extends ZodTypeAny | undefined,
  TParams extends ZodTypeAny | undefined,
> {
  body?: TBody;
  query?: TQuery;
  params?: TParams;
}

interface ValidationContext<
  TBody extends ZodTypeAny | undefined,
  TQuery extends ZodTypeAny | undefined,
  TParams extends ZodTypeAny | undefined,
> {
  body: InferSchema<TBody>;
  query: InferSchema<TQuery>;
  params: InferSchema<TParams>;
}

class RequestValidationError extends Error {
  constructor(
    public readonly source: "body" | "query" | "params",
    public readonly issues: Array<{ path: string; message: string }>,
  ) {
    super("Validation failed");
  }
}

function toIssues(error: ZodError): Array<{ path: string; message: string }> {
  return error.issues.map((issue) => ({
    path: issue.path.join(".") || "root",
    message: issue.message,
  }));
}

function validationErrorResponse(error: RequestValidationError) {
  return NextResponse.json(
    {
      success: false,
      data: null,
      error: "Validation failed",
      details: {
        source: error.source,
        issues: error.issues,
      },
    },
    { status: 400 },
  );
}

function parseSchema<T extends ZodTypeAny>(source: "body" | "query" | "params", schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new RequestValidationError(source, toIssues(result.error));
  }

  return result.data;
}

function queryObjectFromRequest(request: NextRequest) {
  return Object.fromEntries(request.nextUrl.searchParams.entries());
}

export function withValidation<
  TBody extends ZodTypeAny | undefined = undefined,
  TQuery extends ZodTypeAny | undefined = undefined,
  TParams extends ZodTypeAny | undefined = undefined,
>(
  config: ValidationConfig<TBody, TQuery, TParams>,
  handler: (
    request: NextRequest,
    context: ValidationContext<TBody, TQuery, TParams>,
  ) => MaybePromise<Response>,
) {
  return async (
    request: NextRequest,
    routeContext?: { params?: Promise<unknown> | unknown },
  ): Promise<Response> => {
    try {
      let body: InferSchema<TBody> = undefined as InferSchema<TBody>;
      let query: InferSchema<TQuery> = undefined as InferSchema<TQuery>;
      let params: InferSchema<TParams> = undefined as InferSchema<TParams>;

      if (config.body) {
        const payload = await request.json().catch(() => {
          throw new RequestValidationError("body", [{ path: "root", message: "Invalid JSON body" }]);
        });
        body = parseSchema("body", config.body, payload) as InferSchema<TBody>;
      }

      if (config.query) {
        query = parseSchema("query", config.query, queryObjectFromRequest(request)) as InferSchema<TQuery>;
      }

      if (config.params) {
        const rawParams = routeContext?.params ? await routeContext.params : {};
        params = parseSchema("params", config.params, rawParams) as InferSchema<TParams>;
      }

      return await handler(request, { body, query, params });
    } catch (error) {
      if (error instanceof RequestValidationError) {
        return validationErrorResponse(error);
      }
      throw error;
    }
  };
}
