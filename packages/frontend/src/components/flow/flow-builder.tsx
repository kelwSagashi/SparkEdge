"use client"
import { ReactFlowProvider } from "@xyflow/react"
import FlowEditor from "./flow-editor"
import { useParams } from "react-router-dom";

export const FlowBuilderPage = () => {
    const { id } = useParams<{ id: string }>();

    return <ReactFlowProvider>
        <div className="absolute inset-0 flex h-full w-full">
            <FlowEditor id={id} />
        </div>
    </ReactFlowProvider>
}