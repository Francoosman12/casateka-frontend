import React from "react";
import { Table } from "react-bootstrap";
import usePagination from "../../hooks/usePagination";
import PaginationBar from "./PaginationBar";

/**
 * Tabla con paginación (20/50/100 por página) reutilizable.
 * `subtotalRow` recibe siempre el array completo `items` desde el llamador,
 * por lo que el subtotal refleja el grupo entero y no solo la página visible.
 */
const PaginatedTable = ({
  items,
  headerRow,
  renderRow,
  subtotalRow,
  className,
  responsive,
  pageSize = 20,
}) => {
  const { pageItems, startIndex, ...pagination } = usePagination(
    items,
    pageSize
  );

  return (
    <>
      <Table
        striped
        bordered
        hover
        responsive={responsive}
        className={className}
      >
        <thead>{headerRow}</thead>
        <tbody>
          {pageItems.map((item, i) => renderRow(item, startIndex + i))}
          {subtotalRow}
        </tbody>
      </Table>
      <PaginationBar {...pagination} totalItems={items.length} />
    </>
  );
};

export default PaginatedTable;
