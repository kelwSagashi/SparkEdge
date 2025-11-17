"use client"
import { useReactFlow, type FinalConnectionState } from "@xyflow/react";
import { useCallback, useRef } from "react";
import { useInsertNode } from "./use-insert-node";
import * as uuid from 'uuid';
import { useShallow } from "zustand/react/shallow";
import { useAddNodeOnEdgeDropStore } from "@/stores/add-node-on-edge-drop-store";
import type { INode } from "@/interfaces";

export function useAddNodeOnEdgeDrop() {
    const [
        dropPosition,
        incomingNodeMetadetails,
        setAnchorPosition,
        setDropPosition,
        setShowMenu,
        setIncomingNodeMetadetails,
    ] = useAddNodeOnEdgeDropStore(
        useShallow((s) => [
            s.dropPosition,
            s.incomingNodeMetadetails,
            s.actions.setAnchorPosition,
            s.actions.setDropPosition,
            s.actions.setShowMenu,
            s.actions.setIncomingNodeMetadetails,
        ])
    );

    const { screenToFlowPosition, addEdges } = useReactFlow();

    const insertNode = useInsertNode();

    const floatingMenuWrapperRef = useRef<HTMLDivElement>(null);

    const handleAddConnectedNode = useCallback(
        async (name: string) => {
            let newNode: INode | undefined;
            if (
                !incomingNodeMetadetails ||
                !incomingNodeMetadetails.fromHandle ||
                !incomingNodeMetadetails.fromNode
            ) {
                newNode = await insertNode(name);
                return;
            }
            newNode = await insertNode(name, dropPosition);

            const id = uuid.v4();
            const id2 = uuid.v4();

            if (incomingNodeMetadetails.fromHandle.type === "source") {
                addEdges({
                    id,
                    type: "deletable",
                    target: newNode.id,
                    sourceHandle: incomingNodeMetadetails.fromHandle.id,
                    source: incomingNodeMetadetails.fromNode.id,
                });
            } else if (incomingNodeMetadetails.fromHandle.type === "target") {
                addEdges({
                    id: id2,
                    type: "deletable",
                    target: incomingNodeMetadetails.fromNode.id,
                    targetHandle: incomingNodeMetadetails.fromHandle.id,
                    source: newNode.id,
                });
            }

            setShowMenu(false);
            setIncomingNodeMetadetails(null);
        },
        [
            insertNode,
            addEdges,
            setShowMenu,
            setIncomingNodeMetadetails,
            incomingNodeMetadetails,
            dropPosition,
        ]
    );

    const onConnectEnd = useCallback(
        (e: MouseEvent | TouchEvent, connectionState: FinalConnectionState) => {
            if (!connectionState.isValid && floatingMenuWrapperRef.current) {
                const { clientX, clientY } =
                "changedTouches" in e ? e.changedTouches[0] : e;

                const _anchorPositionPadding = 20;
                const _floatingMenuWrapperRect =
                floatingMenuWrapperRef.current.getBoundingClientRect();
                const _addNodeFloatingMenuAnchorPosition = {
                x:
                    (clientX > _floatingMenuWrapperRect.width + _anchorPositionPadding
                    ? _floatingMenuWrapperRect.width - _anchorPositionPadding
                    : clientX < _anchorPositionPadding
                    ? _anchorPositionPadding
                    : clientX) - _floatingMenuWrapperRect.x,
                y:
                    clientY > _floatingMenuWrapperRect.height + _anchorPositionPadding
                    ? _floatingMenuWrapperRect.height - _anchorPositionPadding
                    : clientY < _anchorPositionPadding
                    ? _anchorPositionPadding
                    : clientY - _floatingMenuWrapperRect.y,
                };

                setAnchorPosition(_addNodeFloatingMenuAnchorPosition);
                setShowMenu(true);
                setIncomingNodeMetadetails(connectionState);
                setDropPosition(screenToFlowPosition({ x: clientX, y: clientY }));
            }
        },
        [
            setAnchorPosition,
            setShowMenu,
            setIncomingNodeMetadetails,
            screenToFlowPosition,
            floatingMenuWrapperRef,
            setDropPosition,
        ]
    );

    return {
        handleOnEdgeDropConnectEnd: onConnectEnd,
        floatingMenuWrapperRef,
        handleAddConnectedNode,
    };
}