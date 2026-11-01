import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { api, ApiError, unwrap } from "@/lib/api";

export const PAGE_SIZE = 25;

export function useCustomers({ query, page }: { query: string; page: number }) {
  return useQuery({
    queryKey: ["customers", { query, page }],
    queryFn: () => unwrap(api.GET("/api/v1/customers", { params: { query: { q: query || null, page, page_size: PAGE_SIZE } } })),
    placeholderData: keepPreviousData,
  });
}

export function useCustomer(customerId: number) {
  return useQuery({
    queryKey: ["customers", "detail", customerId],
    queryFn: () => unwrap(api.GET("/api/v1/customers/{customer_id}", { params: { path: { customer_id: customerId } } })),
    enabled: Number.isInteger(customerId),
    retry: (count, e) => !(e instanceof ApiError && e.status === 404) && count < 2,
  });
}
