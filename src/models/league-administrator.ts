// /* eslint-disable @typescript-eslint/no-explicit-any */

// import { UserModel } from "./user";

// export type LeagueAdminType = {
//     readonly league_administrator_id: string;
//     readonly user_id: string;
//     organization_type: string;
//     organization_name: string;
//     organization_address: string;
//     organization_photo_url?: string;
//     organization_logo_url?: string;
//     user: UserModel;
//     created_at: Date;
//     updated_at: Date;
//     is_allowed: boolean;
//     is_operational: boolean;
// };

// type LeagueAdminCreationData = {
//     organization_type: string;
//     organization_name: string;
//     organization_address: string;
//     user: UserModel;
//     organization_logo: File;
// };

// function isCreationData(data: any): data is LeagueAdminCreationData {
//     return (
//         "organization_logo" in data &&
//         "organization_type" in data &&
//         "organization_name" in data &&
//         "organization_address" in data &&
//         "user" in data
//     );
// }

// export class LeagueAdministratorModel implements LeagueAdminType {
//     league_administrator_id!: string;
//     user_id!: string;
//     organization_type: string;
//     organization_name: string;
//     organization_address: string;
//     organization_photo_url?: string;
//     organization_logo_url?: string;
//     user: UserModel;
//     created_at!: Date;
//     updated_at!: Date;
//     is_allowed!: boolean;
//     is_operational!: boolean;
//     organization_logo?: File;

//     constructor(data: LeagueAdminType | LeagueAdminCreationData) {
//         if (isCreationData(data)) {
//             this.league_administrator_id = '';
//             this.user_id = '';
//             this.organization_type = data.organization_type;
//             this.organization_name = data.organization_name;
//             this.organization_address = data.organization_address;
//             this.organization_photo_url = undefined;
//             this.organization_logo_url = undefined;
//             this.user = data.user;
//             this.created_at = new Date();
//             this.updated_at = new Date();
//             this.is_allowed = false;
//             this.is_operational = false;
//             this.organization_logo = data.organization_logo;
//         } else {
//             this.league_administrator_id = data.league_administrator_id;
//             this.user_id = data.user_id;
//             this.organization_type = data.organization_type;
//             this.organization_name = data.organization_name;
//             this.organization_address = data.organization_address;
//             this.organization_photo_url = data.organization_photo_url;
//             this.organization_logo_url = data.organization_logo_url;
//             this.user = data.user;
//             this.created_at = data.created_at;
//             this.updated_at = data.updated_at;
//             this.is_allowed = data.is_allowed;
//             this.is_operational = data.is_operational;
//         }
//     }

//     static fromJson(json: Record<string, any>): LeagueAdministratorModel {
//         return new LeagueAdministratorModel({
//             league_administrator_id: json.league_administrator_id,
//             user_id: json.user_id,
//             organization_type: json.organization_type,
//             organization_name: json.organization_name,
//             organization_address: json.organization_address,
//             organization_photo_url: json.organization_photo_url,
//             organization_logo_url: json.organization_logo_url,
//             user: UserModel.fromJson(json.user),
//             created_at: new Date(json.created_at),
//             updated_at: new Date(json.updated_at),
//             is_allowed: json.is_allowed,
//             is_operational: json.is_operational,
//         });
//     }

//     toJson(): Record<string, any> {
//         return {
//             league_administrator_id: this.league_administrator_id,
//             user_id: this.user_id,
//             organization_type: this.organization_type,
//             organization_name: this.organization_name,
//             organization_address: this.organization_address,
//             organization_photo_url: this.organization_photo_url,
//             organization_logo_url: this.organization_logo_url,
//             created_at: this.created_at.toISOString(),
//             updated_at: this.updated_at.toISOString(),
//             is_allowed: this.is_allowed,
//             is_operational: this.is_operational,
//             user: this.user.toJson(),
//         };
//     }

//     toFormDataForCreation(): FormData {
//         const formData = new FormData();
//         formData.append("organization_type", this.organization_type);
//         formData.append("organization_name", this.organization_name);
//         formData.append("organization_address", this.organization_address);
//         if (this.organization_logo) {
//             formData.append("organization_logo", this.organization_logo);
//         }

//         const userMap = this.user.toJsonForCreation();
//         for (const key in userMap) {
//             const value = userMap[key];
//             if (value !== undefined) {
//                 formData.append(`user[${key}]`, String(value));
//             }
//         }

//         return formData;
//     }
// }
