import express from 'express';
import thesesController from './controller.js';
import { authenticateToken, authorizeRoles } from '../auth/middleware.js';

const router = express.Router();

// Create theses (professor ή secretary)
router.post(
  '/',
  authenticateToken,
  authorizeRoles('professor', 'secretary'),
  thesesController.createThesesController
);

// Get all theses (logged in users)
router.get(
  '/',
  authenticateToken,
  thesesController.getAllThesesController
);

//get mythesis
router.get(
  "/me",
  authenticateToken,
  authorizeRoles("student"),
  thesesController.getMyThesisController
);

// Get theses by id (logged in users)
router.get(
  '/:id',
  authenticateToken,
  thesesController.getThesesByIdController
);

// Update theses (professor ή secretary)
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('professor', 'secretary'),
  thesesController.updateThesesController
);

// Delete theses (professor ή secretary)
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('professor', 'secretary'),
  thesesController.deleteThesesController
);

router.post(
  '/:id/assign',
  authenticateToken,
  authorizeRoles('professor','secretary'),
  thesesController.assignThesesController // Assign thesis to student (professor ή secretary)
);

//secr actions
router.patch(
  "/:id/activate",
  authenticateToken,
  authorizeRoles("secretary"),
  thesesController.activateThesisController
);
router.patch(
  "/:id/cancel",
  authenticateToken,
  authorizeRoles("secretary"),
  thesesController.cancelThesisController
);
router.patch(
  "/:id/complete",
  authenticateToken,
  authorizeRoles("secretary"),
  thesesController.completeThesisController
);

//student sends invitation
router.patch(
  "/me/invite",
  authenticateToken,
  authorizeRoles("student"),
  thesesController.inviteProfessorsController
);

//prof respond
router.patch(
  "/:id/respond",
  authenticateToken,
  authorizeRoles("professor"),
  thesesController.respondInvitationController
);

router.patch(
  "/me/draft",
  authenticateToken,
  authorizeRoles("student"),
  thesesController.uploadDraftController
);

// Student sets exam details
router.patch(
  "/me/exam",
  authenticateToken,
  authorizeRoles("student"),
  thesesController.setExamDetailsController
);

// Professor sets grade
router.patch(
  "/:id/open-grading",
  authenticateToken,
  authorizeRoles("professor"),
  thesesController.openGradingController
);

//prof adds grade
router.patch(
  "/:id/grade",
  authenticateToken,
  authorizeRoles("professor"),
  thesesController.setGradeController
);

//get grades
router.get("/:id/grades",
  authenticateToken,
  authorizeRoles("professor"),
  thesesController.getGradesController
);

//students praktiko (HTML)
router.get(
  "/me/praktiko",
  authenticateToken,
  authorizeRoles("student"),
  thesesController.getPraktikoController
);

// Student sets Nimertis link
router.patch(
  "/me/nimertis",
  authenticateToken,
  authorizeRoles("student"),
  thesesController.setNimertisLinkController
);

export default router;
