export function Pagination({ page, totalPages, onPageChange }) {
  const safeTotal = Math.max(1, totalPages || 1);

  return (
    <nav className="pagination" aria-label="Pagination">
      <button aria-label="Go to previous page" onClick={() => onPageChange(Math.max(0, page - 1))} disabled={page === 0}>
        Previous
      </button>
      <span aria-live="polite">Page {page + 1} of {safeTotal}</span>
      <button aria-label="Go to next page" onClick={() => onPageChange(Math.min(safeTotal - 1, page + 1))} disabled={page + 1 >= safeTotal}>
        Next
      </button>
    </nav>
  );
}
