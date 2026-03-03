'use strict';

const { validationResult } = require('express-validator');
const Vehicle = require('../models/Vehicle');
const Employee = require('../models/Employee');

exports.registerVehicle = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const vehicle = await Vehicle.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
};

exports.assignVehicle = async (req, res, next) => {
  try {
    const { vehicleId, employeeId, purpose, mileageStart } = req.body;

    const [vehicle, employee] = await Promise.all([
      Vehicle.findById(vehicleId),
      Employee.findById(employeeId),
    ]);

    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    if (vehicle.status === 'assigned') {
      return res.status(400).json({ success: false, message: 'Vehicle already assigned' });
    }
    if (vehicle.status === 'maintenance') {
      return res.status(400).json({ success: false, message: 'Vehicle is under maintenance' });
    }

    vehicle.assignedTo = employeeId;
    vehicle.status = 'assigned';
    vehicle.assignments.push({ employee: employeeId, purpose, mileageStart });
    vehicle.updatedBy = req.user._id;
    await vehicle.save();

    res.json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
};

exports.completeAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { mileageEnd } = req.body;

    // id here is the vehicle _id
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

    const lastAssignment = vehicle.assignments[vehicle.assignments.length - 1];
    if (!lastAssignment || lastAssignment.returnedAt) {
      return res.status(400).json({ success: false, message: 'No active assignment found' });
    }

    lastAssignment.returnedAt = new Date();
    lastAssignment.mileageEnd = mileageEnd;
    if (mileageEnd) vehicle.currentMileage = mileageEnd;

    vehicle.assignedTo = null;
    vehicle.status = 'available';
    vehicle.updatedBy = req.user._id;
    await vehicle.save();

    res.json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
};

exports.addMaintenance = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

    vehicle.maintenanceRecords.push(req.body);
    vehicle.status = 'maintenance';
    vehicle.updatedBy = req.user._id;

    // Recalculate health score based on maintenance count
    const score = Math.max(100 - vehicle.maintenanceRecords.length * 2, 0);
    vehicle.healthScore = score;

    await vehicle.save();
    res.json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
};

exports.getVehicleHealth = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('assignedTo', 'firstName lastName');
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

    const lastMaintenance = vehicle.maintenanceRecords.sort((a, b) => b.date - a.date)[0];
    const accidentCount = vehicle.accidents.length;
    const insuranceExpiry = vehicle.insurance?.expiryDate;
    const roadTaxExpiry = vehicle.roadTax?.expiryDate;

    res.json({
      success: true,
      data: {
        vehicle: vehicle.registrationNumber,
        healthScore: vehicle.healthScore,
        status: vehicle.status,
        lastMaintenance: lastMaintenance?.date || null,
        accidentCount,
        insuranceValid: insuranceExpiry ? new Date() < new Date(insuranceExpiry) : false,
        roadTaxValid: roadTaxExpiry ? new Date() < new Date(roadTaxExpiry) : false,
        currentMileage: vehicle.currentMileage,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getFleetReport = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find().populate('assignedTo', 'firstName lastName');
    const summary = {
      total: vehicles.length,
      available: vehicles.filter((v) => v.status === 'available').length,
      assigned: vehicles.filter((v) => v.status === 'assigned').length,
      maintenance: vehicles.filter((v) => v.status === 'maintenance').length,
      retired: vehicles.filter((v) => v.status === 'retired').length,
      avgHealthScore:
        vehicles.length > 0
          ? Math.round(vehicles.reduce((s, v) => s + v.healthScore, 0) / vehicles.length)
          : 0,
    };

    res.json({ success: true, data: { summary, vehicles } });
  } catch (err) {
    next(err);
  }
};
