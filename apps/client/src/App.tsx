import './App.css'
import {userStore} from "./stores/userStore.ts";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, redirect, RouterProvider } from 'react-router';
import MainLayout from "./components/layout/MainLayout.tsx";
import {notAuthenticatedMiddleWare} from "./modules/middlewares/notAuthenticated.middleware.ts";
import {SigninPage} from "./pages/SigninPage.tsx";

function App() {
    userStore.persist.rehydrate();
    const queryClient = new QueryClient();

    const route = [{
        path: '/',
        id: 'root',
        element: <MainLayout/>,
        children: [
            {
                path: 'logout',
                loader: () => {
                    userStore.getState().logout();
                    return redirect('/signin');
                },
            },
            {
                loader: notAuthenticatedMiddleWare,
                path: 'signin',
                element: <SigninPage />,
                handle: { title: 'Connectez-vous' },
            }
        ]
    }];

    const router = createBrowserRouter(route);
    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    );
}

export default App
