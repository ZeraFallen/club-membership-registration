import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { membersCollection } from './db.js';
import { validateMember } from './validate.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Middleware (order matters: these run before the routes) ----------

// Logs every request, plus the status code once the response is sent.
function logger(req, res, next) {
  res.on('finish', () => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl} -> ${res.statusCode}`);
  });
  next();
}

app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());
app.use(logger);

// ---------- Helpers ----------

// Turns a Firestore document into the JSON the client expects.
// Firestore keeps the id outside the data, and dates as Timestamp objects.
function formatMember(doc) {
  const data = doc.data();
  return { id: doc.id, ...data, created_at: data.created_at.toDate().toISOString() };
}

// Firestore auto-generated ids are exactly 20 letters/digits.
// Anything else cannot be a real member, so it is treated as "not found".
function isValidId(value) {
  return /^[A-Za-z0-9]{20}$/.test(value);
}

// ---------- Route handlers ----------

// GET /api/members?search=&club=  -> 200
// Firestore has no LIKE, so: filter by club in the query, then search and sort in JS.
// (Sorting in JS also avoids needing a composite index.)
async function getMembers(req, res) {
  const club = typeof req.query.club === 'string' ? req.query.club : '';
  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';

  try {
    const query = club ? membersCollection.where('club', '==', club) : membersCollection;
    const snapshot = await query.get();

    const members = snapshot.docs
      .map(formatMember)
      .filter(
        (member) =>
          !search ||
          member.member_name.toLowerCase().includes(search) ||
          member.email.includes(search)
      )
      .sort((a, b) => b.created_at.localeCompare(a.created_at)); // newest first

    return res.status(200).json(members);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Could not load members.' });
  }
}

// GET /api/members/:id  -> 200 or 404
async function getMemberById(req, res) {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(404).json({ message: 'Member not found.' });
  }

  try {
    const doc = await membersCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Member not found.' });
    }
    return res.status(200).json(formatMember(doc));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Could not load the member.' });
  }
}

// POST /api/members  -> 201, 400 (invalid data) or 409 (already registered)
async function createMember(req, res) {
  const errors = validateMember(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Please fix the highlighted fields.', errors });
  }

  const { member_name, club, year_level, interests } = req.body;
  const email = req.body.email.trim().toLowerCase();

  try {
    // Firestore has no UNIQUE constraint, so check for a duplicate ourselves.
    const duplicate = await membersCollection
      .where('email', '==', email)
      .where('club', '==', club)
      .limit(1)
      .get();
    if (!duplicate.empty) {
      return res.status(409).json({ message: 'That email is already registered for this club.' });
    }

    const record = {
      member_name: member_name.trim(),
      email,
      club,
      year_level,
      interests: interests.trim(),
      agreed_to_terms: true,
      created_at: new Date(), // stored by Firestore as a Timestamp
    };
    const ref = await membersCollection.add(record);

    return res
      .status(201)
      .json({ id: ref.id, ...record, created_at: record.created_at.toISOString() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Could not save the member.' });
  }
}

// DELETE /api/members/:id  -> 200 or 404
async function deleteMember(req, res) {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(404).json({ message: 'Member not found.' });
  }

  try {
    const ref = membersCollection.doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Member not found.' });
    }
    await ref.delete();
    return res.status(200).json({ message: 'Member deleted.', id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Could not delete the member.' });
  }
}

// ---------- Routes ----------

app.get('/api/members', getMembers);
app.get('/api/members/:id', getMemberById);
app.post('/api/members', createMember);
app.delete('/api/members/:id', deleteMember);

// ---------- Fallbacks (must come after the routes) ----------

function notFound(req, res) {
  return res.status(404).json({ message: 'Route not found.' });
}

// Four arguments tell Express this is the error handler.
// It catches things like a request body that is not valid JSON.
function errorHandler(err, req, res, _next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body is not valid JSON.' });
  }
  console.error(err);
  return res.status(500).json({ message: 'Something went wrong on the server.' });
}

app.use(notFound);
app.use(errorHandler);

// ---------- Start ----------

async function start() {
  try {
    // A tiny read proves the service account key and Firestore setup work.
    await membersCollection.limit(1).get();
    console.log('Connected to Firestore.');
  } catch (err) {
    console.error('Could not connect to Firestore:', err.message);
    process.exit(1);
  }
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
}

start();
