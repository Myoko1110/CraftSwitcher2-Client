import {z} from "zod";

export * from './global-config';
export * from './server-file-manager';

// ----------------------------------------------------------------

export const resultSchema = z.object({
  result: z.boolean(),
}).transform((data) => data.result);
