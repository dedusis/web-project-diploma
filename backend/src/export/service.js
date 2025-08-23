// src/export/service.js
import Theses from '../theses/model.js';
import { Parser } from 'json2csv';

export const getAllTheses = async () => {
  const theses = await Theses.find()
    .populate('student', 'name surname student_number email')
    .populate('committee', 'name surname email')
    .lean()
    .exec();

  return theses.map(t => ({
    id: t._id.toString(),
    title: t.title,
    description: t.description,
    status: t.status,
    student_name: t.student?.name || '',
    student_surname: t.student?.surname || '',
    student_number: t.student?.student_number || '',
    student_email: t.student?.email || '',
    committee: t.committee?.map(c => `${c.name} ${c.surname}`).join('; ') || ''
  }));
};

export const exportTheses = async (format = 'json') => {
  const data = await getAllTheses();

  if (format === 'csv') {
    const parser = new Parser();
    const csv = parser.parse(data);
    return { content: csv, contentType: 'text/csv', filename: 'theses.csv' };
  } else {
    return { content: data, contentType: 'application/json' };
  }
};
