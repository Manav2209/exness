"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner"; // or use your preferred toast library

import {
    Form,
    FormControl,
    FormDescription,
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
    password: z.string().min(8, "Password must be at least 8  characters long"),
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
        console.log("Form Submitted:", values);

        const res = await axios.post("http://localhost:3000/api/v1/auth/signup", values);
        const token = res.data.token;
        localStorage.setItem("token", token);


        toast.success("Signup successful!");
        console.log("Server response:", res.data);

        form.reset();
        } catch (error: any) {
        console.error("Signup error:", error);
        toast.error(error.response?.data?.message || "Something went wrong!");
        } finally {
        setLoading(false);
        }
    };

return (
    <div className="max-w-md mx-auto mt-10 p-6 rounded-2xl shadow-md border">
        <h2 className="text-2xl font-semibold mb-4 text-center">Sign Up</h2>

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Username */}
            <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                    <Input placeholder="Enter username" {...field} disabled={loading} />
                    </FormControl>
                    
                    <FormMessage />
                </FormItem>
                )}
            />

            {/* Email */}
            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                    <Input type="email" placeholder="Enter email" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            {/* Password */}
            <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                    <Input
                        type="password"
                        placeholder="Enter password"
                        {...field}
                        disabled={loading}
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing Up..." : "Sign Up"}
            </Button>
            </form>
        </Form>
        </div>
    );
};

export default SignUpPage;
