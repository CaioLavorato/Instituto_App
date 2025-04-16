import { Button } from "@/components/ui/button";
import { Course } from "@shared/schema";
import { Link } from "wouter";
import { Clock } from "lucide-react";

type CourseCardProps = {
  course: Course;
};

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md mb-3 overflow-hidden">
      <div className="relative">
        <img
          src={course.imageUrl}
          alt={course.title}
          className="w-full h-32 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3">
          <h3 className="text-white font-montserrat font-semibold">{course.title}</h3>
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm text-gray-600 mb-2">{course.description}</p>
        <Link href={`/course/${course.id}`}>
          <Button className="bg-secondary text-primary font-semibold py-1 px-4 rounded-full text-sm">
            SAIBA MAIS
          </Button>
        </Link>
        <div className="flex items-center mt-2 text-xs text-gray-600">
          <Clock className="mr-1 h-3 w-3" />
          <span>{Math.floor(course.duration / 60)} horas</span>
        </div>
      </div>
    </div>
  );
}
