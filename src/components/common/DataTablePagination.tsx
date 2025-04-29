
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function DataTablePagination({
  currentPage,
  totalPages,
  onPageChange,
}: DataTablePaginationProps) {
  // Function to determine which page numbers to show
  const getVisiblePages = () => {
    // For small screens or fewer pages, show limited pagination
    if (window.innerWidth < 640 || totalPages <= 5) {
      if (totalPages <= 3) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }
      
      // If we're at the start
      if (currentPage <= 2) {
        return [1, 2, 3, null, totalPages];
      }
      
      // If we're at the end
      if (currentPage >= totalPages - 1) {
        return [1, null, totalPages - 2, totalPages - 1, totalPages];
      }
      
      // If we're in the middle
      return [1, null, currentPage, null, totalPages];
    }
    
    // For larger screens with more pages
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5, null, totalPages];
    }
    
    if (currentPage >= totalPages - 2) {
      return [1, null, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    
    return [1, null, currentPage - 1, currentPage, currentPage + 1, null, totalPages];
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center sm:justify-end space-x-2 py-4">
      <Pagination>
        <PaginationContent className="flex-wrap">
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) onPageChange(currentPage - 1);
              }}
              className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>

          {visiblePages.map((page, index) => (
            page === null ? (
              <PaginationItem key={`ellipsis-${index}`} className="hidden sm:inline-block">
                <span className="px-2">...</span>
              </PaginationItem>
            ) : (
              <PaginationItem key={`page-${page}`}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(page as number);
                  }}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          ))}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) onPageChange(currentPage + 1);
              }}
              className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
