export function extractUser(req) {
  if (!req.user) return null;
  const {
    _id, email, username
  } = req.user;
  return {
    _id, email, username
  };
}