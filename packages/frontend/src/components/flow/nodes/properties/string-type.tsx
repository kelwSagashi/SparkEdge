import { Input } from "@/components/ui/input";
import type { DisplayOptionsReplaceItem, IDataObject, INodeProperties } from "nmg8-workflow";
import { useCallback, useEffect, useState } from "react";

type NodePropertiesOptionsType = Extract<INodeProperties, { type: 'string' }>;

export interface NodeTextOptionProps {
    handleChangeText: (value: IDataObject, property: NodePropertiesOptionsType) => void;
    property: NodePropertiesOptionsType;
}

export default function NodeStringProperty({
    handleChangeText,
    property
}: NodeTextOptionProps) {
    const [text, setText] = useState<string>("");

    return (
        <div className='w-full'>
            <span className="text-sm text-muted-foreground">{property.displayName}</span>
            <Input value={text} onChange={val => {
                setText(val.target.value);
                handleChangeText({[property.name]: val.target.value}, property);
            }}
            placeholder={property.placeholder}/>
        </div>
    )
}