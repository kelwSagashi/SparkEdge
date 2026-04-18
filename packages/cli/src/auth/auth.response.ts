import { UserReturningValues } from "spark-edge-db";

export namespace AuthResponse {
    type ReturningResponse<T> = {
        data: T,
        error?: string | null;
    }

    export type Login = ReturningResponse<{
        token: string | null;
        user: UserReturningValues | null;
    }>
}

export default AuthResponse;
