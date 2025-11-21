import { Handle, Position } from "@xyflow/react";
import { SignalZero } from "lucide-react";
import type { INodeInputConfiguration } from "nmg8-workflow";

interface IBaseInputHandleProps {
    inputs: Array<INodeInputConfiguration>;
    gap: number,
    size: number
}

export default function BaseInputHandle({
    inputs,
    gap,
    size
}: IBaseInputHandleProps) {

    if (Array.isArray(inputs)) {
        return (
            <>
                {inputs.map((input, index) => {
                    const calc = (size / (inputs.length + 1)) * (1 / size);
                    const spacing = `calc(var(--spacing) * (${size} * ${index} + ${index} * ${gap})) + (100% * ${calc})`
                    return (
                        <div key={`input.${input.id}.${index}`}
                            className="!py-4"
                            style={{
                                top: `calc(${spacing})`,
                            }}
                        >
                            <div className="absolute left-0">
                                <Handle
                                    key={`handle.input.${input.id}`}
                                    type="target"
                                    id={input.id}
                                    position={Position.Left}
                                    className={`!w-3 !h-3 !bg-green-500 !rounded-full !border !border-black/90`}
                                    
                                />

                                <div
                                    key={`input.name.${input.id}`}
                                    id={input.id}
                                >
                                    <div className="absolute top-1/2 -translate-y-1/2 flex items-center">
                                        <span className="left-3 absolute text-xs font-light text-primary">
                                            {input.name || input.type}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
                )}
            </>
        )
    }

    return (
        <Handle
            key={'script_input_0'}
            type="target"
            id={'script_input_0'}
            position={Position.Left}
            className={`!w-1.5 !bg-primary !rounded-[1px] !border-none`}

        />
    );
}