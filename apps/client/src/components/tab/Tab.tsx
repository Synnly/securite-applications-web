import type { TabButtonProps } from './tab.type';

export function Tab({ item, isActive, onClick }: TabButtonProps) {
    return (
        <button
            role="tab"
            aria-selected={isActive}
            aria-disabled={item.disabled}
            onClick={() => !item.disabled && onClick(item.value)}
            className={`tab ${isActive ? 'tab-active' : ''} ${
                item.disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
            {item.icon && (
                <span className="mr-2 inline-flex items-center">
                    {item.icon}
                </span>
            )}
            {item.label}
        </button>
    );
}

export default Tab;
