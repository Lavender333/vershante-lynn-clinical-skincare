import { Router, Request, Response } from "express";
import prisma from "../db.js";
import { generateClinicalInsights } from "../../services/skinAnalysisService.js";

const router = Router();

// Create Assessment
router.post("/", async (req: Request, res: Response) => {
  try {
    const assessmentData = req.body;
    
    if (!assessmentData.fullName || !assessmentData.email) {
      return res.status(400).json({ 
        success: false, 
        error: "Full name and email are required." 
      });
    }

    // Generate AI clinical insights
    const clinicalInsights = await generateClinicalInsights(assessmentData);

    const assessment = await prisma.assessment.create({
      data: {
        fullName: assessmentData.fullName,
        email: assessmentData.email,
        age: assessmentData.age,
        concerns: assessmentData.concerns || [],
        sensitivityLevel: assessmentData.sensitivityLevel,
        hormonalStage: assessmentData.hormonalStage,
        stressLevel: assessmentData.stressLevel,
        sleepQuality: assessmentData.sleepQuality,
        waterIntake: assessmentData.waterIntake,
        dietaryProfile: assessmentData.dietaryProfile || [],
        activityLevel: assessmentData.activityLevel,
        caffeineIntake: assessmentData.caffeineIntake,
        currentRoutine: assessmentData.currentRoutine,
        professionalHistory: assessmentData.professionalHistory,
        goals: assessmentData.goals,
        investmentPreference: assessmentData.investmentPreference,
        primaryIntent: assessmentData.primaryIntent,
        clinicalFocus: assessmentData.clinicalFocus || [],
        stepFeedback: assessmentData.stepFeedback || {},
        clinicalInsights: clinicalInsights,
        userId: assessmentData.userId || null,
        status: "pending"
      }
    });

    res.status(201).json({ 
      success: true, 
      data: assessment 
    });
  } catch (error: any) {
    console.error("Assessment creation error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to create assessment." 
    });
  }
});

// Get Assessment by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: { consultationSlot: true }
    });

    if (!assessment) {
      return res.status(404).json({ 
        success: false, 
        error: "Assessment not found." 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: assessment 
    });
  } catch (error: any) {
    console.error("Assessment fetch error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to fetch assessment." 
    });
  }
});

// Update Assessment (book consultation)
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { consultationSlot, status, professionalNotes } = req.body;

    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
    }
    
    if (professionalNotes) {
      updateData.professionalNotes = professionalNotes;
    }

    const assessment = await prisma.assessment.update({
      where: { id },
      data: updateData,
      include: { consultationSlot: true }
    });

    // If consultation slot is provided, create/update it
    if (consultationSlot) {
      await prisma.consultationSlot.upsert({
        where: { assessmentId: id },
        update: {
          date: consultationSlot.date,
          time: consultationSlot.time,
          type: consultationSlot.type || "Virtual"
        },
        create: {
          assessmentId: id,
          date: consultationSlot.date,
          time: consultationSlot.time,
          type: consultationSlot.type || "Virtual"
        }
      });
    }

    const updatedAssessment = await prisma.assessment.findUnique({
      where: { id },
      include: { consultationSlot: true }
    });

    res.status(200).json({ 
      success: true, 
      data: updatedAssessment 
    });
  } catch (error: any) {
    console.error("Assessment update error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to update assessment." 
    });
  }
});

export default router;
