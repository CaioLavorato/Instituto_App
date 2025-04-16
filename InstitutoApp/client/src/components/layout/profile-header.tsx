import { useAuth } from "@/hooks/use-auth";

export function ProfileHeader() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  return (
    <header className="bg-secondary flex items-center p-4">
      <div className="flex items-center flex-grow">
        <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
          <img
            src={user.profileImage || "https://randomuser.me/api/portraits/women/65.jpg"}
            alt={user.fullName}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h1 className="font-montserrat font-bold text-xl">{user.fullName}</h1>
          <p className="text-sm text-primary">{user.email}</p>
        </div>
      </div>
    </header>
  );
}
