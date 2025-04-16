import { ProgressBar } from "@/components/ui/progress-bar";
import { Course, Enrollment } from "@shared/schema";
import { Link } from "wouter";

type CourseProgressCardProps = {
  course: Course;
  enrollment: Enrollment;
};

export default function CourseProgressCard({ course, enrollment }: CourseProgressCardProps) {
  // Format the status badge based on progress
  const getStatusBadge = (progress: number) => {
    if (progress === 100) {
      return (
        <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
          100% CONCLUÍDO
        </span>
      );
    } else if (progress >= 50) {
      return (
        <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
          {progress}% CONCLUÍDO
        </span>
      );
    } else {
      return (
        <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
          {progress}% CONCLUÍDO
        </span>
      );
    }
  };

  return (
    <Link href={`/course/${course.id}`}>
      <a className="block">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center mr-3">
              <img
                src={course.imageUrl}
                alt={course.title}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-montserrat font-semibold">{course.title}</h3>
                  <p className="text-sm text-gray-600">{course.instructor}</p>
                </div>
                {getStatusBadge(enrollment.progress)}
              </div>
              
              {enrollment.progress < 100 && (
                <ProgressBar 
                  value={enrollment.progress} 
                  className="w-full bg-gray-200 rounded-full h-2 mt-2"
                  barClassName="bg-secondary h-2 rounded-full"
                />
              )}
            </div>
          </div>
        </div>
      </a>
    </Link>
  );
}
