import announcementService from "./service.js";
import { js2xml } from "xml-js";

const createAnnouncementController = async (req, res) => {
  try {
    const professorId = req.user.id || req.user._id;
    const { thesisId, text } = req.body;

    if (!thesisId) {
      return res.status(400).json({ error: "Απαιτείται το ID της διπλωματικής" });
    }

    const announcement = await announcementService.createAnnouncement(
      professorId,
      thesisId,
      text
    );

    return res.status(201).json(announcement);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const announcementsFeedController = async (req, res) => {
  try {
    const { start, end, format } = req.query;

    const announcements = await announcementService.getAnnouncementsFeed({
      start,
      end
    });

    if (format === "xml") {
      const xml = js2xml({ announcements }, { compact: true, spaces: 2 });
      res.set("Content-Type", "application/xml");
      return res.send(xml);
    }

    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default {
  createAnnouncementController,
  announcementsFeedController
};
