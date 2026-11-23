import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { collection } from '../db/store.js';
import { config } from '../config.js';

const users = () => collection('users');

const httpError = (status, message) => Object.assign(new Error(message), { status });

export function publicUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

export function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role, name: user.name }, config.jwtSecret, {
    expiresIn: '7d',
  });
}

export function register({ name, email, password }) {
  if (!name || !email || !password) throw httpError(400, 'Заполни имя, email и пароль');
  const normalized = String(email).toLowerCase().trim();
  if (users().findOne((u) => u.email === normalized)) throw httpError(409, 'Email уже занят');
  const user = users().insert({
    name,
    email: normalized,
    role: 'user',
    passwordHash: bcrypt.hashSync(password, 10),
  });
  return { user: publicUser(user), token: signToken(user) };
}

export function login({ email, password }) {
  const normalized = String(email || '').toLowerCase().trim();
  const user = users().findOne((u) => u.email === normalized);
  if (!user || !bcrypt.compareSync(password || '', user.passwordHash)) {
    throw httpError(401, 'Неверный email или пароль');
  }
  return { user: publicUser(user), token: signToken(user) };
}

export function getUser(id) {
  const user = users().byId(id);
  return user ? publicUser(user) : null;
}
