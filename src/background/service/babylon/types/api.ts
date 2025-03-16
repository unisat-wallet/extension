export interface Pagination {
  next_key: string;
}

export interface QueryMeta {
  next: () => void;
  hasMore: boolean;
  isFetchingMore: boolean;
}
