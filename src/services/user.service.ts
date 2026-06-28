import { createUserDto, updateUserDto } from "../dtos/user.dto.js";
import {
  create,
  deleteById,
  findByEmail,
  getAll,
  getUserById,
  updateById,
} from "../repositories/user.repository.js";
import { conflict, notFound } from "../utils/api-error.js";

export async function findAllUsersService() {
  const users = await getAll();

  return users;
}

export async function findUserByIdService(id: number) {
  const user = await getUserById(id);

  if (!user) {
    throw notFound("User not found");
  }

  return user;
}

export async function createUserService(data: createUserDto) {
  const existingUser = await findByEmail(data.email);

  if (existingUser) {
    throw conflict("User already exists!");
  }

  const user = await create(data);

  return user;
}

export async function updateUserService(id: number, data: updateUserDto) {
  const user = await getUserById(id);

  if (!user) {
    throw notFound("User not found");
  }

  if (data.email) {
    const existing = await findByEmail(data.email);

    if (existing && existing.id !== id) {
      throw conflict("Email is already taken");
    }
  }

  return await updateById(id, data);
}

export async function removeUserService(id: number) {
  const user = await getUserById(id);

  if (!user) {
    throw notFound("User not found");
  }

  return await deleteById(id);
}
