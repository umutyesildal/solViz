import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const { register: registerUser, isLoading, error } = useAuthStore();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data.email, data.password, data.fullName);
      router.push("/dashboard");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      setFormError(
        err.response?.data?.detail || "Registration failed. Please try again."
      );
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-dark-500 border border-dark-200 px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">
          Create an Account
        </h2>

        {(formError || error) && (
          <div className="bg-dark-400 text-red-500 p-3 border border-red-500 mb-4 text-sm">
            {formError || error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label
              className="block text-gray-400 text-sm font-medium mb-2"
              htmlFor="fullName"
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              className={`appearance-none border bg-dark-400 w-full py-2 px-3 text-white leading-tight focus:outline-none focus:border-blue-500 ${
                errors.fullName ? "border-red-500" : "border-dark-300"
              }`}
              placeholder="Enter your full name"
              {...register("fullName")}
              disabled={isLoading}
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-400 text-sm font-medium mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              className={`appearance-none border bg-dark-400 w-full py-2 px-3 text-white leading-tight focus:outline-none focus:border-blue-500 ${
                errors.email ? "border-red-500" : "border-dark-300"
              }`}
              placeholder="Enter your email"
              {...register("email")}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-400 text-sm font-medium mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              className={`appearance-none border bg-dark-400 w-full py-2 px-3 text-white leading-tight focus:outline-none focus:border-blue-500 ${
                errors.password ? "border-red-500" : "border-dark-300"
              }`}
              placeholder="Enter your password"
              {...register("password")}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              className="block text-gray-400 text-sm font-medium mb-2"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className={`appearance-none border bg-dark-400 w-full py-2 px-3 text-white leading-tight focus:outline-none focus:border-blue-500 ${
                errors.confirmPassword ? "border-red-500" : "border-dark-300"
              }`}
              placeholder="Confirm your password"
              {...register("confirmPassword")}
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 border border-blue-500 focus:outline-none w-full sm:w-auto flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="small" color="text-white" />
                  <span className="ml-2">Creating Account...</span>
                </>
              ) : (
                "Create Account"
              )}
            </button>

            <a
              href="/login"
              className="inline-block align-baseline font-medium text-sm text-blue-500 hover:text-white"
            >
              Already have an account? Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
