import { useState } from 'react';
import Tab from './Tab';
import type { TabsProps } from './tab.type';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function Tabs({ onTabChange, items, defaultValue }: TabsProps) {
    const [activeTab, setActiveTab] = useState<string>(
        defaultValue ?? items[0]?.value,
    );
    const navigate = useNavigate();

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        onTabChange?.(tab);
    };

    const activeItem = items.find((i) => i.value === activeTab);

    return (
        <div className="w-full">
            <div role="tablist" className="tabs tabs-boxed bg-base-200 p-2">
                <Tab
                    item={{
                        value: 'back',
                        label: 'Liste des articles',
                        icon: <Home />,
                    }}
                    isActive={false}
                    onClick={() => navigate('/posts')}
                />
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
