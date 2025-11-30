import { BACKEND_API_ROOT, TIME_OUT_API } from "@/lib/configs/constants";
import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import qs from "query-string";

export const serializeParams = (params: Record<string, any>) => {
  const { filter, sort, ...other } = params;
  const queryStr = qs.stringify(other);
  const strings = [];
  if (queryStr) strings.push(queryStr);

  if (typeof filter === "object") {
    const filterStr = Object.entries(filter)
      .map(([key, value]) => `filter%5B${key}%5D=${value}`)
      .join("&");
    if (filterStr) {
      strings.push(filterStr);
    }
  }

  if (typeof sort === "object") {
    const sortStr = Object.entries(sort)
      .map(([key, value]) => `sort%5B${key}%5D=${value}`)
      .join("&");
    if (sortStr) {
      strings.push(sortStr);
    }
  }

  return strings.join("&");
};

const CancelToken = axios.CancelToken.source();
const authorizedRequest: AxiosInstance = axios.create({
  baseURL: BACKEND_API_ROOT,
  cancelToken: CancelToken.token,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: TIME_OUT_API,
  paramsSerializer: {
    serialize: serializeParams,
  },
});

authorizedRequest.interceptors.request.use((config) => {
  // const token = getAuthToken();
  // if (token) {
  //   config.headers.Authorization = token ? `Bearer ${token}` : "";
  // }

  return config;
});

authorizedRequest.interceptors.response.use(
  (response: AxiosResponse) => {
    return response?.data;
  },
  (error) => {
    const { response, config } = error as AxiosError;
    if (!response || !config) return Promise.reject(error);

    return Promise.reject(error);
  }
);
export default authorizedRequest;
