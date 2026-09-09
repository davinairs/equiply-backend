const borrowRequestModel = require("../models/borrowrequest.model");
const userModel = require("../models/user.model");
const equipmentModel = require("../models/equipment.model");
const notificationModel = require("../models/notification.model");
const AppError = require("../untils/app.error");

function withOverdueFlag(borrowRequest) {
  if (!borrowRequest) return borrowRequest;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const isOverdue =
    borrowRequest.borrowStatus === "approved" &&
    borrowRequest.dueDate &&
    borrowRequest.dueDate < todayStr;

  return { ...borrowRequest, isOverdue };
}

function assertCompanyAccess(currentUser, resourceCompanyId) {
  if (
    currentUser.role === "admin" &&
    currentUser.companyId !== resourceCompanyId
  ) {
    throw new AppError("Forbidden. You can only manage borrow requests in your own company.", 403);
  }
}

async function checkAndSendReminders() {
  const allRequests = await borrowRequestModel.getAllBorrowRequestsAcrossCompanies();

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const tomorrow = new Date(now.getTime() + 86400000);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

  const approvedRequests = allRequests.filter(
    (r) => r.borrowStatus === "approved" && r.dueDate,
  );

  for (const r of approvedRequests) {
    if (r.dueDate === tomorrowStr) {
      await notifyOnce(
        r.userId,
        r.id,
        "Return Reminder (D-1)",
        `Tomorrow is the due date to return ${r.equipmentName}. Please return it on time.`,
      );
    }

    if (r.dueDate === todayStr) {
      await notifyOnce(
        r.userId,
        r.id,
        "Due Today",
        `Today is the final deadline to return ${r.equipmentName}.`,
      );
    }

    if (r.dueDate < todayStr) {
      const admins = await userModel.getAllAdmins(r.companyId);
      for (const admin of admins) {
        await notifyOnce(
          admin.id,
          r.id,
          "Action Required",
          `${r.equipmentName} (borrowed by ${r.fullName}) has exceeded the return deadline.`,
        );
      }
    }
  }
}

async function notifyOnce(userId, borrowRequestId, title, message) {
  const existing = await notificationModel.checkExisting(
    userId,
    borrowRequestId,
    title,
  );
  if (existing) return;
  await notificationModel.createNotification({
    userId,
    borrowRequestId,
    title,
    message,
  });
}

async function getAllBorrowRequests(currentUser) {
  const rows = await borrowRequestModel.getAllBorrowRequests(
    currentUser.companyId,
  );

  return rows.map(withOverdueFlag);
}

async function getMyBorrowRequests(userId) {
  const rows = await borrowRequestModel.getBorrowRequestsByUser(userId);
  return rows.map(withOverdueFlag);
}

async function getBorrowRequestById(id, currentUser) {
  const borrowRequest = await borrowRequestModel.getBorrowRequestById(id);

  if (!borrowRequest) {
    throw new AppError("Borrow request not found", 404);
  }

  const isOwner = borrowRequest.userId === currentUser.id;
  const isSameCompanyAdmin =
    currentUser.role === "admin" &&
    currentUser.companyId === borrowRequest.companyId;

  if (!isOwner && !isSameCompanyAdmin) {
    throw new AppError("You are not authorized to access this data", 403);
  }

  return withOverdueFlag(borrowRequest);
}

async function createBorrowRequest(borrowRequestData) {
  const { userId, equipmentId, borrowDate } = borrowRequestData;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  if (borrowDate < todayStr) {
    throw new AppError("Borrow date cannot be in the past", 400);
  }

  const user = await userModel.getUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  if (user.status !== "active") {
    throw new AppError("User is inactive", 403);
  }

  const equipment = await equipmentModel.getEquipmentById(equipmentId);
  if (!equipment) {
    throw new AppError("Equipment not found", 404);
  }

  if (equipment.companyId !== user.companyId) {
    throw new AppError("Equipment not found", 404);
  }

  if (equipment.equipmentStatus !== "available") {
    throw new AppError(`Equipment "${equipment.equipmentName}" is not available`, 409);
  }

  const existingRequests = await borrowRequestModel.getBorrowRequestsByUser(userId);
  const hasPending = existingRequests.some(
    (req) =>
      String(req.equipmentId) === String(equipmentId) &&
      req.borrowStatus === "pending",
  );

  if (hasPending) {
    throw new AppError(
      `You already have a pending request for "${equipment.equipmentName}"`, 400);
  }

  const created = await borrowRequestModel.createBorrowRequest(borrowRequestData);

  await notifyAllAdmins(
    equipment.companyId,
    created.id,
    "New Borrow Request",
    `There is a new borrow request for ${equipment.equipmentName} awaiting approval.`);

  return created;
}

async function approveBorrowRequest(id, dueDate, currentUser) {
  const borrowRequest = await borrowRequestModel.getBorrowRequestById(id);
  if (!borrowRequest) {
    throw new AppError("Borrow request not found", 404);
  }

  assertCompanyAccess(currentUser, borrowRequest.companyId);

  if (borrowRequest.borrowStatus !== "pending") {
    throw new AppError("Borrow request has already been processed", 400);
  }
  if (!dueDate) {
    throw new AppError("Due date is required for approval", 400);
  }
  if (new Date(dueDate) < new Date(borrowRequest.borrowDate)) {
    throw new AppError("Due date cannot be before the borrow date", 400);
  }

  const updated = await borrowRequestModel.updateBorrowRequest(id, {
    dueDate,
    borrowStatus: "approved",
  });

  await equipmentModel.updateEquipmentStatus(
    borrowRequest.equipmentId,
    "borrowed",
  );

  const allRequests = await borrowRequestModel.getAllBorrowRequests(
    borrowRequest.companyId,
  );
  const pendingConflicts = allRequests.filter(
    (r) =>
      String(r.equipmentId) === String(borrowRequest.equipmentId) &&
      r.borrowStatus === "pending" &&
      String(r.id) !== String(id),
  );

  for (const conflictReq of pendingConflicts) {
    await borrowRequestModel.updateBorrowRequest(conflictReq.id, {
      borrowStatus: "rejected",
    });

    await notificationModel.createNotification({
      userId: conflictReq.userId,
      borrowRequestId: conflictReq.id,
      title: "Borrow Request Auto-Rejected",
      message: `Your request to borrow ${borrowRequest.equipmentName} has been automatically rejected because the equipment was allocated to another user.`,
    });
  }

  await notificationModel.createNotification({
    userId: borrowRequest.userId,
    borrowRequestId: id,
    title: "Borrow Request Approved",
    message: `Your request to borrow ${borrowRequest.equipmentName} has been approved. Return deadline: ${dueDate}.`,
  });

  return updated;
}

async function rejectBorrowRequest(id, currentUser) {
  const borrowRequest = await borrowRequestModel.getBorrowRequestById(id);
  if (!borrowRequest) {
    throw new AppError("Borrow request not found", 404);
  }

  assertCompanyAccess(currentUser, borrowRequest.companyId);

  if (borrowRequest.borrowStatus !== "pending") {
    throw new AppError("Borrow request has already been processed", 400);
  }

  const updated = await borrowRequestModel.updateBorrowRequest(id, {
    dueDate: null,
    borrowStatus: "rejected",
  });

  await notificationModel.createNotification({
    userId: borrowRequest.userId,
    borrowRequestId: id,
    title: "Borrow Request Rejected",
    message: `Your request to borrow ${borrowRequest.equipmentName} has been rejected.`
  });

  return updated;
}

async function deleteBorrowRequest(id, currentUser) {
  const borrowRequest = await borrowRequestModel.getBorrowRequestById(id);

  if (!borrowRequest) {
    throw new AppError("Borrow request not found", 404);
  }

  const isOwner = borrowRequest.userId === currentUser.id;
  const isSameCompanyAdmin =
    currentUser.role === "admin" &&
    currentUser.companyId === borrowRequest.companyId;

  if (!isOwner && !isSameCompanyAdmin) {
    throw new AppError("You are not authorized to delete this data", 403);
  }

  const nonDeletableStatuses = ["approved", "returned", "rejected"];
  if (nonDeletableStatuses.includes(borrowRequest.borrowStatus)) {
    throw new AppError("Processed borrow requests cannot be deleted", 400);
  }

  return borrowRequestModel.deleteBorrowRequest(id);
}

async function returnBorrowRequest(id, currentUser) {
  const borrowRequest = await borrowRequestModel.getBorrowRequestById(id);

  if (!borrowRequest) {
    throw new AppError("Borrow request not found", 404);
  }

  assertCompanyAccess(currentUser, borrowRequest.companyId);

  if (borrowRequest.borrowStatus !== "approved") {
    throw new AppError("Equipment is not currently borrowed", 400);
  }

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  if (borrowRequest.borrowDate > todayStr) {
    throw new AppError("Cannot return equipment before its borrow date", 400);
  }

  const updated = await borrowRequestModel.returnBorrowRequest(id);

  await equipmentModel.updateEquipmentStatus(
    borrowRequest.equipmentId,
    "available",
  );

  await notificationModel.createNotification({
    userId: borrowRequest.userId,
    borrowRequestId: id,
    title: "Equipment Returned",
    message: `${borrowRequest.equipmentName} has been marked as returned by the admin.`
  });

  return updated;
}

async function notifyAllAdmins(companyId, borrowRequestId, title, message) {
  const admins = await userModel.getAllAdmins(companyId);
  if (admins.length === 0) return;

  await Promise.all(
    admins.map((admin) =>
      notificationModel.createNotification({
        userId: admin.id,
        borrowRequestId,
        title,
        message,
      }),
    ),
  );
}

module.exports = {
  checkAndSendReminders,
  getAllBorrowRequests,
  getMyBorrowRequests,
  getBorrowRequestById,
  createBorrowRequest,
  approveBorrowRequest,
  rejectBorrowRequest,
  deleteBorrowRequest,
  returnBorrowRequest,
};
