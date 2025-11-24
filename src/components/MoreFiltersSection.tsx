import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MoreFiltersSectionProps {
    children: ReactNode;
}

const MoreFiltersSection = ({ children }: MoreFiltersSectionProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="space-y-4">
            <Button
                type="button"
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full justify-between h-10 border border-dashed hover:border-solid hover:bg-muted/50 transition-all rounded-lg"
            >
                <span className="font-medium text-sm flex items-center gap-2">
                    {isExpanded ? (
                        <Minus className="h-3.5 w-3.5" />
                    ) : (
                        <Plus className="h-3.5 w-3.5" />
                    )}
                    More Filters
                </span>
                {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
            </Button>

            <div
                className={cn(
                    "space-y-6 overflow-hidden transition-all duration-300 ease-in-out",
                    isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                )}
            >
                {children}
            </div>
        </div>
    );
};

export default MoreFiltersSection;
