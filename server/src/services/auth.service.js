import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { collection } from '../db/store.js';
import { config } from '../config.js';
import { httpError } from '../utils/httpError.js';

const users = () => collection('users');

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
export async function register({ name, email, password, role = 'user' }) {
  const normalized = String(email).toLowerCase().trim();
  if (await users().findOne({ email: normalized })) throw httpError(409, 'Email уже занят');
  const user = await users().insert({
    name,
    email: normalized,
    role,
    passwordHash: bcrypt.hashSync(password, 10),
  });
  return { user: publicUser(user), token: signToken(user) };
}

export async function login({ email, password }) {
  const normalized = String(email || '')
    .toLowerCase()
    .trim();
  const user = await users().findOne({ email: normalized });
  if (!user || !bcrypt.compareSync(password || '', user.passwordHash)) {
    throw httpError(401, 'Неверный email или пароль');
  }
  return { user: publicUser(user), token: signToken(user) };
}

/** Список пользователей без хешей паролей */
export async function listUsers() {
  return (await users().all()).map(publicUser);
}

/** Обновление имени/роли. Последнего админа понизить нельзя. */
export async function updateUser(id, patch) {
  const user = await users().byId(id);
  if (!user) throw httpError(404, 'Пользователь не найден');
  if (patch.role && patch.role !== 'admin' && user.role === 'admin') {
    const admins = await users().count({ role: 'admin' });
    if (admins <= 1) throw httpError(400, 'Нельзя убрать последнего администратора');
  }
  return publicUser(await users().update(id, patch));
}

export async function getUser(id) {
  const user = await users().byId(id);
  return user ? publicUser(user) : null;
}
