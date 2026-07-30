const {
  AppointmentStatus,
  PrismaClient,
  ListingType,
  ServiceType,
  StaffRole,
  StaffStatus,
} = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.chatMessage.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.appointmentRequest.deleteMany();
  await prisma.staffMember.deleteMany();
  await prisma.petListing.deleteMany();
  await prisma.knowledgeDocument.deleteMany();

  await prisma.knowledgeDocument.createMany({
    data: [
      {
        title: 'Senior Dog Nutrition',
        category: 'products',
        content:
          'Senior dogs often benefit from food with moderate calories, high-quality protein, joint support nutrients, and easy-to-digest ingredients. Sudden diet changes should be gradual over 7 to 10 days.',
      },
      {
        title: 'Puppy Shampoo Safety',
        category: 'grooming',
        content:
          'Puppies should use mild puppy-safe shampoo. Avoid human shampoo, strong fragrances, and harsh flea products unless a vet recommends them.',
      },
      {
        title: 'Persian Cat Grooming',
        category: 'grooming',
        content:
          'Persian cats usually need daily brushing because their long coat mats easily. Professional grooming every 4 to 6 weeks can help with coat, nail, and hygiene care.',
      },
      {
        title: 'Puppy Vaccine Basics',
        category: 'vet',
        content:
          'Puppies commonly receive core vaccines across multiple visits starting around 6 to 8 weeks old. A veterinarian should set the exact schedule based on age, region, and risk.',
      },
      {
        title: 'Lost Pet First Steps',
        category: 'lost_found',
        content:
          'For a lost pet, search the last seen area, contact nearby shelters and vets, post clear photos with location and contact details, and update microchip information if available.',
      },
      {
        title: 'Adoption Readiness',
        category: 'adoption',
        content:
          'Before adopting, check the pet age, temperament, medical history, energy level, home fit, and whether your schedule can support training, exercise, and vet care.',
      },
    ],
  });

  await prisma.petListing.createMany({
    data: [
      {
        type: ListingType.ADOPTION,
        petName: 'Milo',
        petType: 'Dog',
        breed: 'Mixed Breed',
        age: '2 years',
        location: 'Tampines',
        description: 'Friendly medium-sized dog looking for an active home.',
        contactName: 'Paw Connect Team',
        contactEmail: 'adopt@example.com',
      },
      {
        type: ListingType.ADOPTION,
        petName: 'Luna',
        petType: 'Cat',
        breed: 'Domestic Short Hair',
        age: '1 year',
        location: 'Jurong',
        description: 'Calm indoor cat suitable for apartment living.',
        contactName: 'Paw Connect Team',
        contactEmail: 'adopt@example.com',
      },
      {
        type: ListingType.LOST,
        petName: 'Cookie',
        petType: 'Dog',
        breed: 'Poodle',
        location: 'Bedok',
        description: 'Brown poodle last seen near Bedok Reservoir.',
        contactName: 'Sarah',
        contactPhone: '+65 9000 0000',
      },
      {
        type: ListingType.FOUND,
        petType: 'Cat',
        location: 'Hougang',
        description: 'Grey cat found near a void deck, wearing a blue collar.',
        contactName: 'Daniel',
        contactPhone: '+65 9111 1111',
      },
    ],
  });

  await prisma.appointmentRequest.createMany({
    data: [
      {
        serviceType: ServiceType.GROOMING,
        petName: 'Buddy',
        petType: 'Dog',
        preferredAt: new Date('2026-08-02T10:00:00.000Z'),
        contactName: 'Alex Tan',
        contactPhone: '+65 9222 2222',
        notes: 'Full grooming request for a golden retriever.',
        status: AppointmentStatus.PENDING,
      },
      {
        serviceType: ServiceType.VET,
        petName: 'Luna',
        petType: 'Cat',
        preferredAt: new Date('2026-08-03T04:30:00.000Z'),
        contactName: 'Maya Lee',
        contactEmail: 'maya@example.com',
        notes: 'Annual wellness check and vaccine advice.',
        status: AppointmentStatus.CONFIRMED,
      },
      {
        serviceType: ServiceType.GROOMING,
        petName: 'Coco',
        petType: 'Dog',
        preferredAt: new Date('2026-08-04T06:00:00.000Z'),
        contactName: 'Daniel Koh',
        contactPhone: '+65 9333 3333',
        notes: 'Bath, dry, nail trim, and ear cleaning.',
        status: AppointmentStatus.CONFIRMED,
      },
      {
        serviceType: ServiceType.VET,
        petName: 'Nala',
        petType: 'Rabbit',
        preferredAt: new Date('2026-08-05T03:00:00.000Z'),
        contactName: 'Sarah Lim',
        contactEmail: 'sarah@example.com',
        notes: 'Eating less than usual. Needs vet review.',
        status: AppointmentStatus.PENDING,
      },
      {
        serviceType: ServiceType.GROOMING,
        petName: 'Mochi',
        petType: 'Cat',
        preferredAt: new Date('2026-08-06T08:00:00.000Z'),
        contactName: 'Rose White',
        contactPhone: '+65 9444 4444',
        notes: 'Long-hair cat de-matting and hygiene trim.',
        status: AppointmentStatus.CANCELLED,
      },
    ],
  });

  await prisma.staffMember.createMany({
    data: [
      {
        name: 'Dr. Maya Lee',
        role: StaffRole.VET,
        specialty: 'General check-up and vaccinations',
        availableDays: ['Monday', 'Wednesday', 'Friday'],
        startTime: '09:00',
        endTime: '13:00',
        status: StaffStatus.AVAILABLE,
      },
      {
        name: 'Dr. Aaron Tan',
        role: StaffRole.VET,
        specialty: 'Skin allergies and senior pet care',
        availableDays: ['Tuesday', 'Thursday'],
        startTime: '14:00',
        endTime: '18:00',
        status: StaffStatus.AVAILABLE,
      },
      {
        name: 'Nora Groom',
        role: StaffRole.GROOMER,
        specialty: 'Full grooming and de-matting',
        availableDays: ['Monday', 'Tuesday', 'Saturday'],
        startTime: '10:00',
        endTime: '17:00',
        status: StaffStatus.AVAILABLE,
      },
      {
        name: 'Ben Lee',
        role: StaffRole.GROOMER,
        specialty: 'Bath, nail trim, and hygiene cut',
        availableDays: ['Wednesday', 'Friday', 'Sunday'],
        startTime: '11:00',
        endTime: '16:00',
        status: StaffStatus.BUSY,
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
