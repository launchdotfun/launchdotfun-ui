import { TPresale, TPresaleListFilters, TPresaleStatusUpdatePayload } from "./types";
import authorizedRequest from "@/lib/api-client";

const USE_MOCK_PRESALES = process.env.NEXT_PUBLIC_USE_MOCK_PRESALES === "true";
const PRESALES_PATH = "/presales";
const LIST_ENDPOINT = USE_MOCK_PRESALES ? "/mock/presales" : PRESALES_PATH;

function buildListParams(filters?: TPresaleListFilters) {
  if (!filters) return undefined;

  const params: Record<string, string> = {};
  const status = filters.status;
  if (status) {
    const statuses = Array.isArray(status) ? status : [status];
    params.status = statuses
      .map((entry) => (typeof entry === "string" ? entry : String(entry)))
      .filter(Boolean)
      .join(",");
  }

  const owner = filters.owner ?? filters.creator;
  if (owner) {
    params.creator = owner.toLowerCase();
  }

  if (filters.token) {
    params.token = filters.token.toLowerCase();
  }

  if (filters.startDate) {
    params.startDate = filters.startDate;
  }
  if (filters.endDate) {
    params.endDate = filters.endDate;
  }

  const onchain = filters.onchainStatus;
  if (onchain) {
    const statuses = Array.isArray(onchain) ? onchain : [onchain];
    params.onchainStatus = statuses
      .map((entry) => (typeof entry === "string" ? entry : String(entry)))
      .filter(Boolean)
      .join(",");
  }

  return params;
}

export const presaleApi = {
  getPresaleList: (filters?: TPresaleListFilters) => {
    return authorizedRequest.get<TPresale[], TPresale[]>(LIST_ENDPOINT, {
      params: buildListParams(filters),
    });
  },
  createPresale: (data: Omit<TPresale, "id">) => {
    return authorizedRequest.post<TPresale, TPresale>(PRESALES_PATH, data);
  },
  getPresaleByAddress: (address: string) => {
    if (USE_MOCK_PRESALES) {
      return authorizedRequest.get<TPresale, TPresale>(`${LIST_ENDPOINT}/${address}`);
    }
    return authorizedRequest.get<TPresale, TPresale>(`${PRESALES_PATH}/${address}`);
  },
  updatePresale: (id: string | number, data: Partial<TPresale>) => {
    return authorizedRequest.put<TPresale, TPresale>(`${PRESALES_PATH}/${id}`, data);
  },
  updatePresaleStatus: (payload: TPresaleStatusUpdatePayload) => {
    return authorizedRequest.patch<TPresale, TPresale>(PRESALES_PATH, payload);
  },
};
