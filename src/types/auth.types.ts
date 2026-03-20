
export type UserRole =
    | "PATIENT"
    | "DOCTOR"
    | "ADMIN"
    | "SUPER_ADMIN";

export type UserStatus =
    | "ACTIVE"
    | "INACTIVE"
    | "BLOCKED"
    | "PENDING";

export type AuthProvider =
    | "local"
    | "google";

export interface IUser {
    _id: string;
    email: string;
    name: string;
    avatar?: string | null;
    role: UserRole;
    status: UserStatus;
    provider: AuthProvider;
    isEmailVerified: boolean;
    lastLogin?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ILoginInput {
    email: string;
    password: string;
}

export interface IRegisterInput {
    name: string;
    email: string;
    password: string;
    avatar?: string;
}

export interface IUpdateUserInput {
    name?: string;
    avatar?: string | null;
    role?: UserRole;
    status?: UserStatus;
}

export interface IAuthResponse {
    success: boolean;
    message: string;
    data: {
        user: IUser;
        accessToken: string;
        refreshToken?: string;
    };
}

export interface IRefreshTokenResponse {
    success: boolean;
    data: {
        accessToken: string;
    };
}

export interface IApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

