import type {Role} from "./role.type.ts";

export type AccessToken = {
    sub: string;
    role: Role;
    email: string;
    rti: string;
};
