import type {Role} from "./role.type.ts";

export type User = {
    _id: string;
    email: string;
    role: Role;
}

export interface SimplyUser {
  _id: string;
  email: string;
  createdAt: string;
  bannedAt?: string;
}