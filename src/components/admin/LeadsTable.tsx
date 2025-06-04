import type { Lead } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { TrendingUp, Tag, Star } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LeadsTableProps {
  leads: Lead[];
}

function getPriorityBadgeVariant(priority?: string): "default" | "destructive" | "secondary" | "outline" {
  switch (priority?.toLowerCase()) {
    case "high":
      return "destructive";
    case "medium":
      return "default";
    case "low":
      return "secondary";
    default:
      return "outline";
  }
}

export default function LeadsTable({ leads }: LeadsTableProps) {
  return (
    <TooltipProvider>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Name</TableHead>
              <TableHead>Email & Phone</TableHead>
              <TableHead>Current Address</TableHead>
              <TableHead>Destination Address</TableHead>
              <TableHead>Moving Date</TableHead>
              <TableHead>Number of Rooms</TableHead>
              <TableHead>Approximate Boxes Count</TableHead>
              <TableHead>Approximate Furniture Count</TableHead>
              <TableHead>Special Instructions</TableHead>
              <TableHead>Preference</TableHead>
              <TableHead>
                <div className="flex items-center justify-center">
                  <Star className="mr-1 h-4 w-4 text-yellow-500" /> Score
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-center">
                  <TrendingUp className="mr-1 h-4 w-4 text-blue-500" /> Priority
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-center">
                  <Tag className="mr-1 h-4 w-4 text-green-500" /> Category
                </div>
              </TableHead>
              <TableHead className="text-right">Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>
                  <div>{lead.email}</div>
                  <div className="text-xs text-muted-foreground">{lead.phone}</div>
                </TableCell>
                <TableCell>
                  <div>
                    <span className="font-semibold">Street:</span> {lead.currentAddress?.street}<br />
                    <span className="font-semibold">City:</span> {lead.currentAddress?.city}<br />
                    <span className="font-semibold">State:</span> {lead.currentAddress?.state}<br />
                    <span className="font-semibold">ZIP:</span> {lead.currentAddress?.zipCode}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <span className="font-semibold">Street:</span> {lead.destinationAddress?.street}<br />
                    <span className="font-semibold">City:</span> {lead.destinationAddress?.city}<br />
                    <span className="font-semibold">State:</span> {lead.destinationAddress?.state}<br />
                    <span className="font-semibold">ZIP:</span> {lead.destinationAddress?.zipCode}
                  </div>
                </TableCell>
                <TableCell>
                  {lead.movingDate
                    ? formatDate(
                        new Date(lead.movingDate)
                      , "MMM d, yyyy")
                    : ""}
                </TableCell>
                <TableCell>{lead.numberOfRooms}</TableCell>
                <TableCell>{lead.approximateBoxesCount || <span className="text-muted-foreground">N/A</span>}</TableCell>
                <TableCell>{lead.approximateFurnitureCount || <span className="text-muted-foreground">N/A</span>}</TableCell>
                <TableCell>{lead.specialInstructions || <span className="text-muted-foreground">N/A</span>}</TableCell>
                <TableCell>
                  <Badge variant={lead.movingPreference === "local" ? "secondary" : "outline"}>
                    {lead.movingPreference === "local" ? "Local" : "Long Distance"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {lead.leadScore !== undefined ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="cursor-help">
                          <Star className="mr-1 h-3 w-3 text-yellow-500" />
                          {lead.leadScore}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-sm">{lead.scoreReasoning || "No reasoning provided."}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">N/A</Badge>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {lead.priority ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant={getPriorityBadgeVariant(lead.priority)} className="cursor-help capitalize">
                          {lead.priority}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-sm">{lead.scoreReasoning || "Based on lead score."}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">N/A</Badge>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {lead.category ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="cursor-help">
                          {lead.category.replace(/([A-Z])/g, ' $1').trim()}
                          {lead.urgencyScore !== undefined && ` (${(lead.urgencyScore * 100).toFixed(0)}%)`}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-sm">{lead.categoryReason || "Categorized by AI."}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">N/A</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {lead.createdAt
                    ? formatDate(lead.createdAt.toDate(), "MMM d, yyyy HH:mm")
                    :  ""}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
