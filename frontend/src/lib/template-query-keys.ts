export const templateQueryKeys = {
  all: ["templates"] as const,
  list: () => [...templateQueryKeys.all, "list"] as const,
  detail: (id: string) => [...templateQueryKeys.all, "detail", id] as const,
};
