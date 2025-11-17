import { cn } from "@/lib/utils";
import { Handle, Position } from "@xyflow/react";
import type { INodeData, INodeOutputConfiguration } from "nmg8-workflow";

interface IBaseInputHandleProps {
    outputs: Array<INodeOutputConfiguration>;
    gap: number;
    size: number;
    data: INodeData;
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
                        <div key={`input.${output.id}.${index}`}
                            className="!py-4"
                            style={{
                                top: `calc(${spacing})`,
                            }}
                        >

                            <div className="absolute right-0">
                                <Handle
                                    key={`handle.${output.id}`}
                                    id={output.id}
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
                            </div>
                        </div>
                    )
                })
                }
            </>
        )
    }

    return null;
}