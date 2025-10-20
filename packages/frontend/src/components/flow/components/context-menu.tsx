import { useCallback, useEffect, useState, useRef } from "react";
import { useReactFlow, useViewport, type Node } from "@xyflow/react";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

interface FlowContextMenuProps {
  children: React.ReactNode;
}

interface MenuPosition {
  x: number;
  y: number;
}

export function FlowContextMenu({ children }: FlowContextMenuProps) {
  // const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();

  const [copiedNode, setCopiedNode] = useState<Node | null>(null);
  const [contextMenuType, setContextMenuType] = useState<'canvas' | 'node' | 'end-node'>('canvas');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent className="text-primary w-52">
          <ContextMenuItem inset>
            Adicionar nó
            <ContextMenuShortcut>Space</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem inset>
            Adicionar texto
            <ContextMenuShortcut>T</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem inset>
            Salvar workflow
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </>
  );
} 