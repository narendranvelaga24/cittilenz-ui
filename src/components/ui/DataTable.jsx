import { motion } from "framer-motion";
import { Columns, Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useClickOutside } from "../../hooks/useClickOutside.js";
import { EmptyState } from "./EmptyState.jsx";
import { Skeleton } from "./Skeleton.jsx";
import { TableRowsSkeleton } from "./LoadingSkeletons.jsx";

const MotionRow = motion.tr;

function normalizeValue(value) {
  if (value === undefined || value === null) return "";
  return String(value).toLowerCase();
}

function getColumnValue(column, row) {
  if (column.accessor) return column.accessor(row);
  return row[column.key];
}

function isSortableColumn(column) {
  return column.enableSort !== false && column.key !== "actions" && column.key !== "action";
}

function getColumnLabel(column) {
  if (typeof column.header === "string") return column.header;
  return column.label || column.key;
}

function sortRows(rows, column, direction) {
  if (!column) return rows;
  const multiplier = direction === "desc" ? -1 : 1;

  return [...rows].sort((first, second) => {
    const firstValue = column.sortValue ? column.sortValue(first) : getColumnValue(column, first);
    const secondValue = column.sortValue ? column.sortValue(second) : getColumnValue(column, second);

    const firstNumber = Number(firstValue);
    const secondNumber = Number(secondValue);
    if (Number.isFinite(firstNumber) && Number.isFinite(secondNumber)) {
      return (firstNumber - secondNumber) * multiplier;
    }

    return String(firstValue ?? "").localeCompare(String(secondValue ?? ""), undefined, { numeric: true, sensitivity: "base" }) * multiplier;
  });
}

export function DataTable({
  ariaLabel,
  caption,
  columns,
  rows = [],
  getRowKey,
  isLoading,
  loadingText = "Loading...",
  emptyTitle,
  emptyDescription,
  toolbar,
  filters,
  searchPlaceholder = "Search table...",
  initialVisibleColumns,
  searchValue,
  onSearchChange,
  visibleColumns,
  onVisibleColumnsChange,
  sortKey,
  sortDirection,
  onSortChange,
}) {
  const defaultVisibleColumns = useMemo(() => new Set(initialVisibleColumns || columns.map((column) => column.key)), [columns, initialVisibleColumns]);
  const [internalSearchValue, setInternalSearchValue] = useState("");
  const [internalVisibleColumns, setInternalVisibleColumns] = useState(defaultVisibleColumns);
  const [internalSortState, setInternalSortState] = useState({ key: "", direction: "asc" });
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const columnMenuRef = useRef(null);

  useClickOutside(columnMenuRef, () => setIsColumnMenuOpen(false), isColumnMenuOpen);

  const currentSearchValue = searchValue ?? internalSearchValue;
  const currentVisibleColumns = visibleColumns || internalVisibleColumns;
  const currentSortState = {
    key: sortKey ?? internalSortState.key,
    direction: sortDirection ?? internalSortState.direction,
  };

  const shownColumns = columns.filter((column) => currentVisibleColumns.has(column.key));
  const sortableColumns = columns.filter(isSortableColumn);
  const activeSortColumn = columns.find((column) => column.key === currentSortState.key);
  const loadingColumnCount = Math.max(1, shownColumns.length || columns.length || 1);
  const loadingRowCount = Math.min(Math.max(rows.length || 6, 4), 8);

  const filteredRows = useMemo(() => {
    const query = currentSearchValue.trim().toLowerCase();
    if (!query) return rows;

    return rows.filter((row) => columns.some((column) => {
      if (column.searchable === false) return false;
      const value = column.searchValue ? column.searchValue(row) : getColumnValue(column, row);
      return normalizeValue(value).includes(query);
    }));
  }, [columns, currentSearchValue, rows]);

  const displayedRows = useMemo(() => sortRows(filteredRows, activeSortColumn, currentSortState.direction), [activeSortColumn, currentSortState.direction, filteredRows]);
  const tableMinWidth = `${Math.max(760, shownColumns.length * 160)}px`;

  function updateSearch(nextValue) {
    if (onSearchChange) {
      onSearchChange(nextValue);
      return;
    }
    setInternalSearchValue(nextValue);
  }

  function updateVisibleColumns(nextColumns) {
    if (onVisibleColumnsChange) {
      onVisibleColumnsChange(nextColumns);
      return;
    }
    setInternalVisibleColumns(nextColumns);
  }

  function updateSort(nextSortState) {
    if (onSortChange) {
      onSortChange(nextSortState);
      return;
    }
    setInternalSortState(nextSortState);
  }

  function toggleColumn(columnKey) {
    const next = new Set(currentVisibleColumns);
    if (next.has(columnKey)) {
      if (next.size === 1) return;
      next.delete(columnKey);
    } else {
      next.add(columnKey);
    }
    updateVisibleColumns(next);
  }

  function toggleSort(columnKey) {
    if (currentSortState.key !== columnKey) {
      updateSort({ key: columnKey, direction: "asc" });
      return;
    }
    updateSort({ key: columnKey, direction: currentSortState.direction === "asc" ? "desc" : "asc" });
  }

  function changeSort(columnKey) {
    if (!columnKey) {
      updateSort({ key: "", direction: "asc" });
      return;
    }

    updateSort({
      key: columnKey,
      direction: currentSortState.key === columnKey ? currentSortState.direction : "asc",
    });
  }

  return (
    <div className="table-card" aria-busy={isLoading}>
      <div className="table-toolbar table-toolbar-rich">
        <div className="table-toolbar-summary">
          {toolbar || (
            isLoading
              ? (
                <>
                  <Skeleton className="skeleton-line skeleton-line-short skeleton-toolbar-title" />
                  <Skeleton className="skeleton-kicker skeleton-toolbar-meta" />
                </>
              )
              : <><strong>{caption || "Data"}</strong><span>{displayedRows.length} rows</span></>
          )}
        </div>
        <div className="table-toolbar-controls">
          <label className="table-search">
            <Search size={15} />
            <input
              aria-label={searchPlaceholder}
              disabled={isLoading}
              placeholder={searchPlaceholder}
              type="search"
              value={currentSearchValue}
              onChange={(event) => updateSearch(event.target.value)}
            />
          </label>
          {filters}
          <div className="table-toolbar-utility-controls">
            {sortableColumns.length > 0 ? (
              <div className="table-toolbar-sort-group" role="group" aria-label={`${ariaLabel || caption || "Table"} sorting`}>
                <label className="table-sort-field">
                  <span>Sort</span>
                  <select
                    aria-label={`Sort ${ariaLabel || caption || "table"} by`}
                    disabled={isLoading}
                    value={currentSortState.key}
                    onChange={(event) => changeSort(event.target.value)}
                  >
                    <option value="">Default order</option>
                    {sortableColumns.map((column) => (
                      <option key={column.key} value={column.key}>{getColumnLabel(column)}</option>
                    ))}
                  </select>
                </label>
                <button
                  aria-label={currentSortState.direction === "asc" ? "Switch to descending order" : "Switch to ascending order"}
                  className="table-sort-order-button"
                  disabled={isLoading || !currentSortState.key}
                  onClick={() => toggleSort(currentSortState.key)}
                  type="button"
                >
                  {currentSortState.direction === "asc" ? "Asc" : "Desc"}
                </button>
              </div>
            ) : null}
            <div className="table-menu" ref={columnMenuRef}>
              <button
                aria-expanded={isColumnMenuOpen}
                className="table-menu-trigger"
                disabled={isLoading}
                onClick={() => setIsColumnMenuOpen((open) => !open)}
                type="button"
              >
                <Columns size={15} /> Columns
              </button>
              {isColumnMenuOpen && (
              <div className="table-menu-content" role="menu">
                {columns.map((column) => (
                  <label key={column.key} role="menuitem">
                    <input checked={currentVisibleColumns.has(column.key)} onChange={() => toggleColumn(column.key)} type="checkbox" />
                    <span className="table-menu-label">{getColumnLabel(column)}</span>
                  </label>
                ))}
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {isLoading ? (
        <>
          <span className="sr-only" role="status" aria-live="polite">{loadingText}</span>
          <TableRowsSkeleton columnCount={loadingColumnCount} rowCount={loadingRowCount} />
        </>
      ) : (
        <div className="table-scroll-shell" style={{ "--table-min-width": tableMinWidth }}>
          <table aria-label={ariaLabel}>
            {caption && <caption>{caption}</caption>}
            <thead>
              <tr>
                {shownColumns.map((column) => (
                  <th
                    aria-sort={isSortableColumn(column) ? (currentSortState.key === column.key ? (currentSortState.direction === "asc" ? "ascending" : "descending") : "none") : undefined}
                    key={column.key}
                  >
                    {isSortableColumn(column) ? (
                      <button
                        className={`table-sort-button${currentSortState.key === column.key ? " is-active" : ""}`}
                        onClick={() => toggleSort(column.key)}
                        type="button"
                      >
                        <span className="table-sort-label">{getColumnLabel(column)}</span>
                        <span className="table-sort-indicator" aria-hidden="true">{currentSortState.key === column.key ? (currentSortState.direction === "asc" ? "↑" : "↓") : "↕"}</span>
                      </button>
                    ) : column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedRows.map((row, index) => (
                <MotionRow
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 12 }}
                  key={getRowKey(row)}
                  transition={{ delay: Math.min(index * 0.035, 0.28), duration: 0.25, ease: "easeOut" }}
                >
                  {shownColumns.map((column) => (
                    <td data-label={getColumnLabel(column)} key={column.key}>{column.render ? column.render(row) : getColumnValue(column, row)}</td>
                  ))}
                </MotionRow>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!isLoading && displayedRows.length === 0 && <EmptyState title={emptyTitle || "No results"} description={emptyDescription} />}
    </div>
  );
}
