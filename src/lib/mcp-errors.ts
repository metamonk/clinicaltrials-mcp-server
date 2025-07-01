/**
 * MCP-compliant error codes and utilities
 * Based on JSON-RPC 2.0 error codes
 */

export enum MCPErrorCode {
  // Standard JSON-RPC 2.0 errors
  PARSE_ERROR = -32700,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
  
  // Application-specific errors (must be -32000 to -32099)
  API_ERROR = -32000,
  VALIDATION_ERROR = -32001,
  RATE_LIMIT_ERROR = -32002,
  NOT_FOUND_ERROR = -32003,
  NETWORK_ERROR = -32004,
}

export class MCPError extends Error {
  constructor(
    public code: MCPErrorCode,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'MCPError';
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      data: this.data
    };
  }
}

/**
 * Convert any error to an MCP-compliant error response
 */
export function toMCPError(error: unknown): MCPError {
  // If it's already an MCPError, return it
  if (error instanceof MCPError) {
    return error;
  }

  // Handle Zod validation errors
  if (error instanceof Error && error.name === 'ZodError') {
    return new MCPError(
      MCPErrorCode.INVALID_PARAMS,
      'Invalid input parameters',
      error
    );
  }

  // Handle ClinicalTrials API errors
  if (error instanceof Error && 'code' in error) {
    const errorCode = (error as Error & { code: string }).code;
    if (errorCode === 'RATE_LIMIT') {
      return new MCPError(
        MCPErrorCode.RATE_LIMIT_ERROR,
        error.message,
        { originalError: errorCode }
      );
    }
    if (errorCode === 'NOT_FOUND') {
      return new MCPError(
        MCPErrorCode.NOT_FOUND_ERROR,
        error.message,
        { originalError: errorCode }
      );
    }
    if (errorCode === 'NETWORK_ERROR') {
      return new MCPError(
        MCPErrorCode.NETWORK_ERROR,
        error.message,
        { originalError: errorCode }
      );
    }
  }

  // Default to internal error
  if (error instanceof Error) {
    return new MCPError(
      MCPErrorCode.INTERNAL_ERROR,
      error.message,
      { stack: error.stack }
    );
  }

  return new MCPError(
    MCPErrorCode.INTERNAL_ERROR,
    'An unknown error occurred',
    { originalError: error }
  );
}