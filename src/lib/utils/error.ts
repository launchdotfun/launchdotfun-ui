import { AxiosError } from "axios";

export class ContractNotFoundError extends Error {
  constructor() {
    super("No contract found");
  }
}

export function getErrorMessage(error: any): string {
  if (error instanceof AxiosError) {
    if (typeof error.response?.data?.message === "string") return error.response.data.message;
    if (typeof error.response?.data?.error === "string") return error.response.data.error;
  }
  if (typeof error?.shortMessage === "string") return error.shortMessage;
  if (typeof error?.message === "string") return error.message;
  if (typeof error?.reason === "string") return error.reason;
  return error ? "Something went wrong" : "";
}
