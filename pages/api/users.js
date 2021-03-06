import nextConnect from "next-connect";
import isEmail from "validator/lib/isEmail";
import normalizeEmail from "validator/lib/normalizeEmail";
import bcrypt from "bcryptjs";
import middleware from "../../middlewares/middleware";
import { extractUser } from '../../lib/api-helpers';

// MIDDLEWARE
const handler = nextConnect();
handler.use(middleware);

// GET USER DATA
handler.get(async (req, res) => res.json({ user: extractUser(req) }));

// CREATE USER ACCOUNT
handler.post(async (req, res) => {

  const { name, password } = req.body;
  const email = normalizeEmail(req.body.email);
  
  // check email address
  if (!isEmail(email)) {
    res.status(400).send("The email you entered is invalid.");
    return;
  }

  // check password & username
  if (!password || !name) {
    res.status(400).send("Missing field(s)");
    return;
  }
  
  // check if email exists
  if ((await req.db.collection("users").countDocuments({ email })) > 0) {
    res.status(400).send("The email has already been used.");
    return;
  }
  
  // encrypt password
  const hashedPassword = await bcrypt.hash(password, 10);

  // insert username into collection
  const user = await req.db
    .collection("users")
    .insertOne({ email, password: hashedPassword, name })
    .then(({ ops }) => ops[0]);

  req.logIn(user, (err) => {
    if (err) throw err;
    res.status(201).json({
      user: extractUser(req),
    });
  });

});

export default handler;
