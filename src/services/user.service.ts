import { getAll, getById } from "../repositories/user.repository.js";
import { ApiError, notFound } from "../utils/api-error.js";

export async function findAllUsersService() {
  const users = await getAll();

  return users;
}

export async function findUserByIdService(id: number) {
  const user = await getById(id);

  if (!user) {
    throw notFound("User not found");
  }

  return user;
}
