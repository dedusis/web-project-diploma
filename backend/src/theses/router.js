import express from 'express';
import thesesController from './controller.js';
import { authenticateToken, authorizeRoles } from '../auth/middleware.js';
import { exportThesesController } from '../export/controller.js';
import multer from 'multer';
import path from "path";
const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // εδώ πάνε όλα τα αρχεία
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // π.χ. .pdf
    const unique = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + "-" + unique + ext);
  },
});

const upload = multer({ storage });
router.get(
  '/available',
  authenticateToken,
  authorizeRoles("professor"),
  thesesController.showProfessorAvailableThesesController
);
//export csv or json theses
router.get(
  '/export',
  authenticateToken,
  authorizeRoles('secretary', 'professor'),
  exportThesesController
);

router.get(
  "/professor/invitations",
  authenticateToken,
  authorizeRoles("professor"),
  thesesController.showProfessorInvitationsController
);
// Create theses (professor ή secretary)
router.post(
  '/',
  authenticateToken,
  authorizeRoles('professor', 'secretary'),
  upload.single("pdfFile"),
  thesesController.createThesesController
);

// Get all theses (logged in users)
router.get(
  '/all',
  authenticateToken,
  thesesController.getAllThesesController
);

// Get theses status = active or status = under_review
router.get(
  "/",
  authenticateToken,
  authorizeRoles("secretary"),
  thesesController.getActiveAndUnderReviewController
);

// Show logged in professor theses
router.get(
  '/professor/me', 
  authenticateToken, 
  authorizeRoles('professor','secretary'), 
  thesesController.showProfessorThesesController
);



// Get student myThesis
router.get(
  "/student/me",
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
  upload.single("pdfFile"),
  thesesController.updateThesesController
);

// Delete theses (professor ή secretary)
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('professor', 'secretary'),
  thesesController.deleteThesesController
);

// Assign thesis to student (professor ή secretary)
router.post(
  '/:id/assign',
  authenticateToken,
  authorizeRoles('professor','secretary'),
  thesesController.assignThesesController 
);

// Secretary actions
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

// Student sends invitation
router.patch(
  "/me/invite",
  authenticateToken,
  authorizeRoles("student"),
  thesesController.inviteProfessorsController
);

// Professor responds
router.patch(
  "/:id/respond",
  authenticateToken,
  authorizeRoles("professor"),
  thesesController.respondInvitationController
);

// Student uploads draft
router.patch(
  "/me/draft",
  authenticateToken,
  authorizeRoles("student"),
  upload.single("draftFile"),
  thesesController.uploadDraftController
);

router.get(
  "/:id/draft",
  authenticateToken,
  authorizeRoles("professor"),
  thesesController.getDraftController
);


// Student sets exam details
router.patch(
  "/me/exam",
  authenticateToken,
  authorizeRoles("student"),
  thesesController.setExamDetailsController
);

// Professor opens grading
router.patch(
  "/:id/open-grading",
  authenticateToken,
  authorizeRoles("professor"),
  thesesController.openGradingController
);

// Professor sets grade
router.patch(
  "/:id/grade",
  authenticateToken,
  authorizeRoles("professor"),
  thesesController.setGradeController
);

// Get grades
router.get(
  "/:id/grades",
  authenticateToken,
  authorizeRoles("professor"),
  thesesController.getGradesController
);

// Student praktiko (HTML)
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

// View completed thesis info + exam record
router.get(
  "/:id/completed",
  authenticateToken,
  authorizeRoles("student", "professor", "secretary"),
  thesesController.getCompletedThesisController
);

router.get(
  '/professor/:id',
  authenticateToken, 
  authorizeRoles('professor','secretary'), 
  thesesController.showThesesDetailsController
);

router.get(
  '/:id/committee',
  authenticateToken,
  authorizeRoles('professor','secretary'),
  thesesController.getInvitedProfessorsController
);

router.patch(
  '/:id/unassign',
  authenticateToken,
  authorizeRoles('professor','secretary'),
  thesesController.unassignThesisFromStudent
);

router.patch(
  "/:id/cancel-by-professor",
  authenticateToken,
  authorizeRoles("professor"),
  thesesController.cancelThesesByProfessorcontroller
);

router.patch(
  "/:id/under-review",
  authenticateToken,
  authorizeRoles("professor"),
  thesesController.changeToUnderReviewcontroller
);

router.post(
  '/:id/notes',
  authenticateToken,
  authorizeRoles('professor'),
  thesesController.addNotesController
);

router.get(
  '/:id/notes',
  authenticateToken,
  authorizeRoles('professor'),
  thesesController.viewMyNotes
);

export default router;
