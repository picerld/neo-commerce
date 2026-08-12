import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "@/lib/auth/password";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function seedAccounts() {
  const adminPasswordHash = await hashPassword("password");
  const adminData = { passwordHash: adminPasswordHash, name: "Admin Toko", role: "admin" as const };
  await prisma.user.upsert({
    where: { email: "admin@neocommerce.local" },
    update: adminData,
    create: { email: "admin@neocommerce.local", ...adminData },
  });

  const userPasswordHash = await hashPassword("password");
  const userData = { passwordHash: userPasswordHash, name: "Budi Santoso", role: "user" as const, phone: "081234567890" };
  await prisma.user.upsert({
    where: { email: "user@neocommerce.local" },
    update: userData,
    create: { email: "user@neocommerce.local", ...userData },
  });
}

const CATEGORIES = [
  { name: "Elektronik", slug: "elektronik" },
  { name: "Fashion", slug: "fashion" },
  { name: "Rumah Tangga", slug: "rumah-tangga" },
  { name: "Olahraga", slug: "olahraga" },
] as const;

async function seedCategories() {
  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
  }
}

const PRODUCTS = [
  {
    name: "Wireless Earbuds Pro",
    slug: "wireless-earbuds-pro",
    categorySlug: "elektronik",
    description: "Earbuds nirkabel dengan noise cancelling dan baterai tahan 24 jam.",
    price: 349000,
    stock: 42,
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600",
  },
  {
    name: "Smartwatch Fit Series 5",
    slug: "smartwatch-fit-series-5",
    categorySlug: "elektronik",
    description: "Pelacak kebugaran dengan monitor detak jantung dan GPS built-in.",
    price: 899000,
    stock: 18,
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
  },
  {
    name: "Power Bank 20000mAh",
    slug: "power-bank-20000mah",
    categorySlug: "elektronik",
    description: "Fast charging 22.5W, cukup untuk mengisi ulang smartphone hingga 4 kali.",
    price: 219000,
    stock: 65,
    imageUrl: "https://images.unsplash.com/photo-1609592806596-4d1b5e5e5b5e?w=600",
  },
  {
    name: "Kaos Katun Premium",
    slug: "kaos-katun-premium",
    categorySlug: "fashion",
    description: "Bahan katun combed 30s, nyaman dipakai sehari-hari.",
    price: 89000,
    stock: 120,
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
  },
  {
    name: "Jaket Denim Unisex",
    slug: "jaket-denim-unisex",
    categorySlug: "fashion",
    description: "Denim tebal dengan potongan klasik, cocok untuk segala gaya.",
    price: 259000,
    stock: 34,
    imageUrl: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=600",
  },
  {
    name: "Sepatu Sneakers Runner",
    slug: "sepatu-sneakers-runner",
    categorySlug: "olahraga",
    description: "Ringan dan breathable, ideal untuk lari maupun harian.",
    price: 459000,
    stock: 27,
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
  },
  {
    name: "Matras Yoga Anti-Slip",
    slug: "matras-yoga-anti-slip",
    categorySlug: "olahraga",
    description: "Ketebalan 8mm dengan permukaan anti selip untuk latihan yang stabil.",
    price: 129000,
    stock: 50,
    imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600",
  },
  {
    name: "Blender Portable USB",
    slug: "blender-portable-usb",
    categorySlug: "rumah-tangga",
    description: "Blender mini isi ulang USB, praktis dibawa bepergian.",
    price: 175000,
    stock: 8,
    imageUrl: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600",
  },
  {
    name: "Air Fryer 4L",
    slug: "air-fryer-4l",
    categorySlug: "rumah-tangga",
    description: "Masak lebih sehat tanpa minyak berlebih, kapasitas keluarga.",
    price: 549000,
    stock: 0,
    imageUrl: "https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=600",
  },
] as const;

async function seedProducts() {
  const categories = await prisma.category.findMany();
  const categoryIdBySlug = new Map(categories.map((c) => [c.slug, c.id]));

  for (const product of PRODUCTS) {
    const { categorySlug, ...data } = product;
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: { ...data, categoryId: categoryIdBySlug.get(categorySlug) },
      create: { ...data, categoryId: categoryIdBySlug.get(categorySlug) },
    });
  }
}

async function main() {
  await seedAccounts();
  await seedCategories();
  await seedProducts();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
