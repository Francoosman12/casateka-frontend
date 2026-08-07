import React from "react";
import { Form, Pagination, Stack } from "react-bootstrap";
import { PAGE_SIZE_OPTIONS } from "../../hooks/usePagination";

const PaginationBar = ({
  page,
  setPage,
  pageSize,
  setPageSize,
  totalPages,
  totalItems,
}) => {
  if (totalItems === 0) return null;

  const goTo = (target) => setPage(Math.min(Math.max(target, 1), totalPages));

  return (
    <Stack
      direction="horizontal"
      className="flex-wrap justify-content-between align-items-center gap-2 mb-4 mt-n2 pagination-bar"
    >
      <div className="d-flex align-items-center gap-2">
        <Form.Label className="mb-0 small fw-bold">Mostrar:</Form.Label>
        <Form.Select
          size="sm"
          style={{ width: "auto" }}
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </Form.Select>
        <span className="small text-muted">
          {totalItems} registro{totalItems !== 1 ? "s" : ""}
        </span>
      </div>

      {totalPages > 1 && (
        <Pagination size="sm" className="mb-0">
          <Pagination.First onClick={() => goTo(1)} disabled={page === 1} />
          <Pagination.Prev
            onClick={() => goTo(page - 1)}
            disabled={page === 1}
          />
          <Pagination.Item active disabled>
            {page} / {totalPages}
          </Pagination.Item>
          <Pagination.Next
            onClick={() => goTo(page + 1)}
            disabled={page === totalPages}
          />
          <Pagination.Last
            onClick={() => goTo(totalPages)}
            disabled={page === totalPages}
          />
        </Pagination>
      )}
    </Stack>
  );
};

export default PaginationBar;
