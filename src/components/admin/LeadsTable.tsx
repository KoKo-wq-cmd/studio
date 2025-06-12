import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from 'date-fns';
import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lead } from "@/types";
import { ArrowUpDown } from "lucide-react";

interface LeadsTableProps {
  leads: Lead[];
}

export default function LeadsTable({ leads }: { leads: Lead[] }) {
  // Add this debug log
  React.useEffect(() => {
    console.log('Leads data received:', leads);
  }, [leads]);

  const columns: ColumnDef<Lead>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "currentAddress.street",
      header: "Current Street",
    },
    {
      accessorKey: "currentAddress.city",
      header: "Current City",
    },
    {
      accessorKey: "currentAddress.state",
      header: "Current State",
    },
    {
      accessorKey: "currentAddress.zipCode",
      header: "Current ZipCode",
    },
    {
      accessorKey: "destinationAddress.street",
      header: "Destination Street",
    },
    {
      accessorKey: "destinationAddress.city",
      header: "Destination City",
    },
    {
      accessorKey: "destinationAddress.state",
      header: "Destination State",
    },
    {
      accessorKey: "destinationAddress.zipCode",
      header: "Destination ZipCode",
    },
    {
      accessorKey: "movingDate",
      header: "Move Date",
      cell: ({ row }) => {
        const dateString = row.getValue("movingDate") as string;
        try {
          const date = new Date(dateString);
          return format(date, 'MM/dd/yyyy');
        } catch (error) {
          return "";
        }
      },
    },
    {
      accessorKey: "numberOfRooms",
      header: "Number of Rooms",
    },
    {
      accessorKey: "approximateBoxesCount",
      header: "Approximate Boxes Count",
    },
    {
      accessorKey: "approximateFurnitureCount",
      header: "Approximate Furniture Count",
    },
    {
      accessorKey: "specialInstructions",
      header: "Special Instructions",
    },
    {
      accessorKey: "movingPreference",
      header: "Move Type",
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const data = row.original;
        // Debug what we're getting
        console.log('Category data:', {
          category: data.category,
          type: typeof data.category
        });
        
        // Make sure we show the value even if it's "Residential"
        return (
          <span className="font-medium capitalize">
            {data.category || "N/A"}
          </span>
        );
      }
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        const dateString = row.getValue("createdAt") as string;
        try {
          const date = new Date(dateString);
          return format(date, 'MM/dd/yyyy');
        } catch (error) {
          return "";
        }
      },
    },
    {
      accessorKey: "urgency",
      header: "Urgency",
      cell: ({ row }) => {
        const urgency = row.getValue("urgency");
        return urgency || "Not Set";
      }
    },
    {
      accessorKey: "estimatedCost",
      header: "Estimated Cost",
      cell: ({ row }) => {
        const data = row.original;
        const min = data.minEstimate;
        const max = data.maxEstimate;
        
        // Debug the estimate values
        console.log('Cost data:', {
          min,
          max,
          minType: typeof min,
          maxType: typeof max
        });
        
        // Check for actual numbers, not just truthy values
        if (typeof min === 'number' && typeof max === 'number') {
          return (
            <span className="font-medium">
              ${min.toLocaleString()} - ${max.toLocaleString()}
            </span>
          );
        }
        
        return <span className="text-muted-foreground">N/A</span>;
      },
    },
  ];

  const table = useReactTable({
    data: leads,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="bg-gray-50 sticky top-0 z-10">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-200"
                >
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
        <tbody>
          {table.getRowModel().rows.map((row, idx) => (
            <tr
              key={row.id}
              className={
                idx % 2 === 0
                  ? "bg-white hover:bg-blue-50 transition"
                  : "bg-gray-50 hover:bg-blue-50 transition"
              }
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-2 border-b border-gray-100">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
