import { getAll } from "../repositories/user.repository.js";

export async function findAllUsersService() {
  const users = await getAll();

  return users;
}
