import { redirect } from 'react-router';
import { userStore } from '../../stores/userStore';

export const adminMiddleware = () => {
    const access = userStore.getState().access;
    const get = userStore.getState().get;

    if (!access) {
        return redirect('/signin');
    }

    const accessToken = get(access);

    if (!accessToken) {
        return redirect('/signin');
    }

    if (accessToken.role !== 'ADMIN') {
        return redirect('/posts');
    }
};
