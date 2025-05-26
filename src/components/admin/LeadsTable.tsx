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
import { TrendingUp, Tag, Star, CalendarDays, AlertTriangle, CheckCircle2 } from "lucide-react";
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
      return "default"; // Primary color for medium
    case "low":
      return "secondary";
    default:
      return "outline";
  }
}

export default function LeadsTable({ leads }: LeadsTableProps) {
  return (
    <TooltipProvider>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Name</TableHead>
              <TableHead>Email & Phone</TableHead>
              <TableHead className="text-center">Moving Date</TableHead>
              <TableHead className="text-center">Preference</TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center">
                  <Star className="mr-1 h-4 w-4 text-yellow-500" /> Score
                </div>
              </TableHead>
              <TableHead className="text-center">
                 <div className="flex items-center justify-center">
                   <TrendingUp className="mr-1 h-4 w-4 text-blue-500" /> Priority
                 </div>
              </TableHead>
              <TableHead className="text-center">
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
                <TableCell className="text-center">{formatDate(lead.movingDate, "MMM d, yyyy")}</TableCell>
                <TableCell className="text-center">
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
                           {lead.category.replace(/([A-Z])/g, ' $1').trim()} {/* Add space before caps */}
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
                  {formatDate(lead.createdAt.toDate(), "MMM d, yyyy HH:mm")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
