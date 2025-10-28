import type { ExpressionString, INodeInputConfiguration } from "@nmg8/workflow/src";
import { Handle, Position } from "@xyflow/react";
import { SignalZero } from "lucide-react";

interface IBaseInputHandleProps {
    inputs: Array<INodeInputConfiguration> | ExpressionString;
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
                        <Handle
                            key={input.id}
                            type="target"
                            id={input.id}
                            position={Position.Left}
                            className={`!w-1.5 !bg-primary !rounded-[1px] !border-none`}
                            style={{
                                top: `calc(${spacing})`,
                                height: `calc(var(--spacing) * ${size})`
                            }}
                        />
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