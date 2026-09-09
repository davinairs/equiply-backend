const borrowRequestService = require("../services/borrowrequest.service");

async function getAllBorrowRequests(req, res, next) {
  try {
    const borrowRequests = await borrowRequestService.getAllBorrowRequests(
      req.user,
    );
    res.json(borrowRequests);
  } catch (error) {
    next(error);
  }
}

async function getMyBorrowRequests(req, res, next) {
  try {
    const borrowRequests = await borrowRequestService.getMyBorrowRequests(
      req.user.id,
    );
    res.json(borrowRequests);
  } catch (error) {
    next(error);
  }
}

async function getBorrowRequestById(req, res, next) {
  try {
    const { id } = req.params;
    const borrowRequest = await borrowRequestService.getBorrowRequestById(
      id,
      req.user,
    );
    res.json(borrowRequest);
  } catch (error) {
    next(error);
  }
}

async function createBorrowRequest(req, res, next) {
  try {
    const borrowRequestData = { ...req.body, userId: req.user.id };
    const borrowRequest =
      await borrowRequestService.createBorrowRequest(borrowRequestData);
    res.status(201).json(borrowRequest);
  } catch (error) {
    next(error);
  }
}

async function approveBorrowRequest(req, res, next) {
  try {
    const { id } = req.params;
    const { dueDate } = req.body;
    const borrowRequest = await borrowRequestService.approveBorrowRequest(
      id,
      dueDate,
      req.user,
    );
    res.status(200).json({
      message: "Borrow request approved successfully",
      data: borrowRequest,
    });
  } catch (error) {
    next(error);
  }
}

async function rejectBorrowRequest(req, res, next) {
  try {
    const { id } = req.params;
    const borrowRequest = await borrowRequestService.rejectBorrowRequest(
      id,
      req.user,
    );
    res.status(200).json({
      message: "Borrow request rejected successfully",
      data: borrowRequest,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteBorrowRequest(req, res, next) {
  try {
    const { id } = req.params;
    await borrowRequestService.deleteBorrowRequest(id, req.user);
    res.status(200).json({ message: "Borrow request deleted successfully" });
  } catch (error) {
    next(error);
  }
}

async function returnBorrowRequest(req, res, next) {
  try {
    const { id } = req.params;
    const borrowRequest = await borrowRequestService.returnBorrowRequest(
      id,
      req.user,
    );
    res.status(200).json({
      message: "Equipment returned successfully",
      data: borrowRequest,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllBorrowRequests,
  getMyBorrowRequests,
  getBorrowRequestById,
  createBorrowRequest,
  approveBorrowRequest,
  rejectBorrowRequest,
  deleteBorrowRequest,
  returnBorrowRequest,
};
