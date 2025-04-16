import { Link } from "wouter";

type ProfileTabsProps = {
  activeTab: "profile" | "courses" | "achievements";
};

export function ProfileTabs({ activeTab }: ProfileTabsProps) {
  return (
    <nav className="bg-primary text-white">
      <div className="flex">
        <Link href="/profile">
          <a className={`py-3 px-4 font-montserrat font-medium ${activeTab === "profile" ? "bg-opacity-20 bg-white" : ""}`}>
            PERFIL
          </a>
        </Link>
        <Link href="/my-courses">
          <a className={`py-3 px-4 font-montserrat font-medium ${activeTab === "courses" ? "bg-opacity-20 bg-white" : ""}`}>
            MEUS CURSOS
          </a>
        </Link>
        <Link href="/achievements">
          <a className={`py-3 px-4 font-montserrat font-medium ${activeTab === "achievements" ? "bg-opacity-20 bg-white" : ""}`}>
            CONQUISTAS
          </a>
        </Link>
      </div>
    </nav>
  );
}
