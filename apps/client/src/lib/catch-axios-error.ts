import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const catchAxiosError = (error: any) => {
  const errorMessage =
    error.response?.data?.error || error.message || "An error occurred";

  toast.error(errorMessage);
};
