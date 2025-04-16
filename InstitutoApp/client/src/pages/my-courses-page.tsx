import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { ProfileHeader } from "@/components/layout/profile-header";
import { ProfileTabs } from "@/components/layout/profile-tabs";
import CourseProgressCard from "@/components/courses/course-progress-card";
import { Course, Enrollment } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function MyCoursesPage() {
  const { data: enrollments, isLoading } = useQuery<(Enrollment & { course: Course })[]>({
    queryKey: ["/api/enrollments"],
  });

  return (
    <div className="min-h-screen pb-16">
      <ProfileHeader />
      <ProfileTabs activeTab="courses" />

      <main className="p-4">
        <h2 className="font-montserrat font-bold text-xl text-primary mb-4">
          CURSOS INSCRITOS
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : enrollments && enrollments.length > 0 ? (
          <div className="space-y-4">
            {enrollments.map((enrollment) => (
              <CourseProgressCard
                key={enrollment.id}
                enrollment={enrollment}
                course={enrollment.course}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-2">
              Você ainda não está inscrito em nenhum curso.
            </p>
            <a href="/" className="text-primary font-medium">
              Explorar cursos disponíveis
            </a>
          </div>
        )}
      </main>

      <BottomNavigation active="courses" />
    </div>
  );
}
