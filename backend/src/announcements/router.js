import express from "express";
import announcementController from "./controller.js";
import { authenticateToken, authorizeRoles } from "../auth/middleware.js";

const router = express.Router();

router.post(
  '/',
  authenticateToken,
  authorizeRoles("professor"),
  announcementController.createAnnouncementController
);

router.get("/", announcementController.announcementsFeedController);

export default router;
