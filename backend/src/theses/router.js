import express from 'express';
import thesesController from './controller.js';
import { authenticateToken, authorizeRoles } from '../auth/middleware.js';
import { exportThesesController } from '../export/controller.js';

const router = express.Router();

// Create theses (professor ή secretary)
router.post(
  '/',
  authenticateToken,
  authorizeRoles('professor', 'secretary'),
  thesesController.createThesesController
);
//show professor invitations
router.get(
  "/professor/invitations",
  authenticateToken,
  authorizeRoles("professor"),
  thesesController.showProfessorInvitationsController
);
// Get all theses (logged in users)
router.get(
  '/',
  authenticateToken,
  authorizeRoles('secretary'),
  thesesController.getAllThesesController
);

//show logged in professor theses
router.get(
  '/professor/me', 
  authenticateToken, 
  authorizeRoles('professor','secretary'), 
  thesesController.showProfessorThesesController
);

//get student mythesis
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

router.get('/professor/:username/:id',
   authenticateToken, 
   authorizeRoles('professor','secretary'), 
   thesesController.showThesesDetailsController);

router.get(
    '/:id/committee',
    authenticateToken,
    authorizeRoles('professor','secretary'),
    thesesController.getInvitedProfessorsController);

router.patch(
  '/:id/unassign',
  authenticateToken,
  authorizeRoles('professor','secretary'),
  thesesController.unassignThesisFromStudent
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
