"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  username: z.string().min(6, "Username must be at least 6 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

type FormSchema = z.infer<typeof formSchema>;

const SignUpPage = () => {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormSchema) => {
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:4000/api/v1/auth/signup", values);
      const token = res.data.token;
      localStorage.setItem("token", token);
      toast.success("Signup successful!");
      form.reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070E20] px-4">
      <div className="w-full max-w-md bg-[#0D162E]/70 border border-[#1E2A45] backdrop-blur-md rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-[#FFDE02] tracking-wide">
          Lets Create an Account
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Username */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter username"
                      className="bg-transparent border border-[#1E2A45] focus:border-[#FFDE02] text-gray-100 placeholder-gray-500 rounded-xl h-11 transition-all duration-200 focus:ring-1 focus:ring-[#FFDE02]"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400 text-sm" />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter email"
                      className="bg-transparent border border-[#1E2A45] focus:border-[#FFDE02] text-gray-100 placeholder-gray-500 rounded-xl h-11 transition-all duration-200 focus:ring-1 focus:ring-[#FFDE02]"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400 text-sm" />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter password"
                      className="bg-transparent border border-[#1E2A45] focus:border-[#FFDE02] text-gray-100 placeholder-gray-500 rounded-xl h-11 transition-all duration-200 focus:ring-1 focus:ring-[#FFDE02]"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400 text-sm" />
                </FormItem>
              )}
            />

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-[#FFDE02] hover:bg-[#ffec66] text-black font-semibold py-3 rounded-xl shadow-md transition-all duration-200 hover:shadow-[#FFDE02]/30"
              disabled={loading}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </Button>
          </form>
        </Form>

        <p className="text-sm text-gray-400 text-center mt-6">
          Already have an account?{" "}
          <a
            href="/signin"
            className="text-[#FFDE02] hover:underline hover:text-yellow-300 transition"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
