"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Eye, EyeOff, Lock, User } from "lucide-react";

const formSchema = z.object({
  username: z.string().min(6, "Username must be at least 6 characters long"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

type FormSchema = z.infer<typeof formSchema>;

const SignInPage = () => {
  const [show, setShow] = useState(false);
  const router = useRouter();
  const { signin, loading } = useAuthStore();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormSchema) => {
    try {
      await signin(values);
      toast.success("Signin successful!");
      router.push("/webtrading");
    } catch {
      toast.error("Signin failed!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#030A15] via-[#0D162E] to-[#1a1f35] px-4 py-8 relative overflow-hidden">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#FFDE02]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
      
        <div className="absolute inset-0 bg-linear-to-r from-[#FFDE02]/10 to-blue-500/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        
        <div className="relative bg-linear-to-br from-[#0D162E]/80 to-[#1a1f35]/60 border border-[#FFDE02]/20 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 hover:border-[#FFDE02]/40 transition-all duration-300">
          
          <div className="text-center mb-8">
          
            <h2 className="text-4xl font-bold bg-linear-to-r from-[#FFDE02] to-yellow-300 bg-clip-text text-transparent tracking-tight">
              Welcome Back
            </h2>
          
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Username Field */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 text-sm font-medium flex items-center gap-2 mb-2">
                      <User size={16} />
                      Username
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Input
                          type="text"
                          placeholder="Enter your username"
                          className="bg-[#0a0f1a]/40 !focus:bg-[#0a0f1a]/60 border border-[#1E2A45] focus:border-[#FFDE02] text-gray-100 placeholder-gray-500/70 rounded-xl h-11 px-4 transition-all duration-300 focus:ring-2 focus:ring-[#FFDE02]/30 group-hover:border-[#FFDE02]/30"
                          {...field}
                          disabled={loading}
                        />
                        <div className="absolute inset-0 rounded-xl group-focus-within:from-[#FFDE02]/5 group-focus-within:to-transparent pointer-events-none transition-all duration-300"></div>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 text-sm font-medium flex items-center gap-2 mb-2">
                      <Lock size={16} />
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Input
                          type={show ? "text" : "password"}
                          placeholder="Enter your password"
                          className="bg-[#0a0f1a]/40 focus:bg-[#0a0f1a]/60 border border-[#1E2A45] focus:border-[#FFDE02] text-gray-100 placeholder-gray-500/70 rounded-xl h-11 px-4 pr-12 transition-all duration-300 focus:ring-2 focus:ring-[#FFDE02]/30 group-hover:border-[#FFDE02]/30"
                          {...field}
                          disabled={loading}
                        />
                        <div className="absolute inset-0 rounded-xl group-focus-within:from-[#FFDE02]/5 group-focus-within:to-transparent pointer-events-none transition-all duration-300"></div>

                        <button
                          type="button"
                          onClick={() => setShow(!show)}
                          tabIndex={-1}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-200 text-gray-400 hover:text-[#FFDE02] hover:bg-[#FFDE02]/10"
                        >
                          {show ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-[#FFDE02] to-yellow-400 hover:from-[#ffec66] hover:to-yellow-300 text-black font-semibold py-3 rounded-xl shadow-lg hover:shadow-[#FFDE02]/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group mt-2"
              >
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 translate-x-full group-hover:translate-x-full transition-all duration-500"></div>
                <span className="relative">
                  {loading ? "Signing in..." : "Sign In"}
                </span>
              </Button>
            </form>
          </Form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-linear-to-r from-transparent via-[#1E2A45] to-transparent"></div>
            <span className="text-gray-500 text-xs">OR</span>
            <div className="flex-1 h-px bg-linear-to-r from-transparent via-[#1E2A45] to-transparent"></div>
          </div>

          {/* Footer */}
          <p className="text-sm text-gray-400 text-center">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-[#FFDE02] font-medium hover:text-yellow-300 transition-all duration-200 relative group"
            >
              Create one
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFDE02] group-hover:w-full transition-all duration-300"></span>
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;