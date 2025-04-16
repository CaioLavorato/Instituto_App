import { Link } from "wouter";
import { BookOpen, HelpCircle, Users, User } from "lucide-react";

type BottomNavigationProps = {
  active: "courses" | "help" | "about" | "profile";
};

export function BottomNavigation({ active }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-w-md mx-auto">
      <div className="flex justify-around items-center py-2">
        <Link href="/">
          <div className={`flex flex-col items-center p-2 ${active === "courses" ? "text-primary" : "text-gray-600"} cursor-pointer`}>
            <BookOpen className="h-5 w-5" />
            <span className="text-xs mt-1">CURSOS</span>
          </div>
        </Link>
        
        <Link href="/help">
          <div className={`flex flex-col items-center p-2 ${active === "help" ? "text-primary" : "text-gray-600"} cursor-pointer`}>
            <HelpCircle className="h-5 w-5" />
            <span className="text-xs mt-1">AJUDA</span>
          </div>
        </Link>
        
        <Link href="/about">
          <div className={`flex flex-col items-center p-2 ${active === "about" ? "text-primary" : "text-gray-600"} cursor-pointer`}>
            <Users className="h-5 w-5" />
            <span className="text-xs mt-1">SOBRE NÓS</span>
          </div>
        </Link>
        
        <Link href="/profile">
          <div className={`flex flex-col items-center p-2 ${active === "profile" ? "text-primary" : "text-gray-600"} cursor-pointer`}>
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">PERFIL</span>
          </div>
        </Link>
      </div>
    </nav>
  );
}
