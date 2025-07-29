import { AccountTypeEnum } from "@/enums/enums";

export function accountTypeFromValue(value?: string): AccountTypeEnum | undefined {
    return Object.values(AccountTypeEnum).find(v => v === value);
}

export function accountTypeFromName(name?: string): AccountTypeEnum | undefined {
    if (!name) return undefined;
    return (AccountTypeEnum as Record<string, AccountTypeEnum>)[name];
}

export function accountTypeEqualsString(enumValue: AccountTypeEnum, input: string): boolean {
    return enumValue === input ||
        AccountTypeEnum[input as keyof typeof AccountTypeEnum] === enumValue ||
        (enumValue as unknown as string) === input;
}

/*
const apiResponse = {
  account_type: "PLAYER",
};

const typeFromValue = accountTypeFromValue(apiResponse.account_type);
console.log("From value:", typeFromValue);

const typeFromName = accountTypeFromName("PLAYER");
console.log("From name:", typeFromName);

if (typeFromValue && accountTypeEqualsString(typeFromValue, "PLAYER")) {
  console.log("User is a PLAYER.");
}

if (typeFromName === AccountTypeEnum.PLAYER) {
  console.log("Enum key match: PLAYER");
}

const userInput = "LGU_ADMINISTRATOR";
const matchedType = accountTypeFromValue(userInput);
if (matchedType) {
  console.log("Valid account type:", matchedType);
} else {
  console.log("Invalid account type:", userInput);
}
*/