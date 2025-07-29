import { AccountTypeEnum } from "@/enums/enums";
import { accountTypeFromValue } from "@/helpers/accountTypeEnumHelpers";

/* eslint-disable @typescript-eslint/no-explicit-any */
type UserType = {
    user_id: string;
    email: string;
    contact_number: string;
    account_type: AccountTypeEnum;
    is_verified?: boolean;
    created_at: Date;
    updated_at: Date;
};

type UserCreationData = {
    email: string;
    contact_number: string;
    password_str: string;
    account_type: AccountTypeEnum;
};

type UserLoginData = {
    email: string;
    password_str: string;
};

export class UserModel {
    user_id!: string;
    email: string;
    contact_number!: string;
    password_str?: string;
    account_type!: AccountTypeEnum;
    is_verified?: boolean;
    created_at!: Date;
    updated_at!: Date;

    constructor(data: UserType) {
        this.user_id = data.user_id;
        this.email = data.email;
        this.contact_number = data.contact_number;
        this.account_type = data.account_type;
        this.is_verified = data.is_verified;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static create(data: UserCreationData): UserModel {
        const user = new UserModel({
            user_id: '',
            email: data.email,
            contact_number: data.contact_number,
            account_type: data.account_type,
            is_verified: false,
            created_at: new Date(),
            updated_at: new Date(),
        });
        user.password_str = data.password_str;
        return user;
    }

    static login(data: UserLoginData): UserModel {
        const user = new UserModel({
            user_id: '',
            email: data.email,
            contact_number: '',
            account_type: AccountTypeEnum.PLAYER,
            is_verified: false,
            created_at: new Date(),
            updated_at: new Date(),
        });
        user.password_str = data.password_str;
        return user;
    }

    static fromJson(json: Record<string, any>): UserModel {
        return new UserModel({
            user_id: json.user_id,
            email: json.email,
            contact_number: json.contact_number,
            account_type: accountTypeFromValue(json.account_type)!,
            is_verified: json.is_verified,
            created_at: new Date(json.created_at),
            updated_at: new Date(json.updated_at),
        });
    }

    toJson(): Record<string, any> {
        return {
            user_id: this.user_id,
            email: this.email,
            contact_number: this.contact_number,
            account_type: this.account_type,
            created_at: this.created_at.toISOString(),
            updated_at: this.updated_at.toISOString(),
        };
    }

    toJsonForLogin(): Record<string, string | undefined> {
        return {
            email: this.email,
            password_str: this.password_str,
        };
    }

    toFormDataForLogin(): FormData {
        const formData = new FormData();
        formData.append("email", this.email);
        if (this.password_str !== undefined) {
            formData.append("password_str", this.password_str);
        }
        return formData;
    }

    toJsonForCreation(): Record<string, string | AccountTypeEnum | undefined> {
        return {
            email: this.email,
            password_str: this.password_str,
            contact_number: this.contact_number,
            account_type: this.account_type,
        };
    }
}