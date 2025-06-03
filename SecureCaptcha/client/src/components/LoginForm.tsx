import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { loginSchema } from "@shared/schema";
import CaptchaDisplay from "./CaptchaDisplay";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = loginSchema;

type FormValues = z.infer<typeof formSchema>;

const LoginForm: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [alertMessage, setAlertMessage] = useState<{ message: string; type: "error" | "success" | "warning" } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      captchaInput: "",
    },
  });

  const login = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest('POST', '/api/login', data);
      return res.json();
    },
    onSuccess: (data) => {
      setAlertMessage({ message: "Login successful! Redirecting...", type: "success" });
      form.reset();
      
      // Refresh CAPTCHA after successful login
      queryClient.invalidateQueries({ queryKey: ["/api/captcha"] });
      
      // In a real app, we would redirect to a dashboard
      setTimeout(() => {
        setAlertMessage(null);
      }, 3000);
    },
    onError: (error: Error) => {
      setAlertMessage({ message: error.message || "Login failed. Please try again.", type: "error" });
    },
  });

  const refreshCaptcha = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/captcha"] });
    form.setValue("captchaInput", "");
  };

  const handleSubmit = form.handleSubmit((data) => {
    setAlertMessage(null);
    login.mutate(data);
  });

  return (
    <Card className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Form Header */}
      <div className="px-6 py-8 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-center text-neutral-900">Account Login</h1>
        <p className="mt-2 text-center text-neutral-500 text-sm">Enter your credentials below</p>
      </div>

      {/* Form Content */}
      <Form {...form}>
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {/* Alert Message */}
          {alertMessage && (
            <Alert className={
              alertMessage.type === "error" 
                ? "bg-error bg-opacity-10 text-error" 
                : alertMessage.type === "success" 
                ? "bg-success bg-opacity-10 text-success" 
                : "bg-warning bg-opacity-10 text-warning"
            }>
              <AlertDescription>
                {alertMessage.message}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Username Field */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-neutral-700">Username</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your username"
                    className="focus:ring-primary text-neutral-900 border-gray-300"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-neutral-700">Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    className="focus:ring-primary text-neutral-900 border-gray-300"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* CAPTCHA Section */}
          <CaptchaDisplay 
            onRefresh={refreshCaptcha} 
            isLoading={login.isPending}
          />
          
          {/* CAPTCHA Input Field */}
          <FormField
            control={form.control}
            name="captchaInput"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-neutral-700">CAPTCHA Code</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter the characters shown above"
                    className="focus:ring-primary text-neutral-900 border-gray-300"
                    maxLength={6}
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-2 px-4"
            disabled={login.isPending}
          >
            {login.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : "Sign In"}
          </Button>
        </form>
      </Form>
      
      {/* Form Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-neutral-500">
        Protected by CAPTCHA Technology | <a href="#" className="text-primary hover:underline">Need Help?</a>
      </div>
    </Card>
  );
};

export default LoginForm;
