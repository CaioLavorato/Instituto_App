import {
  User, InsertUser, Course, InsertCourse, Module, InsertModule,
  Lesson, InsertLesson, Enrollment, InsertEnrollment, Achievement, InsertAchievement,
  UserAchievement, InsertUserAchievement, CompletedLesson, InsertCompletedLesson,
  ForumTopic, InsertForumTopic, ForumReply, InsertForumReply,
  Quiz, InsertQuiz, QuizQuestion, InsertQuizQuestion, QuizAttempt, InsertQuizAttempt
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  
  // Course methods
  getCourse(id: number): Promise<Course | undefined>;
  getCourses(): Promise<Course[]>;
  getPopularCourses(): Promise<Course[]>;
  getNewCourses(): Promise<Course[]>;
  getCoursesByCategory(category: string): Promise<Course[]>;
  searchCourses(query: string): Promise<Course[]>;
  
  // Module methods
  getModulesByCourseId(courseId: number): Promise<Module[]>;
  
  // Lesson methods
  getLessonsByModuleId(moduleId: number): Promise<Lesson[]>;
  getLessonsByCourseId(courseId: number): Promise<Lesson[]>;
  
  // Enrollment methods
  getEnrollmentsByUserId(userId: number): Promise<Enrollment[]>;
  getEnrollment(userId: number, courseId: number): Promise<Enrollment | undefined>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollmentProgress(id: number, progress: number): Promise<Enrollment>;
  completeEnrollment(id: number): Promise<Enrollment>;
  
  // Achievement methods
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  updateUserAchievementProgress(userId: number, achievementId: number, progress: number): Promise<UserAchievement>;
  completeUserAchievement(userId: number, achievementId: number): Promise<UserAchievement>;
  
  // Completed Lesson methods
  completeLesson(data: InsertCompletedLesson): Promise<CompletedLesson>;
  getCompletedLessons(userId: number): Promise<CompletedLesson[]>;
  
  // Forum Topic methods
  getForumTopics(courseId: number): Promise<ForumTopic[]>;
  getForumTopic(id: number): Promise<ForumTopic | undefined>;
  createForumTopic(topic: InsertForumTopic): Promise<ForumTopic>;
  pinForumTopic(id: number, isPinned: boolean): Promise<ForumTopic>;
  
  // Forum Reply methods
  getForumReplies(topicId: number): Promise<ForumReply[]>;
  createForumReply(reply: InsertForumReply): Promise<ForumReply>;
  markReplyAsSolution(id: number, isSolution: boolean): Promise<ForumReply>;
  
  // Quiz methods
  getQuizByModuleId(moduleId: number): Promise<Quiz | undefined>;
  getQuizQuestions(quizId: number): Promise<QuizQuestion[]>;
  getUserQuizAttempts(userId: number, quizId: number): Promise<QuizAttempt[]>;
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private modules: Map<number, Module>;
  private lessons: Map<number, Lesson>;
  private enrollments: Map<number, Enrollment>;
  private achievements: Map<number, Achievement>;
  private userAchievements: Map<number, UserAchievement>;
  private completedLessons: Map<number, CompletedLesson>;
  private forumTopics: Map<number, ForumTopic>;
  private forumReplies: Map<number, ForumReply>;
  public sessionStore: session.Store;
  
  private userIdCounter: number;
  private courseIdCounter: number;
  private moduleIdCounter: number;
  private lessonIdCounter: number;
  private enrollmentIdCounter: number;
  private achievementIdCounter: number;
  private userAchievementIdCounter: number;
  private completedLessonIdCounter: number;
  private forumTopicIdCounter: number;
  private forumReplyIdCounter: number;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.modules = new Map();
    this.lessons = new Map();
    this.enrollments = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.completedLessons = new Map();
    this.forumTopics = new Map();
    this.forumReplies = new Map();
    
    this.userIdCounter = 1;
    this.courseIdCounter = 1;
    this.moduleIdCounter = 1;
    this.lessonIdCounter = 1;
    this.enrollmentIdCounter = 1;
    this.achievementIdCounter = 1;
    this.userAchievementIdCounter = 1;
    this.completedLessonIdCounter = 1;
    this.forumTopicIdCounter = 1;
    this.forumReplyIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize with sample data
    this.initSampleData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...userData, 
      id,
      phone: userData.phone || null,
      profileImage: userData.profileImage || null 
    };
    this.users.set(id, user);
    
    // Initialize achievements for new user
    const achievements = await this.getAchievements();
    achievements.forEach(achievement => {
      this.initializeUserAchievement(id, achievement.id);
    });
    
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Course methods
  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getPopularCourses(): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(course => course.isPopular);
  }

  async getNewCourses(): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(course => course.isNew);
  }

  async getCoursesByCategory(category: string): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(course => course.category === category);
  }

  async searchCourses(query: string): Promise<Course[]> {
    query = query.toLowerCase();
    return Array.from(this.courses.values()).filter(
      course => course.title.toLowerCase().includes(query) || 
        course.description.toLowerCase().includes(query) ||
        course.instructor.toLowerCase().includes(query)
    );
  }

  // Module methods
  async getModulesByCourseId(courseId: number): Promise<Module[]> {
    return Array.from(this.modules.values())
      .filter(module => module.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  }

  // Lesson methods
  async getLessonsByModuleId(moduleId: number): Promise<Lesson[]> {
    return Array.from(this.lessons.values())
      .filter(lesson => lesson.moduleId === moduleId)
      .sort((a, b) => a.order - b.order);
  }

  // Enrollment methods
  async getEnrollmentsByUserId(userId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter(enrollment => enrollment.userId === userId);
  }

  async getEnrollment(userId: number, courseId: number): Promise<Enrollment | undefined> {
    return Array.from(this.enrollments.values()).find(
      enrollment => enrollment.userId === userId && enrollment.courseId === courseId
    );
  }

  async createEnrollment(enrollmentData: InsertEnrollment): Promise<Enrollment> {
    const id = this.enrollmentIdCounter++;
    const enrollment: Enrollment = { 
      ...enrollmentData, 
      id, 
      completedAt: null,
      progress: enrollmentData.progress || 0
    };
    this.enrollments.set(id, enrollment);
    
    // Update achievement progress for enrolling in courses
    this.updateAchievementProgress(enrollmentData.userId);
    
    return enrollment;
  }

  async updateEnrollmentProgress(id: number, progress: number): Promise<Enrollment> {
    const enrollment = this.enrollments.get(id);
    if (!enrollment) {
      throw new Error(`Enrollment with id ${id} not found`);
    }
    
    const updatedEnrollment = { 
      ...enrollment, 
      progress,
      completedAt: progress === 100 ? new Date() : enrollment.completedAt
    };
    this.enrollments.set(id, updatedEnrollment);
    
    // Update achievement progress if course is completed
    if (progress === 100 && !enrollment.completedAt) {
      this.updateAchievementProgress(enrollment.userId);
    }
    
    return updatedEnrollment;
  }

  async completeEnrollment(id: number): Promise<Enrollment> {
    return this.updateEnrollmentProgress(id, 100);
  }

  // Achievement methods
  async getAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return Array.from(this.userAchievements.values()).filter(ua => ua.userId === userId);
  }

  async updateUserAchievementProgress(userId: number, achievementId: number, progress: number): Promise<UserAchievement> {
    const userAchievement = Array.from(this.userAchievements.values()).find(
      ua => ua.userId === userId && ua.achievementId === achievementId
    );
    
    if (!userAchievement) {
      throw new Error(`User achievement not found for user ${userId} and achievement ${achievementId}`);
    }
    
    const updatedUserAchievement = { 
      ...userAchievement, 
      progress,
      completedAt: progress === 100 ? new Date() : userAchievement.completedAt
    };
    this.userAchievements.set(userAchievement.id, updatedUserAchievement);
    
    return updatedUserAchievement;
  }

  async completeUserAchievement(userId: number, achievementId: number): Promise<UserAchievement> {
    return this.updateUserAchievementProgress(userId, achievementId, 100);
  }

  // Completed Lesson methods
  async completeLesson(data: InsertCompletedLesson): Promise<CompletedLesson> {
    const id = this.completedLessonIdCounter++;
    const completedLesson: CompletedLesson = { ...data, id };
    this.completedLessons.set(id, completedLesson);
    
    // Update enrollment progress
    const lesson = this.lessons.get(data.lessonId);
    if (lesson) {
      const module = this.modules.get(lesson.moduleId);
      if (module) {
        const enrollment = Array.from(this.enrollments.values()).find(
          e => e.userId === data.userId && e.courseId === module.courseId
        );
        
        if (enrollment) {
          const allLessonsInCourse = this.getLessonsForCourse(module.courseId);
          const completedLessonsInCourse = Array.from(this.completedLessons.values()).filter(
            cl => cl.userId === data.userId && allLessonsInCourse.some(l => l.id === cl.lessonId)
          );
          
          const progress = Math.floor((completedLessonsInCourse.length / allLessonsInCourse.length) * 100);
          this.updateEnrollmentProgress(enrollment.id, progress);
        }
      }
    }
    
    return completedLesson;
  }

  async getCompletedLessons(userId: number): Promise<CompletedLesson[]> {
    return Array.from(this.completedLessons.values()).filter(cl => cl.userId === userId);
  }

  // Forum Topic methods
  async getForumTopics(courseId: number): Promise<ForumTopic[]> {
    return Array.from(this.forumTopics.values())
      .filter(topic => topic.courseId === courseId)
      .sort((a, b) => {
        // Pinned topics first, then sort by created date (newest first)
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  async getForumTopic(id: number): Promise<ForumTopic | undefined> {
    return this.forumTopics.get(id);
  }

  async createForumTopic(topicData: InsertForumTopic): Promise<ForumTopic> {
    const id = this.forumTopicIdCounter++;
    const topic: ForumTopic = { 
      ...topicData, 
      id, 
      createdAt: new Date(),
      isPinned: false
    };
    this.forumTopics.set(id, topic);
    return topic;
  }

  async pinForumTopic(id: number, isPinned: boolean): Promise<ForumTopic> {
    const topic = this.forumTopics.get(id);
    if (!topic) {
      throw new Error(`Forum topic with id ${id} not found`);
    }
    
    const updatedTopic = { ...topic, isPinned };
    this.forumTopics.set(id, updatedTopic);
    return updatedTopic;
  }

  // Forum Reply methods
  async getForumReplies(topicId: number): Promise<ForumReply[]> {
    return Array.from(this.forumReplies.values())
      .filter(reply => reply.topicId === topicId)
      .sort((a, b) => {
        // Solution replies first, then sort by date (oldest first)
        if (a.isSolution && !b.isSolution) return -1;
        if (!a.isSolution && b.isSolution) return 1;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
  }

  async createForumReply(replyData: InsertForumReply): Promise<ForumReply> {
    const id = this.forumReplyIdCounter++;
    const reply: ForumReply = {
      ...replyData,
      id,
      createdAt: new Date(),
      isSolution: false
    };
    this.forumReplies.set(id, reply);
    return reply;
  }

  async markReplyAsSolution(id: number, isSolution: boolean): Promise<ForumReply> {
    const reply = this.forumReplies.get(id);
    if (!reply) {
      throw new Error(`Forum reply with id ${id} not found`);
    }
    
    const updatedReply = { ...reply, isSolution };
    this.forumReplies.set(id, updatedReply);
    return updatedReply;
  }

  // Helper methods
  private getLessonsForCourse(courseId: number): Lesson[] {
    const moduleIds = Array.from(this.modules.values())
      .filter(m => m.courseId === courseId)
      .map(m => m.id);
    
    return Array.from(this.lessons.values())
      .filter(l => moduleIds.includes(l.moduleId));
  }

  private initializeUserAchievement(userId: number, achievementId: number): UserAchievement {
    const id = this.userAchievementIdCounter++;
    const userAchievement: UserAchievement = {
      id,
      userId,
      achievementId,
      progress: 0,
      completedAt: null
    };
    this.userAchievements.set(id, userAchievement);
    return userAchievement;
  }

  private updateAchievementProgress(userId: number): void {
    // Get all completed enrollments for user
    const completedEnrollments = Array.from(this.enrollments.values()).filter(
      e => e.userId === userId && e.completedAt !== null
    );
    
    // Update achievements based on completed courses
    const achievements = Array.from(this.achievements.values());
    
    achievements.forEach(achievement => {
      const completedCount = completedEnrollments.length;
      const progress = Math.min(100, Math.floor((completedCount / achievement.requiredCount) * 100));
      
      const userAchievement = Array.from(this.userAchievements.values()).find(
        ua => ua.userId === userId && ua.achievementId === achievement.id
      );
      
      if (userAchievement) {
        this.updateUserAchievementProgress(userId, achievement.id, progress);
      }
    });
  }

  // Sample data initialization
  private initSampleData(): void {
    // Create sample user
    const sampleUser: InsertUser = {
      username: "teste@email.com",
      password: "$2b$10$dXCIwaUPf4ajfRm/jIBnWOaPyP8.TxD3HZhxQe6dOqTsL3wttXPxS", // "senha123"
      fullName: "Usuário Teste",
      email: "teste@email.com",
      phone: "11987654321",
      profileImage: "https://randomuser.me/api/portraits/men/1.jpg"
    };
    
    const userId = this.userIdCounter++;
    this.users.set(userId, { ...sampleUser, id: userId });

    // Sample achievements
    const achievements: InsertAchievement[] = [
      {
        title: "PRIMEIRO SUCESSO",
        description: "Completou o primeiro curso",
        icon: "certificate",
        requiredCount: 1
      },
      {
        title: "APRENDIZ CURIOSO",
        description: "Completou 3 cursos",
        icon: "book-reader",
        requiredCount: 3
      },
      {
        title: "EXPLORADOR",
        description: "Completou 5 cursos",
        icon: "search",
        requiredCount: 5
      }
    ];
    
    achievements.forEach(achievement => {
      const id = this.achievementIdCounter++;
      this.achievements.set(id, { ...achievement, id });
      
      // Create user achievement for the sample user
      this.initializeUserAchievement(userId, id);
    });
    
    // Sample courses
    const courses: InsertCourse[] = [
      {
        title: "Diagnóstico Precoce: Introdução à metodologia",
        description: "Uma visão abrangente dos principais fundamentos e técnicas para a detecção precoce de câncer infantil. Voltado para profissionais da saúde, o curso aborda áreas prioritárias e oferece dicas práticas.",
        imageUrl: "https://images.pexels.com/photos/6129507/pexels-photo-6129507.jpeg",
        duration: 420, // 7 hours
        instructor: "Dr. Renato Melograno",
        category: "healthcare",
        isPopular: true,
        isNew: false
      },
      {
        title: "Identificação de Sinais e Sintomas",
        description: "Aprenda a reconhecer os sinais mais comuns do câncer infantil para garantir um diagnóstico precoce.",
        imageUrl: "https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg",
        duration: 300, // 5 hours
        instructor: "Dr. Renato Melograno",
        category: "healthcare",
        isPopular: true,
        isNew: false
      },
      {
        title: "Comunicação com Famílias",
        description: "Desenvolva habilidades para comunicação efetiva com famílias de pacientes em tratamento oncológico.",
        imageUrl: "https://images.pexels.com/photos/7089401/pexels-photo-7089401.jpeg",
        duration: 240, // 4 hours
        instructor: "Dra. Amanda Silva",
        category: "healthcare",
        isPopular: false,
        isNew: true
      },
      {
        title: "Suporte emocional para famílias",
        description: "Estratégias e técnicas para oferecer apoio emocional às famílias durante o tratamento oncológico infantil.",
        imageUrl: "https://images.pexels.com/photos/7551625/pexels-photo-7551625.jpeg",
        duration: 180, // 3 hours
        instructor: "Psic. Marina Costa",
        category: "family",
        isPopular: false,
        isNew: true
      }
    ];
    
    const courseIds: number[] = [];
    courses.forEach(course => {
      const id = this.courseIdCounter++;
      courseIds.push(id);
      this.courses.set(id, { ...course, id });
      
      // Create enrollment for the sample user in this course
      if (id === 1) {
        const enrollmentId = this.enrollmentIdCounter++;
        this.enrollments.set(enrollmentId, {
          id: enrollmentId,
          userId,
          courseId: id,
          progress: 30,
          startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          completedAt: null
        });
      }
      
      // Add sample forum topics for each course
      const topicId1 = this.forumTopicIdCounter++;
      const topic1: ForumTopic = {
        id: topicId1,
        courseId: id,
        userId,
        title: `Dúvidas sobre ${course.title}`,
        content: "Olá colegas, estou com dúvidas sobre este curso. Alguém poderia me ajudar com os conceitos apresentados na primeira aula?",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        isPinned: id === 1 // Pin the first topic in the first course
      };
      this.forumTopics.set(topicId1, topic1);
      
      // Add replies to the first topic
      const replyId1 = this.forumReplyIdCounter++;
      const reply1: ForumReply = {
        id: replyId1,
        topicId: topicId1,
        userId,
        content: "Este curso é excelente! Recomendo focar nos conceitos básicos apresentados no Módulo 1 antes de avançar.",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        isSolution: true
      };
      this.forumReplies.set(replyId1, reply1);
      
      const replyId2 = this.forumReplyIdCounter++;
      const reply2: ForumReply = {
        id: replyId2,
        topicId: topicId1,
        userId,
        content: "Concordo com a resposta acima. Além disso, sugiro revisar o material complementar disponibilizado no final de cada aula.",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        isSolution: false
      };
      this.forumReplies.set(replyId2, reply2);
      
      // Add a second topic for each course
      const topicId2 = this.forumTopicIdCounter++;
      const topic2: ForumTopic = {
        id: topicId2,
        courseId: id,
        userId,
        title: "Materiais complementares",
        content: "Existe algum material complementar recomendado para aprofundar os conhecimentos deste curso?",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        isPinned: false
      };
      this.forumTopics.set(topicId2, topic2);
    });
    
    // Sample modules
    courseIds.forEach(courseId => {
      for (let i = 1; i <= 3; i++) {
        const moduleId = this.moduleIdCounter++;
        this.modules.set(moduleId, {
          id: moduleId,
          courseId,
          title: `MÓDULO ${i}`,
          order: i
        });
        
        // Sample lessons for each module
        for (let j = 1; j <= 3; j++) {
          const lessonId = this.lessonIdCounter++;
          this.lessons.set(lessonId, {
            id: lessonId,
            moduleId,
            title: `${i}.${j} ${i === 1 && j === 1 ? 'Introdução ao diagnóstico precoce' : 
                    i === 1 && j === 2 ? 'Importância da detecção precoce' : 
                    i === 1 && j === 3 ? 'Casos de estudo' : 
                    `Lição ${i}.${j}`}`,
            content: `Conteúdo da lição ${i}.${j}`,
            videoUrl: "https://www.youtube.com/watch?v=example",
            order: j
          });
          
          // Mark some lessons as completed for the first course
          if (courseId === 1 && i === 1) {
            const completedLessonId = this.completedLessonIdCounter++;
            this.completedLessons.set(completedLessonId, {
              id: completedLessonId,
              userId,
              lessonId,
              completedAt: new Date(Date.now() - (10 - j) * 24 * 60 * 60 * 1000) // Spread out over last 10 days
            });
          }
        }
      }
    });
  }
}

export const storage = new MemStorage();
