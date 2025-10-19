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
  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();
  const viewport = useViewport();

  const [copiedNode, setCopiedNode] = useState<Node | null>(null);
  const [contextMenuType, setContextMenuType] = useState<'canvas' | 'node' | 'end-node'>('canvas');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNodeSubmenu, setShowNodeSubmenu] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout>(0);

  const findFreePosition = useCallback((baseNode: Node) => {
    const nodes = getNodes();
    const nodeSize = { width: 300, height: 150 }; // Approximate node size
    const padding = 20; // Space between nodes
    const positions = [
      { x: 1, y: 0 },  // right
      { x: 0, y: 1 },  // bottom
      { x: 1, y: 1 },  // bottom-right
      { x: -1, y: 0 }, // left
      { x: 0, y: -1 }, // top
      { x: -1, y: -1 }, // top-left
      { x: 1, y: -1 }, // top-right
      { x: -1, y: 1 }, // bottom-left
    ];

    for (const pos of positions) {
      const candidatePosition = {
        x: baseNode.position.x + pos.x * (nodeSize.width + padding),
        y: baseNode.position.y + pos.y * (nodeSize.height + padding)
      };

      // Check if this position overlaps with any existing node
      const hasOverlap = nodes.some(node => {
        if (node.id === baseNode.id) return false;
        const dx = Math.abs(node.position.x - candidatePosition.x);
        const dy = Math.abs(node.position.y - candidatePosition.y);
        return dx < nodeSize.width && dy < nodeSize.height;
      });

      if (!hasOverlap) {
        return candidatePosition;
      }
    }

    // If all positions are taken, return a position with offset
    return {
      x: baseNode.position.x + (nodeSize.width + padding),
      y: baseNode.position.y + (nodeSize.height + padding)
    };
  }, [getNodes]);

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    const target = event.target as HTMLElement;
    const nodeElement = target.closest('.react-flow__node');

    if (nodeElement) {
      const nodeId = nodeElement.getAttribute('data-id');
      const node = getNodes().find(n => n.id === nodeId);

      setContextMenuType('canvas');
      setSelectedNode(node || null);
    }

    setMenuPosition({ x: event.clientX, y: event.clientY });
    setIsMenuOpen(true);
  }, [getNodes]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isContextMenu = target.closest('.flow-context-menu');
      const isNodeSubmenu = target.closest('.node-submenu');

      if (!isContextMenu && !isNodeSubmenu) {
        setIsMenuOpen(false);
        setShowNodeSubmenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }

      // if (event.key === 'Delete') {
      //   handleDeleteSelected();
      // }

      // if (event.key === 'a' && (event.ctrlKey || event.metaKey)) {
      //   event.preventDefault();
      //   if (getNodes().length > 2) {
      //     handleSelectAll();
      //   }
      // }

      // if (event.key === 'c' && (event.ctrlKey || event.metaKey) && selectedNode) {
      //   event.preventDefault();
      //   handleCopyNode();
      // }

      // if (event.key === 'd' && (event.ctrlKey || event.metaKey) && selectedNode) {
      //   event.preventDefault();
      //   handleDuplicateNode();
      // }

      // if (event.key === 'v' && (event.ctrlKey || event.metaKey) && copiedNode) {
      //   event.preventDefault();
      //   handlePasteNode();
      // }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [selectedNode, copiedNode, getNodes]);

  const handleAddNodeTriggerEnter = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setShowNodeSubmenu(true);
  }, []);

  const handleAddNodeTriggerLeave = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setShowNodeSubmenu(false);
    }, 100);
  }, []);

  const handleSubmenuEnter = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
  }, []);

  const handleSubmenuLeave = useCallback(() => {
    setShowNodeSubmenu(false);
  }, []);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
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