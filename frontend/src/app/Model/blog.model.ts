import { User } from "./User.model";

export interface Blog {
    id: number;
    title: string;
    content: string;
    authorUsername: string; // changed from author object
    createdAt: string;
    updatedAt: string;
    imageUrl?: string;
    published: boolean;
    type: string;
}

export interface BlogFormData {
    title: string;
    content: string;
    type: string;
    published: boolean;
    imageFile?: File;
}