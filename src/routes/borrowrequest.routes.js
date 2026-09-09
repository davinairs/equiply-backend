const express = require("express");
const router = express.Router();

const borrowRequestController = require("../controllers/borrowrequest.controller");
const { validateBorrowRequest, validateApproveBorrowRequest } = require("../middlewares/validation/borrowrequest.validation");
const { verifyToken, authorizeRole } = require("../middlewares/auth.middleware");

router.get(
  "/borrow-requests",
  verifyToken,
  authorizeRole("admin"),
  borrowRequestController.getAllBorrowRequests,
);

router.get(
  "/borrow-requests/me",
  verifyToken,
  authorizeRole("user"),
  borrowRequestController.getMyBorrowRequests,
);

router.get(
  "/borrow-requests/:id",
  verifyToken,
  borrowRequestController.getBorrowRequestById,
);

router.post(
  "/borrow-requests",
  verifyToken,
  authorizeRole("user"),
  validateBorrowRequest,
  borrowRequestController.createBorrowRequest,
);

router.delete(
  "/borrow-requests/:id",
  verifyToken,
  borrowRequestController.deleteBorrowRequest,
);

router.patch(
  "/borrow-requests/:id/approve",
  verifyToken,
  authorizeRole("admin"),
  validateApproveBorrowRequest,
  borrowRequestController.approveBorrowRequest,
);

router.patch(
  "/borrow-requests/:id/reject",
  verifyToken,
  authorizeRole("admin"),
  borrowRequestController.rejectBorrowRequest,
);

router.patch(
  "/borrow-requests/:id/return",
  verifyToken,
  authorizeRole("admin"),
  borrowRequestController.returnBorrowRequest,
);

module.exports = router;
