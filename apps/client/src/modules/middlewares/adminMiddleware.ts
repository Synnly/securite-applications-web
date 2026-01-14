import { redirect } from 'react-router';
import { userStore } from '../../stores/userStore';

export const adminMiddleware = () => {
    const access = userStore.getState().access;
    const get = userStore.getState().get;
    if (access) {
        const accessToken = get(access);
        if (accessToken) {
            if (accessToken.role !== 'ADMIN') {
                return redirect('/posts');
            }
        } else {
            return redirect('/signin');
        }
    } else {
        return redirect('/signin');
    }
};
