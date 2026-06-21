import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { register as registerUser } from "../services/auth.service";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import {
  inputClass,
  buttonClass,
  labelClass,
  errorClass,
} from "../utils/styles";

const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const navigate = useNavigate();

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError(null);
      await registerUser(data);
      navigate("/login");
    } catch {
      setError("Registration failed. Email may already be in use.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Create account
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Start tracking your expenses today
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              className={inputClass}
            />
            {errors.email && (
              <p className={errorClass}>{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className={inputClass}
            />
            {errors.password && (
              <p className={errorClass}>{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className={buttonClass}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-gray-900 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
