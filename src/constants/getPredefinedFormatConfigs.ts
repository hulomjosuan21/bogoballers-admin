import { RoundFormatTypesEnum } from "@/types/leagueCategoryTypes";

export const getPredefinedFormatConfigs = (): Array<{
  label: string;
  format_type: RoundFormatTypesEnum;
}> => {
  return [
    {
      label: "Configurable",
      format_type: RoundFormatTypesEnum.RoundRobin,
    },
    {
      label: "Configurable",
      format_type: RoundFormatTypesEnum.Knockout,
    },
    {
      label: "Configurable",
      format_type: RoundFormatTypesEnum.DoubleElimination,
    },
    {
      label: "Configurable",
      format_type: RoundFormatTypesEnum.BestOf,
    },
  ];
};
