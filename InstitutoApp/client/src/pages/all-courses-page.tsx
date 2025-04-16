import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Course } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import { Link } from "wouter";
import CourseCard from "@/components/courses/course-card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function AllCoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });
  
  // Filter courses based on search query
  const filteredCourses = courses?.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-16">
      <header className="bg-primary text-white p-4">
        <div className="flex items-center">
          <Link href="/">
            <div className="mr-3 cursor-pointer">
              <ArrowLeft className="text-xl" />
            </div>
          </Link>
          <h1 className="font-montserrat font-bold text-xl">Todos os Cursos</h1>
        </div>
      </header>

      <div className="p-4">
        <div className="relative mb-6">
          <Input
            type="search"
            placeholder="Buscar cursos..."
            className="w-full py-2 pl-10 pr-4 rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center mt-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : filteredCourses && filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center mt-10 p-4">
            <div className="text-gray-400 mb-2">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Nenhum curso encontrado</h3>
            <p className="text-gray-600">
              Tente buscar com outros termos ou categorias.
            </p>
          </div>
        )}
      </div>

      <BottomNavigation active="courses" />
    </div>
  );
}