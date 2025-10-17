import { useCallback, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Code2, Trash2, MoreHorizontal } from "lucide-react";

interface ScriptNodeProps {
    id: string;
    data: {
        label: string;
        onChange?: (value: string) => void;
        onRun?: (code: string) => void;
    };
}

export default function ScriptNode({ id, data }: ScriptNodeProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label || "Script");

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            data.onChange?.(e.target.value);
        },
        [data]
    );

    const handleRun = useCallback(() => {
        console.log('run')
    }, []);

    const handleLabelBlur = useCallback(() => {
        setIsEditing(false);
    }, []);

    const handleLabelChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setLabel(e.target.value);
        },
        []
    );

    return (
        <div
            className="w-[100px] h-[100px] shadow-md border-primary/80 border-2 rounded-xl bg-foreground"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onDoubleClick={() => setIsEditing(true)}
        >
            {isHovered && (
                <div className="absolute -top-10 flex space-x-2 z-10">
                    <Button size="icon" variant="secondary" className="h-7 w-7 p-1">
                        <Play className="h-4 w-4 text-primary" />
                    </Button>
                    <Button size="icon" variant="secondary" className="h-7 w-7 p-1">
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <Button size="icon" variant="secondary" className="h-7 w-7 p-1">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </div>
            )}
            {/* Entradas e saídas */}
            <Handle
                type="target"
                position={Position.Left}
                className="!w-2.5 !h-6 !bg-primary !rounded-[2px] !border-none"
            />

            <div className="absolute right-[-38px] top-1/2 -translate-y-1/2 flex items-center">
                <div className="w-[16px] h-[16px] bg-muted-foreground rounded-full"></div>
                <div className="w-[30px] h-[2px] bg-muted-foreground"></div>
                <Handle
                    type="source"
                    position={Position.Right}
                    className="!w-6 !h-6 !bg-none !border border-border !rounded relative flex items-center justify-center"
                >
                    <span className="absolute text-sm font-bold text-primary">+</span>
                </Handle>
            </div>
            <div className="flex items-center justify-center">
                <Code2 className="h-10 w-10 text-primary" />
            </div>


            <div className="relative -bottom-20 w-full text-center">
                {isEditing ? (
                    <input
                        value={label}
                        onChange={handleLabelChange}
                        onBlur={handleLabelBlur}
                        autoFocus
                        className="w-[90%] text-sm text-center bg-transparent border-b border-muted-foreground outline-none text-foreground"
                    />
                ) : (
                    <span className="text-sm font-medium text-primary">{label}</span>
                )}
            </div>
        </div>
    );
}
