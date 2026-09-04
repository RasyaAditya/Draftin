import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import argon2 from 'argon2'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function hash(password: string) {
  return argon2.hash(password)
}

async function main() {
  console.log('Seeding database...')

  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.message.deleteMany(),
    prisma.review.deleteMany(),
    prisma.paymentLog.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.revision.deleteMany(),
    prisma.orderTimeline.deleteMany(),
    prisma.orderAttachment.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.quoteItem.deleteMany(),
    prisma.quoteRequest.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.coupon.deleteMany(),
    prisma.portfolio.deleteMany(),
    prisma.serviceImage.deleteMany(),
    prisma.servicepackage.deleteMany(),
    prisma.service.deleteMany(),
    prisma.serviceCategory.deleteMany(),
    prisma.setting.deleteMany(),
    prisma.profile.deleteMany(),
    prisma.user.deleteMany(),
  ])

  // ── Users ────────────────────────────────────────────────
  const [admin, architect, clientBudi, clientSiti, clientRayhan] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@draftin.id',
        passwordHash: await hash('Admin123!'),
        role: 'ADMIN',
        profile: { create: { fullName: 'Admin Draftin', phone: '081200000001', city: 'Jakarta Selatan' } },
      },
    }),
    prisma.user.create({
      data: {
        email: 'arsitek@draftin.id',
        passwordHash: await hash('Arsitek123!'),
        role: 'ADMIN',
        profile: { create: { fullName: 'Reza Pratama, S.Ars', phone: '081200000002', city: 'Bandung' } },
      },
    }),
    prisma.user.create({
      data: {
        email: 'budi.santoso@gmail.com',
        passwordHash: await hash('Client123!'),
        role: 'CLIENT',
        profile: { create: { fullName: 'Budi Santoso', phone: '081311112222', city: 'Depok', address: 'Jl. Margonda Raya No. 45' } },
      },
    }),
    prisma.user.create({
      data: {
        email: 'siti.rahma@gmail.com',
        passwordHash: await hash('Client123!'),
        role: 'CLIENT',
        profile: { create: { fullName: 'Siti Rahma', phone: '081322223333', city: 'Bekasi', address: 'Jl. Ahmad Yani No. 12' } },
      },
    }),
    prisma.user.create({
      data: {
        email: 'rayhan.putra@gmail.com',
        passwordHash: await hash('Client123!'),
        role: 'CLIENT',
        profile: { create: { fullName: 'Rayhan Putra', phone: '081333334444', city: 'Tangerang Selatan', address: 'Jl. Boulevard Gading No. 8' } },
      },
    }),
  ])

  for (const user of [admin, architect, clientBudi, clientSiti, clientRayhan]) {
    await prisma.cart.create({ data: { userId: user.id } })
  }

  // ── Service categories + services + packages ────────────
  type PackageSeed = {
    name: string
    slug: string
    pricingType: 'FIXED' | 'CUSTOM_QUOTE'
    priceRupiah?: bigint
    unit?: string
    durationDays?: number
    revisionQuota: number
    scope: string[]
  }

  const catalog: Array<{
    category: { name: string; slug: string; description: string }
    service: { name: string; slug: string; summary: string; description: string }
    packages: PackageSeed[]
  }> = [
    {
      category: {
        name: 'Desain Arsitektur Rumah Tinggal',
        slug: 'desain-rumah-tinggal',
        description: 'Desain arsitektur untuk rumah tinggal, dari konsep hingga gambar kerja.',
      },
      service: {
        name: 'Desain Arsitektur Rumah Tinggal',
        slug: 'desain-arsitektur-rumah-tinggal',
        summary: 'Rancangan rumah yang mengikuti gaya hidup dan iklim tropis, dihitung per m².',
        description:
          'Layanan desain arsitektur rumah tinggal mulai dari analisis kebutuhan ruang, konsep denah, hingga tampilan fasad. Cocok untuk pembangunan baru maupun renovasi total.',
      },
      packages: [
        {
          name: 'Rumah Tinggal — Standar',
          slug: 'rumah-tinggal-standar',
          pricingType: 'FIXED',
          priceRupiah: 350_000n,
          unit: 'per m²',
          durationDays: 21,
          revisionQuota: 2,
          scope: ['Konsep denah', 'Gambar fasad 2D', 'Gambar kerja dasar', '2x sesi konsultasi'],
        },
        {
          name: 'Rumah Tinggal — Premium',
          slug: 'rumah-tinggal-premium',
          pricingType: 'FIXED',
          priceRupiah: 550_000n,
          unit: 'per m²',
          durationDays: 30,
          revisionQuota: 4,
          scope: ['Konsep denah', 'Gambar fasad 2D & 3D', 'Gambar kerja lengkap', 'RAB kasar', '4x sesi konsultasi'],
        },
      ],
    },
    {
      category: {
        name: 'Desain Interior & Furniture Custom',
        slug: 'desain-interior',
        description: 'Desain interior dan furniture custom untuk hunian maupun komersial.',
      },
      service: {
        name: 'Desain Interior & Furniture Custom',
        slug: 'desain-interior-furniture-custom',
        summary: 'Tata ruang, pemilihan material, dan desain furniture custom sesuai anggaran.',
        description:
          'Layanan desain interior meliputi moodboard, layout furniture, spesifikasi material, hingga gambar kerja furniture custom yang siap produksi.',
      },
      packages: [
        {
          name: 'Interior — 1 Ruangan',
          slug: 'interior-satu-ruangan',
          pricingType: 'FIXED',
          priceRupiah: 4_500_000n,
          durationDays: 14,
          revisionQuota: 3,
          scope: ['Moodboard', 'Layout furniture', '3D render 2 angle', 'Spesifikasi material'],
        },
        {
          name: 'Interior — Seluruh Rumah',
          slug: 'interior-seluruh-rumah',
          pricingType: 'CUSTOM_QUOTE',
          durationDays: 45,
          revisionQuota: 5,
          scope: ['Moodboard tiap ruangan', 'Layout furniture', '3D render tiap ruangan', 'Gambar kerja furniture custom'],
        },
      ],
    },
    {
      category: {
        name: 'Gambar Kerja & Perizinan',
        slug: 'gambar-kerja-perizinan',
        description: 'Gambar kerja detail dan pengurusan izin mendirikan bangunan (IMB/PBG).',
      },
      service: {
        name: 'Gambar Kerja & Perizinan (IMB/PBG)',
        slug: 'gambar-kerja-imb-pbg',
        summary: 'Gambar kerja siap konstruksi dan pendampingan pengurusan PBG.',
        description:
          'Menyusun set gambar kerja (arsitektur, struktur, MEP dasar) yang detail dan sesuai standar untuk pengajuan PBG serta pelaksanaan konstruksi.',
      },
      packages: [
        {
          name: 'Paket Gambar Kerja Lengkap',
          slug: 'gambar-kerja-lengkap',
          pricingType: 'FIXED',
          priceRupiah: 75_000_000n,
          durationDays: 30,
          revisionQuota: 3,
          scope: ['Gambar arsitektur', 'Gambar struktur dasar', 'Gambar MEP dasar', 'File siap cetak'],
        },
        {
          name: 'Pendampingan Pengurusan PBG',
          slug: 'pengurusan-pbg',
          pricingType: 'CUSTOM_QUOTE',
          durationDays: 60,
          revisionQuota: 1,
          scope: ['Penyusunan dokumen', 'Pendampingan proses OSS', 'Koordinasi dinas terkait'],
        },
      ],
    },
    {
      category: {
        name: 'Render 3D',
        slug: 'render-3d',
        description: 'Visualisasi 3D fotorealistik untuk eksterior maupun interior.',
      },
      service: {
        name: 'Render 3D Eksterior & Interior',
        slug: 'render-3d-eksterior-interior',
        summary: 'Visualisasi fotorealistik untuk presentasi desain sebelum konstruksi.',
        description:
          'Render 3D fotorealistik dengan pencahayaan dan material akurat, membantu klien memvisualisasikan hasil akhir sebelum proses pembangunan dimulai.',
      },
      packages: [
        {
          name: 'Render 3D — 3 Angle',
          slug: 'render-3d-tiga-angle',
          pricingType: 'FIXED',
          priceRupiah: 3_000_000n,
          durationDays: 7,
          revisionQuota: 2,
          scope: ['3 sudut pandang', 'Resolusi cetak', 'Revisi pencahayaan'],
        },
        {
          name: 'Render 3D — Walkthrough Animasi',
          slug: 'render-3d-walkthrough',
          pricingType: 'FIXED',
          priceRupiah: 12_000_000n,
          durationDays: 14,
          revisionQuota: 2,
          scope: ['Video walkthrough 1-2 menit', 'Musik latar', 'Revisi kamera & pencahayaan'],
        },
      ],
    },
    {
      category: {
        name: 'RAB',
        slug: 'rab',
        description: 'Penyusunan Rencana Anggaran Biaya konstruksi.',
      },
      service: {
        name: 'Penyusunan RAB',
        slug: 'penyusunan-rab',
        summary: 'Estimasi biaya konstruksi berdasarkan gambar kerja dan harga material terkini.',
        description:
          'Penyusunan RAB rinci berdasarkan volume pekerjaan, harga satuan material dan upah terbaru di wilayah proyek.',
      },
      packages: [
        {
          name: 'RAB — Rumah Tinggal',
          slug: 'rab-rumah-tinggal',
          pricingType: 'FIXED',
          priceRupiah: 50_000n,
          unit: 'per m²',
          durationDays: 10,
          revisionQuota: 2,
          scope: ['Rincian volume pekerjaan', 'Harga satuan terkini', 'Rekap total biaya'],
        },
        {
          name: 'RAB — Proyek Komersial',
          slug: 'rab-proyek-komersial',
          pricingType: 'CUSTOM_QUOTE',
          durationDays: 21,
          revisionQuota: 2,
          scope: ['Rincian volume pekerjaan', 'Analisa harga satuan', 'Kurva-S'],
        },
      ],
    },
    {
      category: {
        name: 'Konsultasi Online',
        slug: 'konsultasi-online',
        description: 'Sesi konsultasi arsitektur secara daring.',
      },
      service: {
        name: 'Konsultasi Arsitek Online',
        slug: 'konsultasi-arsitek-online',
        summary: 'Diskusi langsung dengan arsitek berpengalaman lewat video call.',
        description:
          'Sesi konsultasi untuk membahas rencana bangun, review desain yang sudah ada, atau sekadar diskusi kelayakan anggaran.',
      },
      packages: [
        {
          name: 'Konsultasi — 60 Menit',
          slug: 'konsultasi-60-menit',
          pricingType: 'FIXED',
          priceRupiah: 350_000n,
          durationDays: 1,
          revisionQuota: 0,
          scope: ['Sesi video call 60 menit', 'Rangkuman rekomendasi tertulis'],
        },
        {
          name: 'Konsultasi — Paket 3 Sesi',
          slug: 'konsultasi-paket-3-sesi',
          pricingType: 'FIXED',
          priceRupiah: 900_000n,
          durationDays: 30,
          revisionQuota: 0,
          scope: ['3x sesi video call 60 menit', 'Rangkuman rekomendasi tertulis tiap sesi'],
        },
      ],
    },
    {
      category: {
        name: 'Pengawasan Proyek',
        slug: 'pengawasan-proyek',
        description: 'Jasa pengawasan pelaksanaan konstruksi di lapangan.',
      },
      service: {
        name: 'Pengawasan Proyek & Kontraktor',
        slug: 'pengawasan-proyek-kontraktor',
        summary: 'Memastikan pelaksanaan konstruksi sesuai gambar kerja dan RAB.',
        description:
          'Tim pengawas memantau progres pekerjaan, kualitas material, dan kesesuaian pelaksanaan terhadap gambar kerja secara berkala maupun penuh waktu.',
      },
      packages: [
        {
          name: 'Pengawasan Berkala (Mingguan)',
          slug: 'pengawasan-berkala-mingguan',
          pricingType: 'CUSTOM_QUOTE',
          durationDays: 90,
          revisionQuota: 0,
          scope: ['Kunjungan 1x/minggu', 'Laporan progres foto & catatan'],
        },
        {
          name: 'Pengawasan Penuh Waktu',
          slug: 'pengawasan-penuh-waktu',
          pricingType: 'CUSTOM_QUOTE',
          durationDays: 180,
          revisionQuota: 0,
          scope: ['Pengawas di lokasi setiap hari kerja', 'Laporan harian', 'Koordinasi langsung dengan kontraktor'],
        },
      ],
    },
  ]

  for (const entry of catalog) {
    const category = await prisma.serviceCategory.create({ data: entry.category })
    const service = await prisma.service.create({
      data: { ...entry.service, categoryId: category.id, isPublished: true },
    })
    await prisma.serviceImage.create({
      data: {
        serviceId: service.id,
        url: `https://picsum.photos/seed/${entry.service.slug}/1200/800`,
        alt: entry.service.name,
        sortOrder: 0,
      },
    })
    for (const [index, pkg] of entry.packages.entries()) {
      await prisma.servicepackage.create({
        data: {
          serviceId: service.id,
          name: pkg.name,
          slug: pkg.slug,
          pricingType: pkg.pricingType,
          priceRupiah: pkg.priceRupiah,
          unit: pkg.unit,
          durationDays: pkg.durationDays,
          revisionQuota: pkg.revisionQuota,
          scope: pkg.scope,
          isPublished: true,
          sortOrder: index,
        },
      })
    }
  }

  // ── Portfolio ────────────────────────────────────────────
  const portfolios = [
    {
      title: 'Rumah Tropis Modern — Depok',
      slug: 'rumah-tropis-modern-depok',
      category: 'Rumah Tinggal',
      summary: 'Renovasi total rumah 1 lantai menjadi 2 lantai dengan konsep tropis modern.',
    },
    {
      title: 'Villa Minimalis — Bogor',
      slug: 'villa-minimalis-bogor',
      category: 'Rumah Tinggal',
      summary: 'Desain villa akhir pekan dengan bukaan besar menghadap kebun.',
    },
    {
      title: 'Kantor Startup — Jakarta Selatan',
      slug: 'kantor-startup-jakarta-selatan',
      category: 'Komersial',
      summary: 'Interior kantor open-plan untuk tim 40 orang dengan area kolaborasi.',
    },
    {
      title: 'Ruko 3 Lantai — Bekasi',
      slug: 'ruko-3-lantai-bekasi',
      category: 'Komersial',
      summary: 'Desain ruko multifungsi: toko di lantai dasar, kantor dan hunian di atasnya.',
    },
    {
      title: 'Renovasi Dapur & Ruang Keluarga — Tangerang',
      slug: 'renovasi-dapur-tangerang',
      category: 'Interior',
      summary: 'Perombakan tata letak dapur terbuka terhubung ke ruang keluarga.',
    },
    {
      title: 'Cafe Industrial — Bandung',
      slug: 'cafe-industrial-bandung',
      category: 'Komersial',
      summary: 'Interior cafe bergaya industrial dengan material ekspos.',
    },
    {
      title: 'Rumah Tinggal 2 Lantai — Yogyakarta',
      slug: 'rumah-tinggal-2-lantai-yogyakarta',
      category: 'Rumah Tinggal',
      summary: 'Desain rumah keluarga muda dengan void tengah untuk sirkulasi udara.',
    },
    {
      title: 'Apartemen Studio — Surabaya',
      slug: 'apartemen-studio-surabaya',
      category: 'Interior',
      summary: 'Optimasi ruang 28 m² dengan furniture multifungsi.',
    },
  ]

  for (const [index, p] of portfolios.entries()) {
    await prisma.portfolio.create({
      data: {
        title: p.title,
        slug: p.slug,
        category: p.category,
        summary: p.summary,
        content: `${p.summary} Proyek ini menekankan efisiensi ruang, pencahayaan alami, dan pemilihan material yang tahan iklim tropis.`,
        coverImageUrl: `https://picsum.photos/seed/${p.slug}-cover/1200/900`,
        beforeImageUrl: `https://picsum.photos/seed/${p.slug}-before/1200/900`,
        afterImageUrl: `https://picsum.photos/seed/${p.slug}-after/1200/900`,
        isPublished: true,
        sortOrder: index,
      },
    })
  }

  // ── Coupon ───────────────────────────────────────────────
  await prisma.coupon.create({
    data: {
      code: 'DRAFTIN10',
      type: 'PERCENTAGE',
      value: 10,
      minTransactionRupiah: 1_000_000n,
      quota: 100,
      isActive: true,
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
    },
  })

  // ── Settings ─────────────────────────────────────────────
  await prisma.setting.create({
    data: { key: 'tax_percentage', value: 11 },
  })

  console.log('Seed selesai.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
