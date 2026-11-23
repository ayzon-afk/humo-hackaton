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

/** Регистрация. Данные уже провалидированы схемой registerSchema. */
export function register({ name, email, password, role = 'user' }) {
  const normalized = String(email).toLowerCase().trim();
  if (users().findOne((u) => u.email === normalized)) throw httpError(409, 'Email уже занят');
  const user = users().insert({
    name,
    email: normalized,
    role,
    passwordHash: bcrypt.hashSync(password, 10),
  });
  return { user: publicUser(user), token: signToken(user) };
}

export function login({ email, password }) {
  const normalized = String(email || '')
    .toLowerCase()
    .trim();
  const user = users().findOne((u) => u.email === normalized);
  if (!user || !bcrypt.compareSync(password || '', user.passwordHash)) {
    throw httpError(401, 'Неверный email или пароль');
  }
  return { user: publicUser(user), token: signToken(user) };
}

/** Список пользователей без хешей паролей */
export function listUsers() {
  return users()
    .all()
    .map(publicUser)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** Обновление имени/роли. Последнего админа понизить нельзя. */
export function updateUser(id, patch) {
  const user = users().byId(id);
  if (!user) throw httpError(404, 'Пользователь не найден');
  if (patch.role && patch.role !== 'admin' && user.role === 'admin') {
    const admins = users().find((u) => u.role === 'admin').length;
    if (admins <= 1) throw httpError(400, 'Нельзя убрать последнего администратора');
  }
  return publicUser(users().update(id, patch));
}

export function getUser(id) {
  const user = users().byId(id);
  return user ? publicUser(user) : null;
}
