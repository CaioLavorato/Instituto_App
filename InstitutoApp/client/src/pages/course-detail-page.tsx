import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Course, Enrollment, ForumTopic, ForumReply, Lesson, Module } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle, ChevronDown, FileText, Loader2, MessageSquare, Play, Plus, ThumbsUp, User } from "lucide-react";
import { Link, useParams } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function CourseDetailPage() {
  const { id } = useParams();
  const courseId = parseInt(id || "0");
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("conteudo");
  const [newTopic, setNewTopic] = useState({ title: "", content: "" });
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);

  // Query forum topics
  const { data: forumTopics, isLoading: isLoadingTopics } = useQuery<(ForumTopic & { user: any })[]>({
    queryKey: [`/api/courses/${courseId}/forum`],
    enabled: !!courseId && activeTab === "forum"
  });

  const { data: course, isLoading: isLoadingCourse } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
  });

  const { data: modules, isLoading: isLoadingModules } = useQuery<Module[]>({
    queryKey: [`/api/courses/${courseId}/modules`],
    enabled: !!courseId,
  });

  const { data: enrollments } = useQuery<(Enrollment & { course: Course })[]>({
    queryKey: ["/api/enrollments"],
  });

  const { data: completedLessons } = useQuery<any[]>({
    queryKey: ["/api/user/completed-lessons"],
  });

  const enrollment = enrollments?.find(e => e.courseId === courseId);
  const isEnrolled = !!enrollment;

  const enrollMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/enrollments", { courseId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
      toast({
        title: "Inscrição realizada",
        description: "Você foi inscrito no curso com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro na inscrição",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Function to check if a lesson is completed
  const isLessonCompleted = (lessonId: number) => {
    return completedLessons?.some(cl => cl.lessonId === lessonId) || false;
  };

  // Load all lessons upfront
  const { data: allLessons } = useQuery<Lesson[]>({
    queryKey: [`/api/courses/${courseId}/lessons`],
    enabled: !!courseId && !!modules,
  });
  
  // Group lessons by module
  const moduleWithLessons = modules?.map(module => {
    const moduleLessons = allLessons?.filter(lesson => lesson.moduleId === module.id) || [];
    
    return {
      ...module,
      lessons: moduleLessons
    };
  });
  
  // Create a forum topic
  const createTopicMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/courses/${courseId}/forum`, newTopic);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/forum`] });
      setNewTopic({ title: "", content: "" });
      setIsCreatingTopic(false);
      toast({
        title: "Tópico criado",
        description: "Seu tópico foi criado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar tópico",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoadingCourse || isLoadingModules) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-4">
          <h1 className="text-xl font-bold mb-2">Curso não encontrado</h1>
          <Link href="/">
            <div className="text-primary cursor-pointer">Voltar para a página inicial</div>
          </Link>
        </div>
      </div>
    );
  }

  const completeLesson = async (lessonId: number) => {
    try {
      await apiRequest("POST", "/api/lessons/complete", { lessonId });
      queryClient.invalidateQueries({ queryKey: ["/api/user/completed-lessons"] });
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
      toast({
        title: "Lição completada",
        description: "Seu progresso foi atualizado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro ao completar lição",
        description: "Não foi possível atualizar seu progresso.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <header className="bg-primary text-white p-4">
        <div className="flex items-center">
          <Link href="/">
            <div className="mr-3 cursor-pointer">
              <ArrowLeft className="text-xl" />
            </div>
          </Link>
          <h1 className="font-montserrat font-bold text-xl">{course.title}</h1>
        </div>
      </header>

      <div className="relative">
        <img
          src={course.imageUrl}
          alt={course.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <button className="bg-white bg-opacity-80 rounded-full w-16 h-16 flex items-center justify-center">
            <Play className="text-primary text-3xl ml-1" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <p className="text-sm text-gray-600 mb-4">{course.description}</p>

        <Tabs defaultValue="conteudo" className="w-full" onValueChange={(value) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="conteudo" className="text-sm">CONTEÚDO</TabsTrigger>
            <TabsTrigger value="forum" className="text-sm">FÓRUM</TabsTrigger>
          </TabsList>
          
          <TabsContent value="conteudo" className="mt-2">
            <div className="mb-6">
              {moduleWithLessons?.map((module) => (
                <Accordion type="single" collapsible key={module.id} className="mb-2 border border-gray-200 rounded-md">
                  <AccordionItem value={`module-${module.id}`} className="border-none">
                    <AccordionTrigger className="p-3 font-montserrat font-semibold">
                      {module.title}
                    </AccordionTrigger>
                    <AccordionContent className="p-3 border-t border-gray-200">
                      <ul className="space-y-2">
                        {module.lessons?.map((lesson) => (
                          <li key={lesson.id} className="flex items-center">
                            {isLessonCompleted(lesson.id) ? (
                              <CheckCircle className="text-green-500 mr-2 h-5 w-5" />
                            ) : (
                              <button 
                                onClick={() => completeLesson(lesson.id)}
                                className="w-5 h-5 rounded-full border border-gray-300 mr-2 flex-shrink-0"
                              />
                            )}
                            <span>{lesson.title}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="forum" className="mt-2">
            {isCreatingTopic ? (
              <Card className="p-4 mb-4">
                <h3 className="font-semibold mb-2">Novo Tópico</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="topic-title">Título</Label>
                    <Input 
                      id="topic-title" 
                      value={newTopic.title}
                      onChange={(e) => setNewTopic({...newTopic, title: e.target.value})}
                      placeholder="Digite o título do tópico"
                    />
                  </div>
                  <div>
                    <Label htmlFor="topic-content">Conteúdo</Label>
                    <Textarea 
                      id="topic-content" 
                      value={newTopic.content}
                      onChange={(e) => setNewTopic({...newTopic, content: e.target.value})}
                      placeholder="Digite o conteúdo do tópico"
                      rows={4}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreatingTopic(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={() => createTopicMutation.mutate()}
                      disabled={createTopicMutation.isPending || !newTopic.title || !newTopic.content}
                    >
                      {createTopicMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Publicar
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="text-right mb-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsCreatingTopic(true)}
                  disabled={!user}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Novo Tópico
                </Button>
              </div>
            )}
            
            {isLoadingTopics ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : forumTopics?.length === 0 ? (
              <div className="text-center p-8 border rounded-md">
                <MessageSquare className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Nenhum tópico ainda. Seja o primeiro a criar uma discussão!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {forumTopics?.map((topic) => (
                  <Card key={topic.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{topic.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{topic.content.substring(0, 150)}{topic.content.length > 150 ? '...' : ''}</p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <span className="font-medium">{topic.user?.fullName}</span>
                          <span className="mx-1">•</span>
                          <span>{new Date(topic.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="text-center mt-6">
          {isEnrolled ? (
            <Button className="bg-primary text-white font-semibold py-3 px-6 rounded-md w-full">
              CONTINUAR CURSO
            </Button>
          ) : (
            <Button 
              className="bg-primary text-white font-semibold py-3 px-6 rounded-md w-full"
              onClick={() => enrollMutation.mutate()}
              disabled={enrollMutation.isPending}
            >
              {enrollMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              INSCREVER-SE NO CURSO
            </Button>
          )}
        </div>
      </div>

      <BottomNavigation active="courses" />
    </div>
  );
}
