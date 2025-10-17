/* eslint-disable @typescript-eslint/no-explicit-any */
import { ItemTypes } from '@/lib/constants';
import React from 'react';
import { useDrag } from 'react-dnd';

interface DraggableValueProps {
    value: string;
    type: string,
    isDropped: boolean;
    children?: React.ReactNode;
}

const DraggableValue: React.FC<DraggableValueProps> = React.memo(function Box({ value, type, isDropped, children }) {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: type,
        item: { value }, 
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [value, type]);

    return (
        <div
            ref={drag as any}
            className={`cursor-grab ${isDragging ? 'opacity-50 border border-primary ring-2 ring-primary' : 'hover:bg-accent'} 
                       border-none break-all w-full text-sm py-1 px-2 rounded transition-all duration-150`}
            style={{ opacity: isDragging ? 0.5 : 1 }}
            data-testid={`output_value`}
        >
            {children || value}
        </div>
    );
});

export default DraggableValue;