import { z } from "zod";

export const calculatorSchema = z.object({
    spend: z.coerce.number().min(0.01, "Spend must be greater than 0"),
    clicks: z.coerce.number().min(1, "Clicks must be at least 1"),
    sales: z.coerce.number().min(0, "Sales must be 0 or more"),
    customers: z.coerce.number().min(1, "Customers must be at least 1"),
    repeatRate: z.coerce.number().min(0, "Repeat Rate must be 0 or more"),
});

export type CalculatorInputs = z.infer<typeof calculatorSchema>;
