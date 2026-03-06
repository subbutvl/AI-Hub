import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import { AIRepository } from "../../types/ai-index";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Star, GitFork, ExternalLink } from "lucide-react";

interface RepoTableProps {
  data: AIRepository[];
}

export function RepoTable({ data }: RepoTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<AIRepository>[] = [
    {
      accessorKey: "repo_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Repository
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex flex-col">
          <a
            href={row.original.repo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline flex items-center gap-1 text-primary"
          >
            {row.getValue("repo_name")}
            <ExternalLink className="w-3 h-3 opacity-50" />
          </a>
          <span className="text-xs text-muted-foreground line-clamp-1" title={row.original.description}>
            {row.original.description}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "owner_name",
      header: "Developer",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <img
            src={row.original.owner_avatar}
            alt={row.original.owner_name}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-sm">{row.original.owner_name}</span>
        </div>
      ),
    },
    {
      accessorKey: "stars",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Stars
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-1 font-mono text-sm">
          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          {row.original.stars.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "language",
      header: "Language",
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
          {row.getValue("language")}
        </span>
      ),
    },
    {
      accessorKey: "ai_category",
      header: "Category",
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100">
          {row.getValue("ai_category")}
        </span>
      ),
    },
    {
      accessorKey: "country",
      header: "Location",
      cell: ({ row }) => {
        const { city, country } = row.original;
        if (city && country) return `${city}, ${country}`;
        return country || city || <span className="text-muted-foreground">-</span>;
      },
    },
    {
      accessorKey: "updated_at",
      header: "Updated",
      cell: ({ row }) => new Date(row.getValue("updated_at")).toLocaleDateString(),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 100,
      },
    },
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-white dark:bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-semibold">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 h-10 text-left align-middle font-medium">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 align-middle">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No results.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {data.length} repositories
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
