import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { ProfileHeader } from "@/components/layout/profile-header";
import { ProfileTabs } from "@/components/layout/profile-tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Camera, ImageIcon, Link2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import { z } from "zod";

const profileSchema = z.object({
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (user?.profileImage) {
      setProfileImageUrl(user.profileImage);
    }
  }, [user]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setPreviewImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (values: Partial<ProfileFormValues>) => {
      const res = await apiRequest("PATCH", "/api/user/profile", values);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], data);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const updateProfileImageMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      const res = await apiRequest("PATCH", "/api/user/profile", { profileImage: imageUrl });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], data);
      setIsDialogOpen(false);
      toast({
        title: "Imagem atualizada",
        description: "Sua foto de perfil foi atualizada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar imagem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate({
      fullName: values.fullName,
      phone: values.phone,
    });
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pb-16">
      <ProfileHeader />
      <ProfileTabs activeTab="profile" />

      <main className="p-4">
        <div className="mb-4 text-center">
          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-2">
            <img
              src={user.profileImage || "https://randomuser.me/api/portraits/women/65.jpg"}
              alt={user.fullName}
              className="w-full h-full object-cover"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-secondary text-primary font-semibold py-1 px-4 rounded-full text-sm">
                ALTERAR IMAGEM
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Alterar foto de perfil</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <Tabs defaultValue="device" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="device" className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      <span>Do Dispositivo</span>
                    </TabsTrigger>
                    <TabsTrigger value="url" className="flex items-center gap-2">
                      <Link2 className="h-4 w-4" />
                      <span>Por URL</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="device" className="mt-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-4">
                        Selecione uma foto do seu dispositivo
                      </p>
                      
                      <div 
                        className="w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer mb-4"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {previewImage ? (
                          <img 
                            src={previewImage}
                            alt="Prévia" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Camera className="h-8 w-8 text-gray-400" />
                        )}
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                      
                      <Button 
                        className="w-full"
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                      >
                        Escolher imagem
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="url" className="mt-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-4">
                        Insira a URL de uma imagem para usar como foto de perfil
                      </p>
                      <Input
                        value={profileImageUrl}
                        onChange={(e) => setProfileImageUrl(e.target.value)}
                        placeholder="https://exemplo.com/imagem.jpg"
                        className="mb-4"
                      />
                      {profileImageUrl && (
                        <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-primary my-4">
                          <img 
                            src={profileImageUrl}
                            alt="Prévia" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Em caso de erro na imagem, redefine para um placeholder
                              e.currentTarget.src = "https://randomuser.me/api/portraits/women/65.jpg";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" onClick={() => {
                    setIsDialogOpen(false);
                    setPreviewImage(null);
                    if (user?.profileImage) {
                      setProfileImageUrl(user.profileImage);
                    } else {
                      setProfileImageUrl("");
                    }
                  }}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={() => {
                      if (previewImage) {
                        updateProfileImageMutation.mutate(previewImage);
                      } else if (profileImageUrl) {
                        updateProfileImageMutation.mutate(profileImageUrl);
                      }
                    }}
                    disabled={updateProfileImageMutation.isPending || (!profileImageUrl && !previewImage)}
                  >
                    {updateProfileImageMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Salvar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-600">
                    Nome Completo
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-600">
                    E-mail
                  </FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-600">
                    Celular
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-md font-semibold"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              SALVAR
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full border border-red-500 text-red-500 py-3 rounded-md font-semibold"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              SAIR
            </Button>
          </form>
        </Form>
      </main>

      <BottomNavigation active="profile" />
    </div>
  );
}
