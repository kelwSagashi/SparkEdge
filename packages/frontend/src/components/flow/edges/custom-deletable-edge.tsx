import {
    BezierEdge,
    EdgeLabelRenderer,
    type EdgeProps,
    getBezierPath,
    useReactFlow,
} from "@xyflow/react";
import { Trash2, X } from "lucide-react";

export default function CustomDeletableEdge(props: EdgeProps) {
    const {
        id,
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
    } = props;

    const { setEdges, setNodes, getEdge } = useReactFlow();

    const [_, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    return (
        <>
            <BezierEdge {...props} />
            <EdgeLabelRenderer>
                <button
                    type="button"
                    className="group pointer-events-auto absolute size-5 flex items-center justify-center rounded bg-foreground text-red-400 transition-colors hover:ring-accent-foreground hover:bg-background"
                    style={{
                        transform: `translate(${labelX}px, ${labelY}px) translate(-50%, -50%)`,
                    }}
                    onClick={() => {
                        const edge = getEdge(id);
                        console.log(edge)
                        setNodes((nds) =>
                            nds.map((n) => {
                                if (n.id === edge?.source) {
                                    return { ...n, data: { ...n.data, isConnecting: false } };
                                }
                                return { ...n, data: { ...n.data } };
                            })
                        );
                        setEdges((edges) => edges.filter((edge) => edge.id !== id))
                    }}
                >
                    <Trash2 className="size-3 transition " />
                </button>
            </EdgeLabelRenderer>
        </>
    );
}