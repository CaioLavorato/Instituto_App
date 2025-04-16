import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertEnrollmentSchema, 
  insertCompletedLessonSchema,
  loginSchema,
  insertUserSchema,
  insertForumTopicSchema,
  insertForumReplySchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Courses routes
  app.get("/api/courses", async (req, res) => {
    const courses = await storage.getCourses();
    res.json(courses);
  });

  app.get("/api/courses/popular", async (req, res) => {
    const courses = await storage.getPopularCourses();
    res.json(courses);
  });

  app.get("/api/courses/new", async (req, res) => {
    const courses = await storage.getNewCourses();
    res.json(courses);
  });

  app.get("/api/courses/category/:category", async (req, res) => {
    const category = req.params.category;
    const courses = await storage.getCoursesByCategory(category);
    res.json(courses);
  });

  app.get("/api/courses/search", async (req, res) => {
    const query = req.query.q as string || "";
    const courses = await storage.searchCourses(query);
    res.json(courses);
  });

  app.get("/api/courses/:id", async (req, res) => {
    const courseId = parseInt(req.params.id);
    const course = await storage.getCourse(courseId);
    
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    
    res.json(course);
  });

  // Modules and lessons routes
  app.get("/api/courses/:id/modules", async (req, res) => {
    const courseId = parseInt(req.params.id);
    const modules = await storage.getModulesByCourseId(courseId);
    res.json(modules);
  });

  app.get("/api/modules/:id/lessons", async (req, res) => {
    const moduleId = parseInt(req.params.id);
    const lessons = await storage.getLessonsByModuleId(moduleId);
    res.json(lessons);
  });

  // Get all lessons for a course
  app.get("/api/courses/:id/lessons", async (req, res) => {
    const courseId = parseInt(req.params.id);
    
    try {
      // Get modules for the course
      const modules = await storage.getModulesByCourseId(courseId);
      
      // Get lessons for each module and flatten the array
      const lessonsPromises = modules.map(module => storage.getLessonsByModuleId(module.id));
      const lessonsNestedArray = await Promise.all(lessonsPromises);
      const lessons = lessonsNestedArray.flat();
      
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lessons for course" });
    }
  });

  // Enrollment routes
  app.get("/api/enrollments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const enrollments = await storage.getEnrollmentsByUserId(req.user!.id);
    
    // Get course details for each enrollment
    const enrollmentsWithCourses = await Promise.all(enrollments.map(async (enrollment) => {
      const course = await storage.getCourse(enrollment.courseId);
      return { ...enrollment, course };
    }));
    
    res.json(enrollmentsWithCourses);
  });

  app.post("/api/enrollments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const validatedData = insertEnrollmentSchema.parse({
        ...req.body,
        userId: req.user!.id,
        startedAt: new Date()
      });
      
      // Check if user is already enrolled
      const existingEnrollment = await storage.getEnrollment(req.user!.id, validatedData.courseId);
      if (existingEnrollment) {
        return res.status(400).json({ message: "Already enrolled in this course" });
      }
      
      const enrollment = await storage.createEnrollment(validatedData);
      res.status(201).json(enrollment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid enrollment data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/enrollments/:id/progress", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const enrollmentId = parseInt(req.params.id);
    const progress = parseInt(req.body.progress);
    
    if (isNaN(progress) || progress < 0 || progress > 100) {
      return res.status(400).json({ message: "Progress must be a number between 0 and 100" });
    }
    
    try {
      const updatedEnrollment = await storage.updateEnrollmentProgress(enrollmentId, progress);
      res.json(updatedEnrollment);
    } catch (error) {
      res.status(404).json({ message: "Enrollment not found" });
    }
  });

  app.post("/api/lessons/complete", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const validatedData = insertCompletedLessonSchema.parse({
        ...req.body,
        userId: req.user!.id,
        completedAt: new Date()
      });
      
      const completedLesson = await storage.completeLesson(validatedData);
      res.status(201).json(completedLesson);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Achievement routes
  app.get("/api/achievements", async (req, res) => {
    const achievements = await storage.getAchievements();
    res.json(achievements);
  });

  app.get("/api/user/achievements", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const userAchievements = await storage.getUserAchievements(req.user!.id);
    
    // Get achievement details for each user achievement
    const achievementsWithDetails = await Promise.all(userAchievements.map(async (ua) => {
      const achievement = (await storage.getAchievements()).find(a => a.id === ua.achievementId);
      return { ...ua, achievement };
    }));
    
    res.json(achievementsWithDetails);
  });

  // User profile update
  app.patch("/api/user/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Only allow updating certain fields
    const allowedFields = ['fullName', 'phone', 'profileImage'];
    const updates: Partial<typeof req.user> = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field as keyof typeof updates] = req.body[field];
      }
    });
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }
    
    try {
      const updatedUser = await storage.updateUser(req.user!.id, updates);
      
      // Don't send password to client
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Forum routes
  // Get forum topics for a course
  app.get("/api/courses/:courseId/forum", async (req, res) => {
    const courseId = parseInt(req.params.courseId);
    
    try {
      const topics = await storage.getForumTopics(courseId);
      
      // Get user info for each topic
      const topicsWithUser = await Promise.all(topics.map(async (topic) => {
        const user = await storage.getUser(topic.userId);
        if (!user) return topic;
        
        const { password, ...userWithoutPassword } = user;
        return { ...topic, user: userWithoutPassword };
      }));
      
      res.json(topicsWithUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch forum topics" });
    }
  });

  // Get specific forum topic with replies
  app.get("/api/forum/topics/:id", async (req, res) => {
    const topicId = parseInt(req.params.id);
    
    try {
      const topic = await storage.getForumTopic(topicId);
      
      if (!topic) {
        return res.status(404).json({ message: "Forum topic not found" });
      }
      
      // Get user info for topic
      const topicUser = await storage.getUser(topic.userId);
      const { password: topicUserPassword, ...topicUserWithoutPassword } = topicUser || {};
      
      // Get replies for topic
      const replies = await storage.getForumReplies(topicId);
      
      // Get user info for each reply
      const repliesWithUser = await Promise.all(replies.map(async (reply) => {
        const user = await storage.getUser(reply.userId);
        if (!user) return reply;
        
        const { password, ...userWithoutPassword } = user;
        return { ...reply, user: userWithoutPassword };
      }));
      
      res.json({
        ...topic,
        user: topicUserWithoutPassword,
        replies: repliesWithUser
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch forum topic" });
    }
  });

  // Create a new forum topic
  app.post("/api/courses/:courseId/forum", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const courseId = parseInt(req.params.courseId);
    
    try {
      const validatedData = insertForumTopicSchema.parse({
        ...req.body,
        userId: req.user!.id,
        courseId
      });
      
      const topic = await storage.createForumTopic(validatedData);
      
      // Include user information without password
      const { password, ...userWithoutPassword } = req.user!;
      
      res.status(201).json({
        ...topic,
        user: userWithoutPassword
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid topic data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create forum topic" });
    }
  });

  // Pin/unpin a forum topic
  app.patch("/api/forum/topics/:id/pin", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const topicId = parseInt(req.params.id);
    const isPinned = req.body.isPinned === true;
    
    try {
      const updatedTopic = await storage.pinForumTopic(topicId, isPinned);
      res.json(updatedTopic);
    } catch (error) {
      res.status(404).json({ message: "Forum topic not found" });
    }
  });

  // Create a reply to a forum topic
  app.post("/api/forum/topics/:id/replies", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const topicId = parseInt(req.params.id);
    
    try {
      // Make sure the topic exists
      const topic = await storage.getForumTopic(topicId);
      if (!topic) {
        return res.status(404).json({ message: "Forum topic not found" });
      }
      
      const validatedData = insertForumReplySchema.parse({
        ...req.body,
        userId: req.user!.id,
        topicId
      });
      
      const reply = await storage.createForumReply(validatedData);
      
      // Include user information without password
      const { password, ...userWithoutPassword } = req.user!;
      
      res.status(201).json({
        ...reply,
        user: userWithoutPassword
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reply data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create forum reply" });
    }
  });

  // Mark a reply as a solution
  app.patch("/api/forum/replies/:id/solution", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const replyId = parseInt(req.params.id);
    const isSolution = req.body.isSolution === true;
    
    try {
      const updatedReply = await storage.markReplyAsSolution(replyId, isSolution);
      res.json(updatedReply);
    } catch (error) {
      res.status(404).json({ message: "Forum reply not found" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
