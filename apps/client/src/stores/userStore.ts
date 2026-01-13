import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {User} from "../modules/types/user.type.ts";
import type {AccessToken} from "../modules/types/acess.type.ts";


type authStore = {
    // set access token
    set: (access: string) => void;

    // extract user info from access token; returns null when access is missing or invalid
    get: (access?: string | null) => User | null;

    // access token
    access?: string | null;

    // logout user
    logout: () => void;
};

export const userStore = create<authStore>()(
    persist(
        (set) => ({
            access: null,
            get: (access?: string | null) => {
                if (!access) return null;
                try {
                    const parts = access.split('.');
                    if (parts.length < 2) return null;
                    const accessPayload: AccessToken = JSON.parse(atob(parts[1]));
                    return {
                        _id: accessPayload.sub,
                        email: accessPayload.email,
                        role: accessPayload.role,
                    };
                } catch (e) {
                    // Invalid token format or JSON parse error
                    return null;
                }
            },
            set: (access: string) => set({ access: access }),
            logout: () => set({ access: null }),
        }),
        { name: 'auth-storage' },
    ),
);
