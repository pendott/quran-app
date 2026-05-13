import type { ReactNode } from "react";
import type { TableRow } from "@/lib/types";

type DataTableProps = {
  columns: string[];
  rows: TableRow[];
};

export function DataTable({ columns, rows }: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200/80">
      <table className="min-w-full divide-y divide-slate-200 text-left">
        <thead className="bg-slate-50/90">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="align-top">
              {columns.map((column) => (
                <td key={column} className="px-4 py-4 text-sm text-slate-600">
                  {renderCell(row[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderCell(value: ReactNode) {
  if (value === null || value === undefined || value === "") return "-";
  return value;
}
