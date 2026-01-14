import { useState } from 'react';
import { Users, FileText, MessageSquare } from 'lucide-react';

type TabType = 'users' | 'posts' | 'comments';

interface TabsProps {
    onTabChange?: (tab: TabType) => void;
}

export default function Tabs({ onTabChange }: TabsProps) {
    const [activeTab, setActiveTab] = useState<TabType>('users');

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        onTabChange?.(tab);
    };

    return (
        <div className="w-full">
            <div role="tablist" className="tabs tabs-boxed bg-base-200 p-2">
                <button
                    role="tab"
                    className={`tab ${
                        activeTab === 'users' ? 'tab-active' : ''
                    }`}
                    onClick={() => handleTabChange('users')}
                    aria-selected={activeTab === 'users'}
                >
                    <Users className="h-5 w-5 mr-2" />
                    Utilisateurs
                </button>

                <button
                    role="tab"
                    className={`tab ${
                        activeTab === 'posts' ? 'tab-active' : ''
                    }`}
                    onClick={() => handleTabChange('posts')}
                    aria-selected={activeTab === 'posts'}
                >
                    <FileText className="h-5 w-5 mr-2" />
                    Articles
                </button>

                <button
                    role="tab"
                    className={`tab ${
                        activeTab === 'comments' ? 'tab-active' : ''
                    }`}
                    onClick={() => handleTabChange('comments')}
                    aria-selected={activeTab === 'comments'}
                >
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Commentaires
                </button>
            </div>

            <div className="mt-6">
                {activeTab === 'users' && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold mb-4">
                            Gestion des utilisateurs
                        </h2>
                    </div>
                )}

                {activeTab === 'posts' && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold mb-4">
                            Gestion des articles
                        </h2>
                    </div>
                )}

                {activeTab === 'comments' && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold mb-4">
                            Gestion des commentaires
                        </h2>
                    </div>
                )}
            </div>
        </div>
    );
}
