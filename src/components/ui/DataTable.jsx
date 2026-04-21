import { motion } from "framer-motion";
import { Columns, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "./EmptyState.jsx";

const MotionRow = motion.tr;

function normalizeValue(value) {
  if (value === undefined || value === null) return "";
  return String(value).toLowerCase();
}

function getColumnValue(column, row) {
  if (column.accessor) return column.accessor(row);
  return row[column.key];
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

  const currentSearchValue = searchValue ?? internalSearchValue;
  const currentVisibleColumns = visibleColumns || internalVisibleColumns;
  const currentSortState = {
    key: sortKey ?? internalSortState.key,
    direction: sortDirection ?? internalSortState.direction,
  };

  const shownColumns = columns.filter((column) => currentVisibleColumns.has(column.key));
  const sortableColumns = columns.filter((column) => column.enableSort !== false && column.key !== "actions" && column.key !== "action");
  const activeSortColumn = columns.find((column) => column.key === currentSortState.key);

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

  return (
    <div className="table-card">
      <div className="table-toolbar table-toolbar-rich">
        <div className="table-toolbar-summary">
          {toolbar || <><strong>{caption || "Data"}</strong><span>{displayedRows.length} rows</span></>}
        </div>
        <div className="table-toolbar-controls">
          <label className="table-search">
            <Search size={15} />
            <input
              aria-label={searchPlaceholder}
              placeholder={searchPlaceholder}
              type="search"
              value={currentSearchValue}
              onChange={(event) => updateSearch(event.target.value)}
            />
          </label>
          {filters}
          <details className="table-menu">
            <summary><Columns size={15} /> Columns</summary>
            <div className="table-menu-content">
              {columns.map((column) => (
                <label key={column.key}>
                  <input checked={currentVisibleColumns.has(column.key)} onChange={() => toggleColumn(column.key)} type="checkbox" />
                  {column.header || column.key}
                </label>
              ))}
            </div>
          </details>
        </div>
      </div>
      {isLoading ? (
        <div className="table-loading">{loadingText}</div>
      ) : (
        <div className="table-scroll-shell">
          <table aria-label={ariaLabel}>
            {caption && <caption>{caption}</caption>}
            <thead>
              <tr>
                {shownColumns.map((column) => (
                  <th key={column.key}>
                    {sortableColumns.some((sortableColumn) => sortableColumn.key === column.key) ? (
                      <button className="table-sort-button" onClick={() => toggleSort(column.key)} type="button">
                        {column.header}
                        <span>{currentSortState.key === column.key ? (currentSortState.direction === "asc" ? "↑" : "↓") : "↕"}</span>
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
                    <td data-label={column.header} key={column.key}>{column.render ? column.render(row) : getColumnValue(column, row)}</td>
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
