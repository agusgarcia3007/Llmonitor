import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  DataTableFilter,
  useDataTableFilters,
} from "@/components/data-table-filter";
import {
  createTSTColumns,
  createTSTFilters,
} from "@/components/data-table-filter/integrations/tanstack-table";
import type {
  ColumnConfig,
  FiltersState,
  ColumnOption,
} from "@/components/data-table-filter/core/types";
import type { Locale } from "@/components/data-table-filter/lib/i18n";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./table";

type DataTableProps<TData> = {
  columnsConfig: ColumnConfig<TData>[];
  data: TData[];
  filters: FiltersState;
  onFiltersChange: React.Dispatch<React.SetStateAction<FiltersState>>;
  isLoading?: boolean;
  options?: Partial<Record<string, ColumnOption[] | undefined>>;
  faceted?: Partial<
    | Record<string, Map<string, number> | undefined>
    | Record<string, [number, number] | undefined>
  >;
  locale?: Locale;
  columns: ColumnDef<TData, unknown>[];
};

export function DataTable<TData>({
  columnsConfig,
  data,
  filters,
  onFiltersChange,
  isLoading,
  options,
  faceted,
  locale = "en",
  columns,
}: DataTableProps<TData>) {
  const {
    columns: filterColumns,
    filters: filterState,
    actions,
    strategy,
  } = useDataTableFilters({
    strategy: "server",
    data,
    columnsConfig,
    filters,
    onFiltersChange,
    options,
    faceted,
  });

  const tstColumns = useMemo(
    () => createTSTColumns({ columns, configs: filterColumns }),
    [columns, filterColumns]
  );
  const tstFilters = useMemo(
    () => createTSTFilters(filterState),
    [filterState]
  );

  const table = useReactTable({
    data,
    columns: tstColumns,
    getCoreRowModel: getCoreRowModel(),
    state: { columnFilters: tstFilters },
    manualFiltering: true,
  });

  return (
    <div className="space-y-4">
      <DataTableFilter
        columns={filterColumns}
        filters={filterState}
        actions={actions}
        strategy={strategy}
        locale={locale}
      />
      <div className="relative">
        <Table>
          <TableHeader>
            <TableRow>
              {table.getHeaderGroups()[0]?.headers.map((header) => (
                <TableHead key={header.id} style={{ width: header.getSize() }}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? null
              : table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
