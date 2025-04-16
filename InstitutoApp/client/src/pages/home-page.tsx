import { BottomNavigation } from "@/components/layout/bottom-navigation";
import CourseCard from "@/components/courses/course-card";
import { Course } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, Users, UserCog } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: popularCourses, isLoading: isLoadingPopular } = useQuery<Course[]>({
    queryKey: ["/api/courses/popular"],
  });

  const { data: newCourses, isLoading: isLoadingNew } = useQuery<Course[]>({
    queryKey: ["/api/courses/new"],
  });

  const { data: searchResults, isLoading: isLoadingSearch } = useQuery<Course[]>({
    queryKey: ["/api/courses/search", searchQuery],
    queryFn: async ({ queryKey }) => {
      const [_, query] = queryKey;
      if (!query) return [];
      const res = await fetch(`/api/courses/search?q=${encodeURIComponent(query as string)}`);
      if (!res.ok) throw new Error("Failed to search courses");
      return res.json();
    },
    enabled: searchQuery.length > 0,
  });

  return (
    <div className="min-h-screen pb-16">
      <header className="bg-secondary px-4 py-3">
        <div className="flex items-center">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/3/3e/Ronald_McDonald_House_Charities_Logo.svg"
            alt="Instituto Ronald McDonald"
            className="h-8 mr-2"
          />
          <div className="relative flex-grow">
            <div className="relative">
              <Input
                type="text"
                placeholder="Encontre um curso aqui"
                className="w-full py-2 pl-10 pr-4 rounded-full border-none shadow"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-2.5">
                <Search className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4">
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <p className="text-primary font-semibold mb-2">
            «Cuidado» do Instituto Ronald McDonald oferece cursos
            especializados para profissionais da saúde sobre diagnósticos
            precoces e informações de apoio para famílias de crianças em
            tratamento de câncer.
          </p>
        </div>

        {searchQuery && (
          <section className="mb-6">
            <h2 className="font-montserrat font-bold text-lg mb-3">
              Resultados da pesquisa
            </h2>
            
            {isLoadingSearch ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 py-4 text-center">
                Nenhum curso encontrado para "{searchQuery}"
              </p>
            )}
          </section>
        )}

        {!searchQuery && (
          <>
            <section className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-montserrat font-bold text-lg">
                  Cursos mais populares
                </h2>
                <Link href="/courses">
                  <span className="text-sm text-primary cursor-pointer">
                    Veja todos »
                  </span>
                </Link>
              </div>

              {isLoadingPopular ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-3">
                  {popularCourses && popularCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </section>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <Link href="/courses">
                <div className="bg-primary rounded-lg p-3 text-white text-center cursor-pointer hover:bg-primary/90 transition-colors">
                  <Users className="h-6 w-6 mx-auto mb-1" />
                  <h3 className="font-montserrat font-medium text-sm">
                    CURSOS PARA FAMÍLIAS
                  </h3>
                </div>
              </Link>
              <Link href="/courses">
                <div className="bg-primary rounded-lg p-3 text-white text-center cursor-pointer hover:bg-primary/90 transition-colors">
                  <UserCog className="h-6 w-6 mx-auto mb-1" />
                  <h3 className="font-montserrat font-medium text-sm">
                    CURSOS PARA PROFISSIONAIS
                  </h3>
                </div>
              </Link>
            </div>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-montserrat font-bold text-lg">
                  Cursos novos
                </h2>
                <Link href="/courses">
                  <span className="text-sm text-primary cursor-pointer">
                    Veja todos »
                  </span>
                </Link>
              </div>

              {isLoadingNew ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-3">
                  {newCourses && newCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <BottomNavigation active="courses" />
    </div>
  );
}
