import { Router, Request, Response } from "express";
import prisma from "../db.js";

const router = Router();

// Default operating hours
const DEFAULT_OPERATING_HOURS = {
  Monday: { open: "09:00", close: "17:00", closed: false },
  Tuesday: { open: "09:00", close: "17:00", closed: false },
  Wednesday: { open: "09:00", close: "17:00", closed: false },
  Thursday: { open: "09:00", close: "17:00", closed: false },
  Friday: { open: "09:00", close: "17:00", closed: false },
  Saturday: { open: "10:00", close: "14:00", closed: false },
  Sunday: { open: "00:00", close: "00:00", closed: true }
};

// Get Operating Hours
router.get("/", async (req: Request, res: Response) => {
  try {
    let operatingHours = await prisma.operatingHours.findUnique({
      where: { id: "default" }
    });

    if (!operatingHours) {
      operatingHours = await prisma.operatingHours.create({
        data: {
          id: "default",
          dayConfig: DEFAULT_OPERATING_HOURS
        }
      });
    }

    res.status(200).json({ 
      success: true, 
      data: {
        id: operatingHours.id,
        days: operatingHours.dayConfig
      }
    });
  } catch (error: any) {
    console.error("Operating hours fetch error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to fetch operating hours." 
    });
  }
});

// Update Operating Hours (admin only)
router.patch("/", async (req: Request, res: Response) => {
  try {
    const { days } = req.body;

    if (!days) {
      return res.status(400).json({ 
        success: false, 
        error: "Days configuration is required." 
      });
    }

    const operatingHours = await prisma.operatingHours.update({
      where: { id: "default" },
      data: { dayConfig: days }
    });

    res.status(200).json({ 
      success: true, 
      data: {
        id: operatingHours.id,
        days: operatingHours.dayConfig
      }
    });
  } catch (error: any) {
    console.error("Operating hours update error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to update operating hours." 
    });
  }
});

export default router;
