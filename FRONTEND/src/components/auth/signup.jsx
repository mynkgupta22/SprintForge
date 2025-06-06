import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { registerSchema } from "../../schemas/validation";
import useMutation from "@/hooks/useMutation";
import { USERS_REGISTER_REQUEST_OTP } from "@/imports/api";
import { showToast } from '@/utils/toast';

const ROLES = ["ADMIN", "PM", "DEVELOPER"];

function Signup() {
  const navigate = useNavigate();

  const { mutate ,loading} = useMutation();
  // Focus first input on component mount
  useEffect(() => {
    const firstInput = document.querySelector("[data-username-input]");
    if (firstInput) {
      firstInput.focus();
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      mobileNumber: "",
      password: "",
      confirmPassword: "",
      role: "DEVELOPER",
    },
  });

  const role = watch("role");

  const onSubmit = async (data) => {
    const tempData = {
      ...data,
      role: data.role,
    };
    delete tempData.confirmPassword;
    const response = await mutate({ url: USERS_REGISTER_REQUEST_OTP, method: "POST", data: tempData });
    if (response.success) {
      navigate("/auth/verify", { state: { ...tempData } });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-lg border shadow-sm">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-foreground">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="font-medium text-primary hover:text-primary/90"
            >
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                {...register("username")}
                data-username-input
                className={errors.username ? "border-destructive" : ""}
                placeholder="yourusername"
              />
              {errors.username && (
                <p className="text-sm text-destructive">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  {...register("firstName")}
                  className={errors.firstName ? "border-destructive" : ""}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  {...register("lastName")}
                  className={errors.lastName ? "border-destructive" : ""}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input
                id="mobileNumber"
                type="tel"
                autoComplete="tel"
                {...register("mobileNumber")}
                className={errors.mobileNumber ? "border-destructive" : ""}
                placeholder="+91 9876543210"
              />
              {errors.mobileNumber && (
                <p className="text-sm text-destructive">
                  {errors.mobileNumber.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                {...register("role")}
                className="w-full border rounded p-2 mt-1"
                defaultValue="DEVELOPER"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              {errors.role && (
                <p className="text-sm text-destructive">
                  {errors.role.message}
                </p>
              )}
            </div>
            {role === "ADMIN" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="workspaceName">Workspace Name</Label>
                  <Input
                    id="workspaceName"
                    {...register("workspaceName", { required: true })}
                    className={errors.workspaceName ? "border-destructive" : ""}
                    placeholder="Workspace name"
                  />
                  {errors.workspaceName && (
                    <p className="text-sm text-destructive">
                      Workspace name is required
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workspaceDescription">Workspace Description</Label>
                  <Input
                    id="workspaceDescription"
                    {...register("workspaceDescription")}
                    className={errors.workspaceDescription ? "border-destructive" : ""}
                    placeholder="Workspace description (optional)"
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register("password")}
                className={errors.password ? "border-destructive" : ""}
                placeholder="••••••"
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword")}
                className={errors.confirmPassword ? "border-destructive" : ""}
                placeholder="••••••"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <Button loading={loading} type="submit" className="w-full">
            Create account
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
