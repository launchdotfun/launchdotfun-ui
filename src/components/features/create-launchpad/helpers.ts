import yup from "@/lib/yup";
import { isAddress } from "viem";

export const createPresaleSchema = yup.object().shape({
  tokenAddress: yup
    .string()
    .required("Token contract address is required")
    .test("is-valid-address", "Invalid token address", (value) => {
      return isAddress(value);
    }),
  tokenName: yup.string().required("Token name is required"),
  tokenSymbol: yup.string().required("Token symbol is required"),
  presaleRate: yup
    .number()
    .typeError("Presale rate must be a number")
    .label("Presale rate")
    .required("Presale rate is required")
    .positive("Presale rate must be positive"),
  softCap: yup
    .number()
    .label("Soft cap")
    .typeError("Soft cap must be a number")
    .required("Soft cap is required")
    .positive("Soft cap must be positive"),
  hardCap: yup
    .number()
    .label("Hard cap")
    .typeError("Hard cap must be a number")
    .required("Hard cap is required")
    .positive("Hard cap must be positive")
    .moreThan(yup.ref("softCap"), "Hard cap must be greater than soft cap"),
  description: yup.string().label("Project description").required("Project description is required"),
  website: yup.string().url("Must be a valid URL").optional(),
  telegram: yup.string().url("Must be a valid URL").optional(),
  twitter: yup.string().url("Must be a valid URL").optional(),
  startDate: yup.date().required("Start date is required"),
  endDate: yup.date().required("End date is required").min(yup.ref("startDate"), "End date must be after start date"),
  thumbnail: yup.string().optional(),
  zTokenAddress: yup
    .string()
    .label("zToken Address")
    .test("is-valid-address", "Invalid zToken address", (value) => {
      if (!value) return true;
      return isAddress(value);
    })
    .optional(),
});

export type FormData = yup.InferType<typeof createPresaleSchema>;
