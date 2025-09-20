import Announcement from "./model.js";
import Theses from "../theses/model.js";

const createAnnouncement = async (professorId, thesisId, customText) => {
  const thesis = await Theses.findById(thesisId)
    .populate("student", "name surname")
    .populate("professor", "name surname");

  if (!thesis) throw new Error("Thesis not found");

  // μόνο ο supervisor μπορεί να φτιάξει ανακοίνωση
  if (thesis.professor._id.toString() !== professorId.toString()) {
    throw new Error("Mόνο ο επιβλέπων καθηγητής μπορεί να παράξει ανακοίνωση");
  }

  // έλεγχος αν ο φοιτητής έχει συμπληρώσει exam info
  if (!thesis.examDate || !thesis.examMode || !thesis.examLocation) {
    throw new Error("Ο φοιτητής δεν έχει συμπληρώσει τα στοιχεία εξέτασης");
  }

  if (!customText || customText.trim().length === 0) {
    throw new Error("Πρέπει να γράψετε κείμενο ανακοίνωσης");
  }

  // Αν υπάρχει ήδη announcement -> update αντί για δεύτερο
  let announcement = await Announcement.findOne({ thesis: thesis._id });
  if (announcement) {
    announcement.text = customText.trim();
    announcement.professor = professorId;
    await announcement.save();
    return announcement;
  }

  // Αλλιώς φτιάχνουμε καινούργιο
  announcement = new Announcement({
    thesis: thesis._id,
    professor: professorId,
    text: customText.trim()
  });

  return announcement.save();
};


async function getAnnouncementsFeed({ start, end }) {
  const filter = {};
  if (start || end) {
    filter.createdAt = {};
    if (start) filter.createdAt.$gte = new Date(start);
    if (end) filter.createdAt.$lte = new Date(end);
  }

  return Announcement.find(filter)
    .populate("thesis", "title examDate examLocation examMode")
    .populate("professor", "name surname department")
    .sort({ createdAt: -1 });
}
export default{
  getAnnouncementsFeed,
  createAnnouncement
}