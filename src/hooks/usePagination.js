import { useEffect, useMemo, useState } from "react";

export const PAGE_SIZE_OPTIONS = [20, 50, 100];

const usePagination = (items = [], initialPageSize = PAGE_SIZE_OPTIONS[0]) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Si los datos cambian (filtro, eliminación, etc.) y la página actual queda fuera de rango, la ajustamos.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const startIndex = (page - 1) * pageSize;

  const pageItems = useMemo(
    () => items.slice(startIndex, startIndex + pageSize),
    [items, startIndex, pageSize]
  );

  const setPageSize = (newSize) => {
    setPageSizeState(newSize);
    setPage(1);
  };

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    startIndex,
    pageItems,
  };
};

export default usePagination;
