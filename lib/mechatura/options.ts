import type { MechaturaCompetitionType } from "@/lib/payment";

export const mechaturaCompetitionOptions = [
  {
    id: "sumo",
    title: "Sumo",
    description: "Daftar kategori lomba Robot Sumo",
  },
  {
    id: "transporter",
    title: "Transporter",
    description: "Daftar kategori lomba Robot Transporter",
  },
] as const satisfies readonly {
  id: MechaturaCompetitionType;
  title: string;
  description: string;
}[];

export const mechaturaCompetitionLabels = Object.fromEntries(
  mechaturaCompetitionOptions.map((option) => [option.id, option.title])
) as Record<MechaturaCompetitionType, string>;
