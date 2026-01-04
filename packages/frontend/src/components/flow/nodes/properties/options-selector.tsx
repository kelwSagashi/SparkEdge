import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { INode } from "@/interfaces";
import { api } from "@/server/server.service";
import type { DisplayOptionsReplaceItem, IDataObject, INodeProperties } from "nmg8-workflow";
import { useCallback, useEffect, useState } from "react";

type NodePropertiesOptionsType = Extract<INodeProperties, { type: 'options' }>;

export interface NodeOptionSelectorProps {
    handleSelect: (value: IDataObject, property: NodePropertiesOptionsType) => void;
    property: NodePropertiesOptionsType;
    node: INode;
}

export default function NodeOptionsProperty({
    handleSelect,
    property,
    node
}: NodeOptionSelectorProps) {
    const [selection, setSelection] = useState<IDataObject>();
    const [selectItems, setSelectItems] = useState<IDataObject[]>(() => {
        return property.options ?? []
    });

    const getSelectItems = useCallback(async () => {
        if (property.routing?.request) {
            const result = await api.execute({
                request: property.routing.request
            });

            const response = result.data;
            if (Array.isArray(response.data)) {
                setSelectItems(response.data)
            }
        }
    }, [property]);

    useEffect(() => {
        getSelectItems()
    }, [getSelectItems]);

    const replaceOptionProperty = useCallback((
        item: IDataObject, 
        replace: DisplayOptionsReplaceItem) => {
        const {as, separator} = replace;
        const replaced = as.map(val => item[val]).join(separator);
        return replaced;
    }, [])

    return (
        <div className='w-full'>
            <span className="text-sm text-muted-foreground">{property.displayName}</span>
            <Select value={node.data.parameters[property.name]?.[property.displayOptions.replace.value.as[0]]} onValueChange={(val) => {
                const selectedItem = selectItems.find(
                    s => s[property.displayOptions.replace.value.as[0]] === val
                );
                if (selectedItem) {
                    setSelection(selectedItem);
                    handleSelect({[property.name]: selectedItem}, property);
                }
            }}>
                <SelectTrigger className="w-full p-2 py-4">
                    <SelectValue placeholder={property.placeholder} />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>{property.description}</SelectLabel>
                        {selectItems.map(it => {
                            const {
                                description,
                                id,
                                key,
                                name,
                                value
                            } = property.displayOptions.replace;
                            const values = [
                                replaceOptionProperty(it, key),
                                replaceOptionProperty(it, id),
                                replaceOptionProperty(it, value),
                                replaceOptionProperty(it, name),
                                replaceOptionProperty(it, description)
                            ];

                            const [_key, _id, _value, _name, _desc] = values;
                            return (
                                <SelectItem 
                                    key={_key}
                                    id={_id} 
                                    value={_value} 
                                    className='w-full justify-start p-6'
                                >
                                    <div className="text-left">
                                        <p className="font-semibold text-primary">{_name}</p>
                                        <p className="text-sm text-muted-foreground">{_desc}</p>
                                    </div>
                                </SelectItem>
                            )
                        })}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    )
}