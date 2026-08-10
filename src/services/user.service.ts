import slug from "slug";
import { createUserDto, updateUserDto } from "../dtos/user.dto.js";
import {
  create,
  deleteById,
  findByEmail,
  findBySlug,
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

// Only auto-derived slugs (no explicit slug passed in) get silently
// disambiguated with a numeric suffix — an explicit slug is a deliberate
// user choice, so a collision there is surfaced as a conflict instead.
async function generateUniqueSlug(baseSlug: string) {
  let candidate = baseSlug;
  let suffix = 2;

  while (await findBySlug(candidate)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix++;
  }

  return candidate;
}

export async function createUserService(data: createUserDto) {
  const existingUser = await findByEmail(data.email);

  if (existingUser) {
    throw conflict("User already exists!");
  }

  let slugPassed: string;

  if (data.slug) {
    if (await findBySlug(data.slug)) {
      throw conflict(
        "A user with this slug already exists, please use a different slug",
      );
    }

    slugPassed = data.slug;
  } else {
    slugPassed = await generateUniqueSlug(slug(data.name, { lower: true }));
  }

  const user = await create({ ...data, slug: slugPassed });

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
