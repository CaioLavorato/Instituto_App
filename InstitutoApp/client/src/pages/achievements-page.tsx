import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { ProfileHeader } from "@/components/layout/profile-header";
import { ProfileTabs } from "@/components/layout/profile-tabs";
import AchievementCard from "@/components/achievements/achievement-card";
import { Achievement, UserAchievement } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function AchievementsPage() {
  const { data: achievements, isLoading } = useQuery<(UserAchievement & { achievement: Achievement })[]>({
    queryKey: ["/api/user/achievements"],
  });

  return (
    <div className="min-h-screen pb-16">
      <ProfileHeader />
      <ProfileTabs activeTab="achievements" />

      <main className="p-4">
        <h2 className="font-montserrat font-bold text-xl text-primary mb-4">
          SUAS CONQUISTAS
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : achievements && achievements.length > 0 ? (
          <div className="space-y-4">
            {achievements.map((userAchievement) => (
              <AchievementCard
                key={userAchievement.id}
                userAchievement={userAchievement}
                achievement={userAchievement.achievement}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              Não há conquistas disponíveis no momento.
            </p>
          </div>
        )}
      </main>

      <BottomNavigation active="profile" />
    </div>
  );
}
