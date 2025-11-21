import { cn } from "@/lib/utils";
import type { ExpressionString, INodeOutputConfiguration } from "@nmg8/workflow/src";
import { Handle, Position } from "@xyflow/react";
import type { BaseNodeData } from "./types";

interface IBaseInputHandleProps {
    outputs: Array<INodeOutputConfiguration> | ExpressionString;
    gap: number;
    size: number;
    data: BaseNodeData;
}

export default function BaseOutputHandle({
    outputs,
    gap,
    size,
    data
}: IBaseInputHandleProps) {
    if (Array.isArray(outputs)) {

        return (
            <>
                {outputs.map((output, index) => {
                    const calc = (size / (outputs.length + 1)) * (1 / size);
                    const spacing = `calc(var(--spacing) * (${size} * ${index} + ${index} * ${gap})) + (100% * ${calc})`

                    return (

                        <Handle
                            key={output.id}
                            id={output.id}
                            type="source"
                            position={output.position as unknown as Position}
                            className={cn(
                                "cursor-crosshair",
                                "size-3 hover:border-primary/50  border-2 border-card-foreground/40",
                                ""
                            )}
                            onDragEnd={() => {
                                console.log("end")
                            }}
                            style={{
                                top: `calc(${spacing})`,
                                height: `calc(var(--spacing) * ${size})`
                            }}
                        >
<<<<<<< Updated upstream
                            <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 flex items-center">
                                <span className="left-5 bg-background/70 p-0.5 absolute text-xs font-light text-primary">
                                    {output.displayName || output.type}
                                </span>
                                <div className="hover:bg-accent-foreground w-4 h-4 bg-muted-foreground rounded-full" />
=======

                            <div className="absolute right-0">
                                <Handle
                                    key={`handle.${output.id}`}
                                    id={output.id}
                                    title={output.name}
                                    type="source"
                                    position={Position.Right}
                                    className={cn(
                                        "!cursor-crosshair",
                                        "!w-3 !h-3 !bg-pink-700",
                                        "!hover:!bg-accent-foreground !border !border-black/90"
                                    )}
                                    
                                />

                                <div
                                    key={`name.${output.id}`}
                                    id={output.id}
                                >
                                    <div className="absolute top-1/2 -translate-y-1/2 flex items-center">
                                        <span className="right-3 absolute text-xs font-light text-primary">
                                            {output.name || output.type}
                                        </span>
                                    </div>
                                </div>
>>>>>>> Stashed changes
                            </div>
                            <div className={cn(
                                "absolute left-[-6px] top-1/2 -translate-y-1/2 flex items-center",
                                "transition-all ease-linear duration-100",
                                !data.isConnecting ? "scale-x-100 scale-y-100 opacity-100" : "scale-x-0 scale-y-0 opacity-0")}>
                                <>
                                    <div className="w-18 h-[2px] bg-muted-foreground" />
                                    <span className="!w-4 !h-4 !bg-none border-3 border-muted-foreground hover:border-accent-foreground !rounded relative flex items-center justify-center">
                                        <span className="absolute text-sm font-bold text-primary">+</span>
                                    </span>
                                </>
                            </div>
                        </Handle>
                    )
                })
                }
            </>
        )
    }

    return null;
}