/* eslint-disable @next/next/no-img-element */
'use client';
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegisterForm } from "@/hooks/use-register-form";
import { ComponentProps } from "react";
import Link from "next/link";
import { RoleOption } from "@/lib/roles";

export function RegisterForm({
  className,
  ...props
}: ComponentProps<"div">) {
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    // isPending,
    apiError,
    onSubmit,
    roles,
    isRegistering,
  } = useRegisterForm();


  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Create an account</h1>
                <p className="text-muted-foreground text-balance">
                  Register to  as Artist or Artist Manager
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  required
                  {...register("confirm_password")}
                />
                {errors.confirm_password && (
                  <p className="text-red-500 text-sm">
                    {errors.confirm_password.message}
                  </p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                  {...register("role")}
                >
                  <option value="">Select a role</option>
                  {roles.map((option: RoleOption) => (
                    <option key={option.key} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className="text-red-500 text-sm">
                    {errors.role.message}
                  </p>
                )}
              </div>

              {apiError && (
                <div className="text-red-500 text-sm">{apiError}</div>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || isRegistering}
              >
                {isRegistering
                  ? "Creating account..."
                  : "Create Account"}
              </Button>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline underline-offset-4">
                  Login
                </Link>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <Image
              src="/asset/login.png"
              alt="Image"
              fill // Use fill to make the image cover the parent div
              className="object-cover hover:scale-105 transition-transform duration-300 ease-in-out" // Add your desired styles here
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
