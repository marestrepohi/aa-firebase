import { Badge } from "@/components/ui/badge";
import type { UseCaseStatus } from "@/lib/types";

const statusStyles: Record<UseCaseStatus, string> = {
  Development: "bg-[#E0E7FF] text-[#3730A3] hover:bg-[#C7D2FE]",
  Deployed: "bg-[#D1FAE5] text-[#065F46] hover:bg-[#A7F3D0]",
  Cancelled: "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]",
  "Task Assigned": "bg-[#FEF3C7] text-[#92400E] hover:bg-[#FDE68A]",
};

export function StatusPill({ status }: { status: UseCaseStatus }) {
  return (
    <Badge className={`border-none font-medium ${statusStyles[status]}`}>
      {status}
    </Badge>
  );
}
