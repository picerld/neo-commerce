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

  // Extra demo customers exist purely to give seeded reviews realistic
  // author variety — not meant as distinct login-worthy accounts.
  for (const demo of DEMO_REVIEWERS) {
    const passwordHash = await hashPassword("password");
    await prisma.user.upsert({
      where: { email: demo.email },
      update: { name: demo.name, role: "user" },
      create: { email: demo.email, passwordHash, name: demo.name, role: "user" },
    });
  }
}

const DEMO_REVIEWERS = [
  { email: "siti.aminah@neocommerce.local", name: "Siti Aminah" },
  { email: "rudi.hartono@neocommerce.local", name: "Rudi Hartono" },
  { email: "dewi.lestari@neocommerce.local", name: "Dewi Lestari" },
  { email: "agus.wijaya@neocommerce.local", name: "Agus Wijaya" },
] as const;

const CATEGORIES = [
  { name: "Elektronik", slug: "elektronik" },
  { name: "Fashion", slug: "fashion" },
  { name: "Rumah Tangga", slug: "rumah-tangga" },
  { name: "Olahraga", slug: "olahraga" },
  { name: "Kesehatan & Kecantikan", slug: "kesehatan-kecantikan" },
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
  {
    name: "Keyboard Wireless Slim",
    slug: "keyboard-wireless-slim",
    categorySlug: "elektronik",
    description: "Keyboard nirkabel tipis dengan konektivitas Bluetooth, desain minimalis di atas meja.",
    price: 459000,
    stock: 30,
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600",
  },
  {
    name: "Mouse Wireless Ergonomis",
    slug: "mouse-wireless-ergonomis",
    categorySlug: "elektronik",
    description: "Mouse nirkabel ergonomis dengan sensor presisi tinggi untuk kerja maupun gaming.",
    price: 329000,
    stock: 45,
    imageUrl: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600",
  },
  {
    name: "Lampu Meja LED Minimalis",
    slug: "lampu-meja-led-minimalis",
    categorySlug: "elektronik",
    description: "Lampu belajar LED dengan lengan fleksibel, hemat energi dan nyaman di mata.",
    price: 149000,
    stock: 55,
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600",
  },
  {
    name: "Hoodie Basic Unisex",
    slug: "hoodie-basic-unisex",
    categorySlug: "fashion",
    description: "Hoodie katun fleece tebal, nyaman dipakai untuk aktivitas outdoor maupun santai.",
    price: 195000,
    stock: 70,
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600",
  },
  {
    name: "Tas Ransel Laptop Anti Air",
    slug: "tas-ransel-laptop-anti-air",
    categorySlug: "fashion",
    description: "Ransel tahan air dengan kompartemen laptop empuk, cocok untuk kerja dan traveling.",
    price: 289000,
    stock: 40,
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
  },
  {
    name: "Kacamata Hitam Retro Bulat",
    slug: "kacamata-hitam-retro-bulat",
    categorySlug: "fashion",
    description: "Frame bulat gaya retro dengan lensa pelindung UV.",
    price: 159000,
    stock: 60,
    imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600",
  },
  {
    name: "Jam Tangan Analog Kulit",
    slug: "jam-tangan-analog-kulit",
    categorySlug: "fashion",
    description: "Jam tangan klasik dengan tali kulit asli dan desain elegan.",
    price: 379000,
    stock: 25,
    imageUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600",
  },
  {
    name: "Tas Tangan Kulit Wanita",
    slug: "tas-tangan-kulit-wanita",
    categorySlug: "fashion",
    description: "Tas tangan kulit sintetis dengan kompartemen luas, cocok untuk kerja maupun acara formal.",
    price: 329000,
    stock: 33,
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600",
  },
  {
    name: "Sneakers Retro Pastel",
    slug: "sneakers-retro-pastel",
    categorySlug: "fashion",
    description: "Sneakers warna pastel yang playful, empuk dan nyaman dipakai harian.",
    price: 429000,
    stock: 22,
    imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600",
  },
  {
    name: "Barbell Set Angkat Beban",
    slug: "barbell-set-angkat-beban",
    categorySlug: "olahraga",
    description: "Set barbel dan plat beban untuk latihan kekuatan di rumah maupun gym.",
    price: 649000,
    stock: 15,
    imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600",
  },
  {
    name: "Raket Badminton Karbon",
    slug: "raket-badminton-karbon",
    categorySlug: "olahraga",
    description: "Raket ringan berbahan karbon, cocok untuk pemain rekreasi maupun kompetitif.",
    price: 259000,
    stock: 38,
    imageUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600",
  },
  {
    name: "Botol Minum Stainless Steel",
    slug: "botol-minum-stainless-steel",
    categorySlug: "olahraga",
    description: "Botol minum stainless steel 500ml, menjaga suhu minuman hingga 12 jam.",
    price: 99000,
    stock: 80,
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600",
  },
  {
    name: "Robot Vacuum Cleaner",
    slug: "robot-vacuum-cleaner",
    categorySlug: "rumah-tangga",
    description: "Vacuum cleaner robot otomatis dengan sensor navigasi pintar, praktis untuk rumah modern.",
    price: 1299000,
    stock: 10,
    imageUrl: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600",
  },
  {
    name: "Body Lotion Pelembab",
    slug: "body-lotion-pelembab",
    categorySlug: "kesehatan-kecantikan",
    description: "Body lotion tanpa pewangi, cocok untuk kulit sensitif, melembapkan seharian.",
    price: 89000,
    stock: 90,
    imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600",
  },
  {
    name: "Multivitamin Harian",
    slug: "multivitamin-harian",
    categorySlug: "kesehatan-kecantikan",
    description: "Suplemen multivitamin harian untuk menjaga daya tahan tubuh.",
    price: 119000,
    stock: 75,
    imageUrl: "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=600",
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

const REVIEWS = [
  { productSlug: "wireless-earbuds-pro", reviewerEmail: "user@neocommerce.local", rating: 5, comment: "Suara jernih, bass mantap. Baterai beneran awet seharian." },
  { productSlug: "wireless-earbuds-pro", reviewerEmail: "siti.aminah@neocommerce.local", rating: 4, comment: "Nyaman dipakai lama, cuma casing agak gampang lecet." },
  { productSlug: "wireless-earbuds-pro", reviewerEmail: "rudi.hartono@neocommerce.local", rating: 5, comment: "Pengiriman cepat, kualitas sesuai harga. Recommended!" },
  { productSlug: "wireless-earbuds-pro", reviewerEmail: "dewi.lestari@neocommerce.local", rating: 3, comment: "Oke lah untuk harian, noise cancelling-nya biasa aja." },

  { productSlug: "smartwatch-fit-series-5", reviewerEmail: "user@neocommerce.local", rating: 5, comment: "GPS akurat buat lari pagi, layarnya terang banget." },
  { productSlug: "smartwatch-fit-series-5", reviewerEmail: "agus.wijaya@neocommerce.local", rating: 4, comment: "Fitur lengkap, tapi aplikasi pendampingnya kadang lag." },
  { productSlug: "smartwatch-fit-series-5", reviewerEmail: "dewi.lestari@neocommerce.local", rating: 5, comment: "Worth it banget, monitor detak jantungnya presisi." },

  { productSlug: "power-bank-20000mah", reviewerEmail: "user@neocommerce.local", rating: 4, comment: "Ngecas cepat, tapi bodinya lumayan berat dibawa." },
  { productSlug: "power-bank-20000mah", reviewerEmail: "siti.aminah@neocommerce.local", rating: 5, comment: "Kapasitas gede, cukup buat 4 kali full charge HP." },

  { productSlug: "kaos-katun-premium", reviewerEmail: "user@neocommerce.local", rating: 5, comment: "Bahannya adem, jahitan rapi. Bakal beli warna lain." },
  { productSlug: "kaos-katun-premium", reviewerEmail: "rudi.hartono@neocommerce.local", rating: 4, comment: "Ukuran pas sesuai chart, kualitas sesuai harga." },
  { productSlug: "kaos-katun-premium", reviewerEmail: "agus.wijaya@neocommerce.local", rating: 5, comment: "Sudah beberapa kali repeat order, selalu memuaskan." },

  { productSlug: "jaket-denim-unisex", reviewerEmail: "dewi.lestari@neocommerce.local", rating: 4, comment: "Model klasik, bahan tebal cocok buat cuaca dingin." },
  { productSlug: "jaket-denim-unisex", reviewerEmail: "user@neocommerce.local", rating: 3, comment: "Bagus, tapi warnanya sedikit beda dari foto." },

  { productSlug: "sepatu-sneakers-runner", reviewerEmail: "user@neocommerce.local", rating: 5, comment: "Ringan banget, empuk buat lari jarak jauh." },
  { productSlug: "sepatu-sneakers-runner", reviewerEmail: "siti.aminah@neocommerce.local", rating: 5, comment: "Desainnya keren, size-nya juga akurat." },
  { productSlug: "sepatu-sneakers-runner", reviewerEmail: "rudi.hartono@neocommerce.local", rating: 4, comment: "Nyaman, cuma solnya agak licin di lantai basah." },

  { productSlug: "matras-yoga-anti-slip", reviewerEmail: "dewi.lestari@neocommerce.local", rating: 5, comment: "Anti selipnya beneran work, ketebalannya pas." },
  { productSlug: "matras-yoga-anti-slip", reviewerEmail: "agus.wijaya@neocommerce.local", rating: 4, comment: "Bagus buat yoga di rumah, sedikit bau karet di awal." },

  { productSlug: "blender-portable-usb", reviewerEmail: "user@neocommerce.local", rating: 3, comment: "Praktis dibawa traveling, tapi tenaganya kurang buat es batu." },
  { productSlug: "blender-portable-usb", reviewerEmail: "siti.aminah@neocommerce.local", rating: 4, comment: "Cukup buat bikin smoothie tiap pagi, mudah dicuci." },

  { productSlug: "keyboard-wireless-slim", reviewerEmail: "user@neocommerce.local", rating: 5, comment: "Tipis dan ringan, koneksi Bluetooth stabil ga pernah putus." },
  { productSlug: "keyboard-wireless-slim", reviewerEmail: "agus.wijaya@neocommerce.local", rating: 4, comment: "Enak diketik, cuma baterainya agak boros." },

  { productSlug: "mouse-wireless-ergonomis", reviewerEmail: "rudi.hartono@neocommerce.local", rating: 5, comment: "Sensornya presisi, genggamannya pas di tangan." },
  { productSlug: "mouse-wireless-ergonomis", reviewerEmail: "dewi.lestari@neocommerce.local", rating: 5, comment: "Dipakai kerja seharian ga bikin pegal tangan." },
  { productSlug: "mouse-wireless-ergonomis", reviewerEmail: "siti.aminah@neocommerce.local", rating: 4, comment: "Bagus, respons cepat, desainnya juga elegan." },

  { productSlug: "lampu-meja-led-minimalis", reviewerEmail: "user@neocommerce.local", rating: 4, comment: "Cahayanya terang tapi ga nyilaukan, cocok buat kerja malam." },
  { productSlug: "lampu-meja-led-minimalis", reviewerEmail: "agus.wijaya@neocommerce.local", rating: 5, comment: "Desain minimalis, muat di meja kecil." },

  { productSlug: "hoodie-basic-unisex", reviewerEmail: "dewi.lestari@neocommerce.local", rating: 5, comment: "Bahannya tebal dan hangat, jahitannya juga rapi." },
  { productSlug: "hoodie-basic-unisex", reviewerEmail: "rudi.hartono@neocommerce.local", rating: 4, comment: "Nyaman dipakai, ukurannya agak besar dari biasanya." },

  { productSlug: "tas-ransel-laptop-anti-air", reviewerEmail: "user@neocommerce.local", rating: 5, comment: "Muat laptop 15 inch plus buku-buku, tahan air pas kehujanan." },
  { productSlug: "tas-ransel-laptop-anti-air", reviewerEmail: "siti.aminah@neocommerce.local", rating: 4, comment: "Kompartemennya banyak, cuma agak berat kalau kosong." },
  { productSlug: "tas-ransel-laptop-anti-air", reviewerEmail: "agus.wijaya@neocommerce.local", rating: 5, comment: "Kualitas bahan bagus, cocok buat kerja dan traveling." },

  { productSlug: "jam-tangan-analog-kulit", reviewerEmail: "dewi.lestari@neocommerce.local", rating: 5, comment: "Elegan banget, tali kulitnya juga lembut." },
  { productSlug: "jam-tangan-analog-kulit", reviewerEmail: "rudi.hartono@neocommerce.local", rating: 4, comment: "Bagus untuk formal, cuma perlu penyesuaian ukuran tali." },

  { productSlug: "sneakers-retro-pastel", reviewerEmail: "user@neocommerce.local", rating: 5, comment: "Warnanya lucu banget, nyaman dipakai jalan seharian." },
  { productSlug: "sneakers-retro-pastel", reviewerEmail: "siti.aminah@neocommerce.local", rating: 4, comment: "Modelnya unik, size-nya agak kekecilan sedikit." },

  { productSlug: "barbell-set-angkat-beban", reviewerEmail: "agus.wijaya@neocommerce.local", rating: 5, comment: "Plat bebannya presisi, cocok buat home gym." },
  { productSlug: "barbell-set-angkat-beban", reviewerEmail: "user@neocommerce.local", rating: 4, comment: "Kualitas bagus, pengiriman agak lama karena berat." },

  { productSlug: "raket-badminton-karbon", reviewerEmail: "rudi.hartono@neocommerce.local", rating: 5, comment: "Ringan tapi kuat, pukulan smash jadi lebih mantap." },
  { productSlug: "raket-badminton-karbon", reviewerEmail: "dewi.lestari@neocommerce.local", rating: 5, comment: "Grip-nya nyaman, kualitas karbon terasa premium." },

  { productSlug: "botol-minum-stainless-steel", reviewerEmail: "user@neocommerce.local", rating: 5, comment: "Air tetap dingin sampai sore, ga bocor sama sekali." },
  { productSlug: "botol-minum-stainless-steel", reviewerEmail: "siti.aminah@neocommerce.local", rating: 4, comment: "Bagus dan awet, warnanya juga cakep." },
  { productSlug: "botol-minum-stainless-steel", reviewerEmail: "agus.wijaya@neocommerce.local", rating: 5, comment: "Worth it, dipakai tiap hari ke gym." },

  { productSlug: "robot-vacuum-cleaner", reviewerEmail: "dewi.lestari@neocommerce.local", rating: 4, comment: "Praktis banget, tapi kadang nyangkut di bawah sofa." },
  { productSlug: "robot-vacuum-cleaner", reviewerEmail: "rudi.hartono@neocommerce.local", rating: 5, comment: "Rumah jadi lebih bersih tanpa effort, sangat membantu." },

  { productSlug: "body-lotion-pelembab", reviewerEmail: "user@neocommerce.local", rating: 5, comment: "Cocok buat kulit sensitif, ga bikin iritasi dan cepat meresap." },
  { productSlug: "body-lotion-pelembab", reviewerEmail: "siti.aminah@neocommerce.local", rating: 4, comment: "Melembapkan, teksturnya juga ringan ga lengket." },

  { productSlug: "multivitamin-harian", reviewerEmail: "agus.wijaya@neocommerce.local", rating: 5, comment: "Badan terasa lebih fit sejak rutin minum ini." },
  { productSlug: "multivitamin-harian", reviewerEmail: "dewi.lestari@neocommerce.local", rating: 4, comment: "Gampang ditelan, ga ada rasa aneh." },
] as const;

async function seedReviews() {
  const users = await prisma.user.findMany();
  const userIdByEmail = new Map(users.map((u) => [u.email, u.id]));
  const products = await prisma.product.findMany();
  const productIdBySlug = new Map(products.map((p) => [p.slug, p.id]));

  for (const review of REVIEWS) {
    const productId = productIdBySlug.get(review.productSlug);
    const userId = userIdByEmail.get(review.reviewerEmail);
    if (!productId || !userId) continue;

    await prisma.review.upsert({
      where: { productId_userId: { productId, userId } },
      update: { rating: review.rating, comment: review.comment },
      create: { productId, userId, rating: review.rating, comment: review.comment },
    });
  }
}

async function main() {
  await seedAccounts();
  await seedCategories();
  await seedProducts();
  await seedReviews();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
