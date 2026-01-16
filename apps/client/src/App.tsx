import './App.css';
import { userStore } from './stores/userStore.ts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, redirect, RouterProvider } from 'react-router';
import MainLayout from './components/layout/MainLayout.tsx';
import { notAuthenticatedMiddleWare } from './modules/middlewares/notAuthenticated.middleware.ts';
import { SigninPage } from './pages/SigninPage.tsx';
import { protectedMiddleware } from './modules/middlewares/protectedMiddleware.ts';
import { AuthRoutes } from './components/auth/AuthRoutes.tsx';
import { AllPostsPage } from './pages/AllPostsPage.tsx';
import { ToastContainer } from 'react-toastify';
import { PostPage } from './pages/PostPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { DarkModeProvider } from './components/darkMode/DarkModeProvider.tsx';
import { adminMiddleware } from './modules/middlewares/adminMiddleware.ts';
import AdminDashboard from './pages/AdminDashboard.tsx';
import { DonatePage } from './pages/DonatePage.tsx';
import { DonationSucessPage } from './pages/DonationSucessPage.tsx';

function App() {
    userStore.persist.rehydrate();
    const queryClient = new QueryClient();

    const route = [
        {
            element: <MainLayout />,
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
                    path: '/',
                    element: <LandingPage />,
                },
                {
                    loader: notAuthenticatedMiddleWare,
                    path: 'signin',
                    element: <SigninPage />,
                    handle: { title: 'Connectez-vous' },
                },
                {
                    loader: notAuthenticatedMiddleWare,
                    path: 'signup',
                    element: <RegisterPage />,
                    handle: { title: "S'inscrire" },
                },
                {
                    loader: protectedMiddleware,
                    element: <AuthRoutes />,
                    children: [
                        {
                            path: '/posts',
                            element: <AllPostsPage />,
                        },
                        {
                            path: '/post/:postId',
                            element: <PostPage />,
                        },
                        {
                            loader: adminMiddleware,
                            children: [
                                {
                                    path: '/admin',
                                    element: <AdminDashboard />,
                                },
                            ],
                        },
                        {
                            path: 'donate',
                            children: [
                                {
                                    index: true,
                                    element: <DonatePage />,
                                },
                                {
                                    path: 'success',
                                    element: <DonationSucessPage />,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ];

    const router = createBrowserRouter(route);
    return (
        <QueryClientProvider client={queryClient}>
            <DarkModeProvider>
                <RouterProvider router={router} />
                <ToastContainer position="top-right" theme="light" />
            </DarkModeProvider>
        </QueryClientProvider>
    );
}

export default App;
