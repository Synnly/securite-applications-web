import { useDarkModeStore } from '../../stores/darkModeStore';
import { Moon, Sun } from 'lucide-react';

export function ToggleDarkMode() {
    const changeDarkMode = useDarkModeStore((state) => state.toggleDarkMode);
    const darkMode = useDarkModeStore((state) => state.darkMode);
    return (
        <button
            className="w-fit items-center justify-center cursor-pointer"
            onClick={() => changeDarkMode()}
        >
            <div className="text-primary relative size-7">
                {darkMode ? (
                    <>
                        <Moon className="size-7 absolute z-0 opacity-0 transition-opacity ease-out duration-300" />
                        <Sun className="size-7 absolute z-10 transition-opacity ease-out duration-300" />
                    </>
                ) : (
                    <>
                        <Moon className="size-7 absolute z-10 transition-opacity ease-out duration-300" />
                        <Sun className="size-7 absolute z-0 opacity-0 transition-opacity ease-out duration-300" />
                    </>
                )}
            </div>
        </button>
    );
}
