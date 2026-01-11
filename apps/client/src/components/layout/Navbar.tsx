import { Plus } from 'lucide-react';
import { CreatePostModal } from '../post/CreatePostModal.tsx';
import { useState } from 'react';

export const Navbar = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <nav className="sticky top-0 z-50 w-full mx-auto bg-base-100 text-base-content px-8 py-2 shadow-md shadow-base-200">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <a className="btn btn-ghost" href="/">
                        Accueil
                    </a>

                    <div className="flex gap-4">
                        <button
                            className="btn btn-primary"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <Plus />
                            Poster
                        </button>
                        <a className="btn btn-ghost" href="/logout">
                            Deconnexion
                        </a>
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
