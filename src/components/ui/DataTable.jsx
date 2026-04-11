import { EmptyState } from "./EmptyState.jsx";

export function DataTable({ ariaLabel, caption, columns, rows, getRowKey, isLoading, loadingText = "Loading...", emptyTitle, emptyDescription, toolbar }) {
  return (
    <div className="table-card">
      {toolbar && <div className="table-toolbar">{toolbar}</div>}
      {isLoading ? (
        <div className="table-loading">{loadingText}</div>
      ) : (
        <table aria-label={ariaLabel}>
          {caption && <caption>{caption}</caption>}
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={getRowKey(row)}>
                {columns.map((column) => (
                  <td data-label={column.header} key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!isLoading && rows.length === 0 && <EmptyState title={emptyTitle} description={emptyDescription} />}
    </div>
  );
}
