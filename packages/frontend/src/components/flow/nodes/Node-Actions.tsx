import { Button } from "@/components/ui/button";
import { MoreHorizontal, Play, Trash2 } from "lucide-react";

interface IBaseNodeActionsProps {
    handleRun: () => void;
    deleteNode: () => void;
}
export default function BaseNodeActions({
    deleteNode,
    handleRun
}: IBaseNodeActionsProps) {
    return (
        <div
            className="absolute -top-10 flex space-x-2 z-10 h-[50px]"
            onMouseDown={(e) => e.stopPropagation()}
        >
            <Button size="icon" variant="secondary" className="h-7 w-7 p-1" onClick={handleRun}>
                <Play className="h-4 w-4 text-primary" />
            </Button>
            <Button size="icon" variant="secondary" className="h-7 w-7 p-1" onClick={deleteNode}>
                <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
            <Button size="icon" variant="secondary" className="h-7 w-7 p-1">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </Button>
        </div>
    )
}