import { RoundFormatTypesEnum } from "@/types/leagueCategoryTypes";

export const getPredefinedFormatConfigs = (): Array<{
  label: string;
  format_type: RoundFormatTypesEnum;
  variant: string;
}> => {
  return [
    {
      label: "• 1 Group, All Play All",
      format_type: RoundFormatTypesEnum.RoundRobin,
      variant: "roundrobin_1group",
    },
    {
      label: "• Single Elim, Random Seeding",
      format_type: RoundFormatTypesEnum.Knockout,
      variant: "knockout_singleelim",
    },
    {
      label: "• Standard",
      format_type: RoundFormatTypesEnum.DoubleElimination,
      variant: "doubleelim_standard",
    },
    {
      label: "• Best of 3",
      format_type: RoundFormatTypesEnum.BestOf,
      variant: "bestof_3",
    },
    {
      label: "• Finals Format",
      format_type: RoundFormatTypesEnum.TwiceToBeat,
      variant: "twicetobeat_final",
    },
  ];
};
