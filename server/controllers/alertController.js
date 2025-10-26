import Alert from "../models/alert.js";
import mongoose from "mongoose";

// --- createAlert (no changes) ---
export const createAlert = async (req, res) => {
  try {
    const { title, message, priority } = req.body;
    if (!title || !message || !priority) {
      return res
        .status(400)
        .json({ message: "Title, message, and priority are required." });
    }
    const newAlert = new Alert({ title, message, priority });
    const savedAlert = await newAlert.save();
    res
      .status(201)
      .json({ message: "Alert created successfully!", alert: savedAlert });
  } catch (error) {
    console.error("Error creating alert:", error);
    res.status(500).json({ message: "Server error while creating alert." });
  }
};

// --- getActiveAlerts (no changes) ---
export const getActiveAlerts = async (req, res) => {
  try {
    const activeAlerts = await Alert.find({ status: "active" }).sort({
      createdAt: -1,
    });
    res.status(200).json(activeAlerts);
  } catch (error) {
    console.error("Error fetching active alerts:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching active alerts." });
  }
};

// --- getAllAlerts (no changes) ---
export const getAllAlerts = async (req, res) => {
  try {
    const allAlerts = await Alert.find({}).sort({ createdAt: -1 });
    res.status(200).json(allAlerts);
  } catch (error) {
    console.error("Error fetching all alerts:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching all alerts." });
  }
};

// --- updateAlertStatus (no changes) ---
export const updateAlertStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status || !["active", "inactive"].includes(status)) {
      return res
        .status(400)
        .json({
          message: "Invalid status provided. Must be 'active' or 'inactive'.",
        });
    }
    const alert = await Alert.findByIdAndUpdate(id, { status }, { new: true });
    if (!alert) {
      return res.status(404).json({ message: "Alert not found." });
    }
    res
      .status(200)
      .json({ message: `Alert status updated to '${status}'.`, alert });
  } catch (error) {
    console.error("Error updating alert status:", error);
    res
      .status(500)
      .json({ message: "Server error while updating alert status." });
  }
};

// --- NEW FUNCTION: Update an alert's content ---
export const updateAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, priority } = req.body;

    if (!title || !message || !priority) {
      return res
        .status(400)
        .json({
          message: "Title, message, and priority are required for an update.",
        });
    }

    const updatedAlert = await Alert.findByIdAndUpdate(
      id,
      { title, message, priority },
      { new: true, runValidators: true } // 'new: true' returns the updated document
    );

    if (!updatedAlert) {
      return res.status(404).json({ message: "Alert not found." });
    }

    res
      .status(200)
      .json({
        message: "Alert content updated successfully.",
        alert: updatedAlert,
      });
  } catch (error) {
    console.error("Error updating alert:", error);
    res.status(500).json({ message: "Server error while updating alert." });
  }
};

// --- NEW FUNCTION: Delete an alert ---
export const deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await Alert.findByIdAndDelete(id);

    if (!alert) {
      return res.status(404).json({ message: "Alert not found." });
    }

    res.status(200).json({ message: "Alert deleted permanently." });
  } catch (error) {
    console.error("Error deleting alert:", error);
    res.status(500).json({ message: "Server error while deleting alert." });
  }
};
