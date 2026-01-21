import { useEffect } from 'react';
import { Outlet, useMatches, type UIMatch } from 'react-router-dom';
import Footer from "./Footer.tsx";

interface RouteMeta {
    title?: string;
}

export default function MainLayout() {
    const matches = useMatches() as Array<UIMatch<RouteMeta>>;
    useEffect(() => {
        const match = matches.find((m) => (m.handle as RouteMeta)?.title);

        if ((match?.handle as RouteMeta)?.title) {
            document.title = (match!.handle as RouteMeta).title!;
        }
    }, [matches]);
    return (
        <div className="min-h-screen min-w-screen flex flex-col bg-base-100">
            <main className="flex-1">
                <Outlet />
                <Footer />
            </main>
        </div>
    );
}
