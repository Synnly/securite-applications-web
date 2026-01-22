import { Plus } from 'lucide-react';
import { CreatePostModal } from '../post/CreatePostModal.tsx';
import { useState } from 'react';
import { ToggleDarkMode } from '../darkMode/DarkModeToggle.tsx';
import { userStore } from '../../stores/userStore.ts';

export const Navbar = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const access = userStore((state) => state.access);
    const getUser = userStore((state) => state.get);

    const user = getUser(access);
    const isAdmin = user?.role === 'ADMIN';

    return (
        <>
            <nav className="sticky top-0 z-50 w-full mx-auto bg-base-100 text-base-content px-8 py-2 shadow-md shadow-base-200">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <a className="btn btn-ghost" href="/posts">
                            Accueil
                        </a>
                        {isAdmin && (
                            <a className="btn btn-ghost" href="/admin">
                                Administration
                            </a>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <ToggleDarkMode />

                        {user && (
                            <button
                            className="btn btn-primary"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <Plus />
                            Poster  
                        </button>
                        )}
                       {user ? (
                         <a className="btn btn-ghost" href="/logout">
                            Deconnexion
                        </a>
                       ) : (  <a className="btn btn-ghost" href="/signin">
                            Connexion
                        </a>)}
                    </div>
                </div>
            </nav>

            <CreatePostModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
};
