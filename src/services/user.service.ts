import { getAll, getById } from "../repositories/user.repository.js";

export async function findAllUsersService() {
  const users = await getAll();

  return users;
}

export async function findUserByIdService(id: number) {
  const user = await getById(id);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}
