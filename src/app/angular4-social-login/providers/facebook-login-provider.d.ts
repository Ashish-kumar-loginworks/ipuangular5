import { BaseLoginProvider } from "../entities/base-login-provider";
import { SocialUser } from "../entities/user";
export declare class FacebookLoginProvider extends BaseLoginProvider {
    private clientId;
    private scope;
    static readonly PROVIDER_ID: string;
    constructor(clientId: string, scope?: string);
    initialize(): Promise<SocialUser>;
    signIn(): Promise<SocialUser>;
    signOut(): Promise<any>;
}
