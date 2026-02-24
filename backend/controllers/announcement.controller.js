/**
 * Announcement Controller
 * Handles announcements and notifications
 */

const { Op } = require("sequelize");
const { Announcement, User, Student, Subject } = require("../models");

exports.createAnnouncement = async (req, res) => {
    try {
        const { title, content, target_audience, priority, subject_id } = req.body;
        const institute_id = req.user.institute_id;

        const announcement = await Announcement.create({
            institute_id,
            title,
            content,
            target_audience: target_audience || 'all',
            priority: priority || "normal",
            created_by: req.user.id,
            subject_id: subject_id || null,
        });

        res.status(201).json({
            success: true,
            message: "Announcement created successfully",
            data: announcement,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getAllAnnouncements = async (req, res) => {
    try {
        const { page = 1, limit = 10, target_audience } = req.query;
        const institute_id = req.user.institute_id;

        const offset = (page - 1) * limit;
        const whereClause = { institute_id };

        if (target_audience) {
            whereClause.target_audience = target_audience;
        }

        if (req.user.role === 'faculty') {
            // Faculty can only see announcements they created
            whereClause.created_by = req.user.id;
        } else if (req.user.role === 'student') {
            // Student sees generic announcements or announcements for their subjects
            const student = await Student.findOne({
                where: { user_id: req.user.id },
                include: [{ model: Subject }]
            });
            const subjectIds = student && student.Subjects ? student.Subjects.map(s => s.id) : [];

            whereClause.subject_id = {
                [Op.or]: [null, ...subjectIds]
            };
        }

        const { count, rows } = await Announcement.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: User,
                    as: "creator",
                    attributes: ["id", "name", "role"],
                },
                {
                    model: Subject,
                    attributes: ["id", "name"]
                }
            ],
        });

        res.status(200).json({
            success: true,
            message: "Announcements retrieved successfully",
            data: {
                announcements: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit),
                },
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const institute_id = req.user.institute_id;

        const announcement = await Announcement.findOne({
            where: { id, institute_id },
        });

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: "Announcement not found",
            });
        }

        await announcement.destroy();

        res.status(200).json({
            success: true,
            message: "Announcement deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = exports;
