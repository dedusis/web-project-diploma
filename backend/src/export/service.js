// src/export/service.js
import Theses from '../theses/model.js';
import { Parser } from 'json2csv';

export const getAllTheses = async (professorId) => {
  const theses = await Theses.find({ professor: professorId })
    .select('-__v -nimertis_link -notes -readyForActivation') // αφαιρεί άχρηστα πεδία
    .populate('student', 'name surname student_number email')
    .populate('committee.professor', 'name surname email')
    .lean()
    .exec();

  return theses.map(t => ({
    id: t._id.toString(),
    title: t.title,
    description: t.description,
    status: t.status,
    ap_number: t.ap_number || '',
    ap_year: t.ap_year || '',
    student_name: t.student?.name || '',
    student_surname: t.student?.surname || '',
    student_number: t.student?.student_number || '',
    student_email: t.student?.email || '',
    committee: Array.isArray(t.committee)
      ? t.committee
          .map(c => `${c.professor?.name || ''} ${c.professor?.surname || ''}`.trim())
          .filter(Boolean)
          .join('; ')
      : '',
    assignedDate: t.assignedDate || '',
    examDate: t.examDate || '',
    examMode: t.examMode || '',
    examLocation: t.examLocation || '',
    finalGrade: t.finalGrade ?? ''
  }));
};


export const exportTheses = async (format = 'json', professorId ) => {
  const data = await getAllTheses(professorId);

  if (format === 'csv') {
    const parser = new Parser();
    const csv = parser.parse(data);
    return { content: csv, contentType: 'text/csv', filename: 'theses.csv' };
  } else {
    const jsonString = JSON.stringify(data, null, 2);
    return { content: jsonString, contentType: 'application/json', filename: 'theses.json' };
  }
};
