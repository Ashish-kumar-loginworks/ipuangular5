import { BaseLoginProvider } from "../entities/base-login-provider";
import { SocialUser } from "../entities/user";
export declare class GoogleLoginProvider extends BaseLoginProvider {
    private clientId;
    static readonly PROVIDER_ID: string;
    protected auth2: any;
    constructor(clientId: string);
    initialize(): Promise<SocialUser>;
    signIn(): Promise<SocialUser>;
    signOut(): Promise<any>;
}
