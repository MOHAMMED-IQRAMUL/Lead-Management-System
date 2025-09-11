import mongoose from 'mongoose';
import Lead from '../models/Lead.model.js';

/**
 * Helper to parse query params and build Mongo filter object
 * Supported query params:
 *  - email_equals, email_contains
 *  - company_equals, company_contains
 *  - city_equals, city_contains
 *  - status_equals, status_in (comma separated)
 *  - source_equals, source_in (comma separated)
 *  - score_equals, score_gt, score_lt, score_between (a,b)
 *  - lead_value_equals, lead_value_gt, lead_value_lt, lead_value_between
 *  - created_at_on, created_at_before, created_at_after, created_at_between (YYYY-MM-DD)
 *  - last_activity_at_on/before/after/between
 *  - is_qualified_equals=true|false
 */

function buildFiltersFromQuery(q) {
  const where = {};

  const addString = (field, key) => {
    if (q[`${key}_equals`]) where[field] = q[`${key}_equals`];
    if (q[`${key}_contains`]) where[field] = { $regex: q[`${key}_contains`], $options: 'i' };
  };

  addString('email', 'email');
  addString('company', 'company');
  addString('city', 'city');

  const addEnum = (field, key) => {
    if (q[`${key}_equals`]) where[field] = q[`${key}_equals`];
    if (q[`${key}_in`]) where[field] = { $in: String(q[`${key}_in`]).split(',').map(s => s.trim()) };
  };

  addEnum('status', 'status');
  addEnum('source', 'source');

  const addNumber = (field, key) => {
    if (q[`${key}_equals`]) where[field] = Number(q[`${key}_equals`]);
    const g = {};
    if (q[`${key}_gt`] !== undefined) g.$gt = Number(q[`${key}_gt`]);
    if (q[`${key}_lt`] !== undefined) g.$lt = Number(q[`${key}_lt`]);
    if (q[`${key}_between`]) {
      const parts = String(q[`${key}_between`]).split(',').map(p => Number(p));
      if (parts.length === 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
        g.$gte = parts[0];
        g.$lte = parts[1];
      }
    }
    if (Object.keys(g).length) where[field] = g;
  };

  addNumber('score', 'score');
  addNumber('lead_value', 'lead_value');

  const addDate = (field, key) => {
    if (q[`${key}_on`]) {
      const d = new Date(q[`${key}_on`]);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      where[field] = { $gte: d, $lt: next };
    }
    const g = {};
    if (q[`${key}_after`]) g.$gt = new Date(q[`${key}_after`]);
    if (q[`${key}_before`]) g.$lt = new Date(q[`${key}_before`]);
    if (q[`${key}_between`]) {
      const parts = String(q[`${key}_between`]).split(',');
      if (parts.length === 2) {
        g.$gte = new Date(parts[0]);
        const d2 = new Date(parts[1]);
        d2.setHours(23, 59, 59, 999);
        g.$lte = d2;
      }
    }
    if (Object.keys(g).length) {
      if (where[field]) {
        where[field] = { ...where[field], ...g };
      } else {
        where[field] = g;
      }
    }
  };

  addDate('created_at', 'created_at');
  addDate('last_activity_at', 'last_activity_at');

  // boolean is_qualified_equals
  if (q.is_qualified_equals !== undefined) {
    const v = String(q.is_qualified_equals).toLowerCase();
    if (v === 'true' || v === '1') where.is_qualified = true;
    else if (v === 'false' || v === '0') where.is_qualified = false;
  }

  return where;
}

/**
 * POST /leads
 */
export async function createLead(req, res, next) {
  try {
    const userId = req.user.id;
    const payload = { ...req.body, userId };
    const lead = await Lead.create(payload);
    return res.status(201).json(lead);
  } catch (err) {
    if (err?.code === 11000 && err.keyPattern?.email) {
      return res.status(409).json({ message: 'Lead with this email already exists' });
    }
    next(err);
  }
}

/**
 * GET /leads?page=1&limit=20&...filters...
 */
export async function listLeads(req, res, next) {
  try {
    const userId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(parseInt(req.query.limit || '20', 10) || 20, 100);
    const skip = (page - 1) * limit;

    const baseFilters = buildFiltersFromQuery(req.query);
    const filters = { ...baseFilters, userId: mongoose.Types.ObjectId(userId) };
    const sort = { created_at: -1 };

    const [total, data] = await Promise.all([
      Lead.countDocuments(filters),
      Lead.find(filters).sort(sort).skip(skip).limit(limit)
    ]);

    return res.status(200).json({
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /leads/:id
 */
export async function getLead(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const lead = await Lead.findOne({ _id: id, userId });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    return res.status(200).json(lead);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /leads/:id
 */
export async function updateLead(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const updates = { ...req.body };
    // Prevent changing owner
    delete updates.userId;

    const lead = await Lead.findOneAndUpdate({ _id: id, userId }, updates, { new: true, runValidators: true });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    return res.status(200).json(lead);
  } catch (err) {
    // duplicate email
    if (err?.code === 11000 && err.keyPattern?.email) {
      return res.status(409).json({ message: 'Lead with this email already exists' });
    }
    next(err);
  }
}

/**
 * DELETE /leads/:id
 */
export async function deleteLead(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });

    const lead = await Lead.findOneAndDelete({ _id: id, userId });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
