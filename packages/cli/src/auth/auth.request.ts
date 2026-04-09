import { AuthenticatedRequest } from "nmg8-workflow";

export namespace AuthRequest {
    export type UserRegister = { 
      email: string;
      password: string;
      first_name?: string;
      last_name?: string;
    };
    export type Register = AuthenticatedRequest<{}, {}, UserRegister>;

    export type UserLogin = { email: string; password: string };

    export type Login = AuthenticatedRequest<{}, {}, UserLogin>;
}

export default AuthRequest;