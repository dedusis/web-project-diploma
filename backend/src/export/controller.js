// src/export/controller.js
import * as ThesesService from './service.js';

export const exportThesesController = async (req, res) => {
  try {
    const format = req.query.format || 'json';
    const result = await ThesesService.exportTheses(format);

    if (format === 'csv') {
      res.header('Content-Type', result.contentType);
      res.attachment(result.filename);
      return res.send(result.content);
    } else {
      res.json(result.content);
    }
  } catch (err) {
    console.error('Export theses error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
};
