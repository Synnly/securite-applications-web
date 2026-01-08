import { redirect } from 'react-router-dom';
import { userStore } from '../../stores/userStore';

/**
 * Check if user is not authenticated. If it is, redirect to home page
 */
export const notAuthenticatedMiddleWare = () => {
    const access = userStore.getState().access;
    const get = userStore.getState().get;
    if (access) {
        const accessToken = get(access);
        if (accessToken) return redirect(`/`);
    }
};