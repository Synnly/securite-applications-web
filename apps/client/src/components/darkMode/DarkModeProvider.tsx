import { useEffect, type ReactNode } from 'react';
import { useDarkModeStore } from '../../stores/darkModeStore';

interface DarkModeProviderProps {
    children: ReactNode;
}

export const DarkModeProvider = ({ children }: DarkModeProviderProps) => {
    const { darkMode, initialize } = useDarkModeStore((state) => state);

    useEffect(() => {
        const htmlElement = document.documentElement;

        const themeValue = darkMode ? 'dark' : 'light';
        htmlElement.setAttribute('data-theme', themeValue);
        htmlElement.setAttribute('data-color-mode', themeValue);

        return () => {
            htmlElement.removeAttribute('data-theme');
        };
    }, [darkMode]);

    useEffect(() => {
        initialize();
    }, [initialize]);

    return <>{children}</>;
};
