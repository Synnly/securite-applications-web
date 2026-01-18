import { useState } from 'react';
import Tab from './Tab';
import type { TabsProps } from './tab.type';

export default function Tabs({ onTabChange, items, defaultValue }: TabsProps) {
    const [activeTab, setActiveTab] = useState<string>(
        defaultValue ?? items[0]?.value,
    );

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        onTabChange?.(tab);
    };

    const activeItem = items.find((i) => i.value === activeTab);

    return (
        <div className="w-full">
            <div role="tablist" className="tabs tabs-boxed bg-base-200 p-2">
                {items.map((item) => (
                    <Tab
                        key={item.value}
                        item={item}
                        isActive={item.value === activeTab}
                        onClick={handleTabChange}
                    />
                ))}
            </div>

            <div className="mt-6">{activeItem?.content}</div>
        </div>
    );
}
