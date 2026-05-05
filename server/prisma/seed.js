import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("password123", 10);

  const owner = await prisma.user.create({
    data: {
      email: "owner@test.com",
      name: "Owner User",
      password
    }
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@test.com",
      name: "Admin User",
      password
    }
  });

  const member1 = await prisma.user.create({
    data: {
      email: "member1@test.com",
      name: "Member One",
      password
    }
  });

  const member2 = await prisma.user.create({
    data: {
      email: "member2@test.com",
      name: "Member Two",
      password
    }
  });

  const outsider = await prisma.user.create({
    data: {
      email: "outsider@test.com",
      name: "Outsider User",
      password
    }
  });

  const project = await prisma.project.create({
    data: {
      name: "Core Project",
      description: "Main testing project",
      createdBy: owner.id
    }
  });

  await prisma.projectMember.createMany({
    data: [
      {
        userId: owner.id,
        projectId: project.id,
        role: "OWNER"
      },
      {
        userId: admin.id,
        projectId: project.id,
        role: "ADMIN"
      },
      {
        userId: member1.id,
        projectId: project.id,
        role: "MEMBER"
      },
      {
        userId: member2.id,
        projectId: project.id,
        role: "MEMBER"
      }
    ]
  });

  const now = new Date();
  const pastDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const futureDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  await prisma.task.createMany({
    data: [
      {
        title: "Setup backend",
        description: "Initial backend setup",
        projectId: project.id,
        assignedTo: admin.id,
        status: "DONE",
        dueDate: pastDate
      },
      {
        title: "Design schema",
        projectId: project.id,
        assignedTo: member1.id,
        status: "IN_PROGRESS",
        dueDate: futureDate
      },
      {
        title: "Implement auth",
        projectId: project.id,
        assignedTo: member1.id,
        status: "TODO",
        dueDate: futureDate
      },
      {
        title: "Fix bugs",
        projectId: project.id,
        assignedTo: member2.id,
        status: "TODO",
        dueDate: pastDate
      },
      {
        title: "Write docs",
        projectId: project.id,
        assignedTo: member2.id,
        status: "IN_PROGRESS",
        dueDate: futureDate
      }
    ]
  });

  console.log("Seeding completed");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });