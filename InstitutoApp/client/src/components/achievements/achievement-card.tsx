import { ProgressBar } from "@/components/ui/progress-bar";
import { Achievement, UserAchievement } from "@shared/schema";

type AchievementCardProps = {
  achievement: Achievement;
  userAchievement: UserAchievement;
};

export default function AchievementCard({ achievement, userAchievement }: AchievementCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center mb-2">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
          <i className={`fas fa-${achievement.icon} text-secondary`}></i>
        </div>
        <div className="flex-grow">
          <h3 className="font-montserrat font-semibold">{achievement.title}</h3>
          <p className="text-sm text-gray-600">{achievement.description}</p>
        </div>
      </div>
      <ProgressBar 
        value={userAchievement.progress} 
        className="w-full bg-gray-200 rounded-full h-4"
        barClassName="bg-secondary h-4 rounded-full text-xs text-white text-center"
        showLabel
      />
    </div>
  );
}
