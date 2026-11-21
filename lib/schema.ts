import { z } from "zod";

export const rsvpSchema = z.object({
  invitationId: z.string().min(1).max(60),
  guestName: z
    .string()
    .trim()
    .min(2, "Խնդրում ենք գրել Ձեր անունը և ազգանունը")
    .max(80, "Անունը չափազանց երկար է"),
  attendance: z.enum(["yes", "no"], {
    required_error: "Խնդրում ենք ընտրել պատասխանը",
    invalid_type_error: "Խնդրում ենք ընտրել պատասխանը",
  }),
  guestCount: z
    .number({ invalid_type_error: "Նշեք հյուրերի քանակը" })
    .int()
    .min(1, "Առնվազն 1 հյուր")
    .max(10, "Առավելագույնը 10 հյուր"),
  companionName: z.string().trim().max(80, "Անունը չափազանց երկար է").optional().or(z.literal("")),
  message: z.string().trim().max(500, "Առավելագույնը 500 նիշ").optional().or(z.literal("")),
  // Spam պաշտպանություն. honeypot դաշտը պետք է մնա դատարկ
  website: z.string().max(0).optional(),
  // Ձևը բացելուց անցած ժամանակը (ms). շատ արագ ուղարկումները բոտ են
  elapsed: z.number().optional(),
});

export type RsvpInput = z.infer<typeof rsvpSchema>;

export const settingsSchema = z.object({
  event_time: z.string().regex(/^[0-2][0-9]:[0-5][0-9]$/, "Ձևաչափ՝ ԺԺ:ՐՐ"),
  venue_name: z.string().trim().min(2).max(120),
  inviter_name: z.string().trim().min(2, "Գրեք հրավիրողի անունը").max(80),
  address: z.string().trim().max(200),
  map_url: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || /^https:\/\//.test(v), "Հղումը պետք է սկսվի https://-ով"),
});
export type SettingsInput = z.infer<typeof settingsSchema>;
