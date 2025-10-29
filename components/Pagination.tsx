"use client";

import { PAGE_LIMIT } from "@/app/(root)/page";
import Button from "./ui/Button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const Pagination = ({ total, page }: { total: number; page: number }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const totalPages = Math.ceil(total / PAGE_LIMIT);
  const [currentPage, setCurrentPage] = useState(Math.min(page, totalPages) || 1);

  const updatePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage === 1) {
      params.delete("page");
    } else {
      params.set("page", newPage.toString());
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setCurrentPage(newPage);
  };
  return (
    <div className="w-full flex items-center justify-center gap-10 my-4">
      <Button
        icon={<ArrowLeft />}
        tier="secondary"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => updatePage(Math.max(1, currentPage - 1))}
      >
        Previous
      </Button>
      <span>
        Page {currentPage} of {Math.ceil(totalPages)}
      </span>
      <Button
        icon={<ArrowRight />}
        tier="secondary"
        size="sm"
        iconPosition="right"
        disabled={currentPage === totalPages || totalPages === 0}
        onClick={() => updatePage(Math.min(totalPages, currentPage + 1))}
      >
        Next
      </Button>
    </div>
  );
};
export default Pagination;
