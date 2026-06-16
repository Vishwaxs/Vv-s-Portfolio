import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(200),
  email: z.string().trim().email("Please enter a valid email").max(320),
  // RHF always submits strings, so empty-string (not optional) keeps
  // z.input and z.output identical for the resolver
  subject: z.string().trim().max(300),
  message: z.string().trim().min(10, "Tell me a bit more (10+ characters)").max(5000),
  // honeypot: humans never fill this. Kept always-valid so a filled value
  // reaches the route, which returns a fake success instead of a 400 — bots
  // learn nothing. The route checks `website` truthiness to drop the message.
  website: z.string(),
});

export type ContactInput = z.infer<typeof contactSchema>;
