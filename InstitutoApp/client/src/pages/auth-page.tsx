import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { InsertUser, insertUserSchema, loginSchema } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Redirect } from "wouter";
import { z } from "zod";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { toast } = useToast();

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(
      insertUserSchema
        .extend({
          confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: "Passwords don't match",
          path: ["confirmPassword"],
        })
    ),
    defaultValues: {
      username: "",
      email: "",
      fullName: "",
      password: "",
      confirmPassword: "",
      phone: "",
      profileImage: "",
    },
  });

  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (
    data: z.infer<typeof insertUserSchema> & { confirmPassword: string }
  ) => {
    const { confirmPassword, ...userData } = data;
    registerMutation.mutate(userData as InsertUser);
  };

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/7551625/pexels-photo-7551625.jpeg"
          alt="Mother and child"
          className="object-cover h-full w-full"
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <Card className="bg-white bg-opacity-95 w-4/5 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h1 className="font-montserrat font-bold text-2xl text-primary mb-1">
                  Cuidado<span className="text-secondary">app</span>
                </h1>
                <p className="text-gray-600 text-sm">
                  por Instituto Ronald McDonald
                </p>
              </div>

              {isLoginMode ? (
                <form
                  className="space-y-4"
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                >
                  <div>
                    <Label htmlFor="email" className="text-sm text-gray-600">
                      E-mail
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      className="mt-1"
                      {...loginForm.register("email")}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-xs text-red-600 mt-1">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-sm text-gray-600">
                      Senha
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      className="mt-1"
                      {...loginForm.register("password")}
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-xs text-red-600 mt-1">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary text-white"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    ENTRAR
                  </Button>

                  <Button
                    type="button"
                    className="w-full bg-secondary text-primary"
                  >
                    ÁREA DO PROFESSOR
                  </Button>

                  <p className="text-sm text-center text-gray-600">
                    Esqueceu a sua senha?
                  </p>

                  <div className="text-center pt-4">
                    <p className="text-sm text-gray-600">
                      Não tem uma conta?{" "}
                      <button
                        type="button"
                        className="text-primary font-semibold"
                        onClick={() => setIsLoginMode(false)}
                      >
                        Cadastre-se
                      </button>
                    </p>
                  </div>
                </form>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                >
                  <div>
                    <Label htmlFor="fullName" className="text-sm text-gray-600">
                      Nome Completo
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      className="mt-1"
                      {...registerForm.register("fullName")}
                    />
                    {registerForm.formState.errors.fullName && (
                      <p className="text-xs text-red-600 mt-1">
                        {registerForm.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm text-gray-600">
                      E-mail
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      className="mt-1"
                      {...registerForm.register("email")}
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-xs text-red-600 mt-1">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm text-gray-600">
                      Telefone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      className="mt-1"
                      {...registerForm.register("phone")}
                    />
                    {registerForm.formState.errors.phone && (
                      <p className="text-xs text-red-600 mt-1">
                        {registerForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-sm text-gray-600">
                      Senha
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      className="mt-1"
                      {...registerForm.register("password")}
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-xs text-red-600 mt-1">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm text-gray-600"
                    >
                      Confirmar Senha
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      className="mt-1"
                      {...registerForm.register("confirmPassword")}
                    />
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-xs text-red-600 mt-1">
                        {registerForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary text-white"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    CADASTRAR
                  </Button>

                  <div className="text-center pt-4">
                    <p className="text-sm text-gray-600">
                      Já tem uma conta?{" "}
                      <button
                        type="button"
                        className="text-primary font-semibold"
                        onClick={() => setIsLoginMode(true)}
                      >
                        Faça login
                      </button>
                    </p>
                  </div>
                </form>
              )}

              <div className="mt-8 text-center">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3e/Ronald_McDonald_House_Charities_Logo.svg"
                  alt="Instituto Ronald McDonald Logo"
                  className="h-10 mx-auto"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
