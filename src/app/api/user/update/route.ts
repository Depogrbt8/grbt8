import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logger';

// Form tarafında bazı alanlar number olarak gelebiliyor; string'e dönüştür.
const numberLikeToString = z
  .union([z.string(), z.number()])
  .transform((v) => (typeof v === 'number' ? String(v) : v))
  .optional();

const updateUserSchema = z.object({
  firstName: z.string().min(2, "Ad en az 2 karakter olmalıdır.").optional(),
  lastName: z.string().min(2, "Soyad en az 2 karakter olmalıdır.").optional(),
  countryCode: z.string().optional(),
  phone: z.string().optional(),
  birthDay: numberLikeToString,
  birthMonth: numberLikeToString,
  birthYear: numberLikeToString,
  gender: z.string().optional(),
  identityNumber: z.string().optional(),
  isForeigner: z.boolean().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
});

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    const validation = updateUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const dataToUpdate = validation.data;

    // Prisma transaction kullanarak User ve ilgili ana Passenger kaydını güncelle
    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: dataToUpdate,
      });

      await tx.passenger.updateMany({
        where: {
          userId: userId,
          isAccountOwner: true,
        },
        data: {
          ...(dataToUpdate.firstName ? { firstName: dataToUpdate.firstName } : {}),
          ...(dataToUpdate.lastName ? { lastName: dataToUpdate.lastName } : {}),
          ...(dataToUpdate.phone ? { phone: dataToUpdate.phone } : {}),
          ...(dataToUpdate.countryCode ? { countryCode: dataToUpdate.countryCode } : {}),
          ...(dataToUpdate.birthDay ? { birthDay: dataToUpdate.birthDay } : {}),
          ...(dataToUpdate.birthMonth ? { birthMonth: dataToUpdate.birthMonth } : {}),
          ...(dataToUpdate.birthYear ? { birthYear: dataToUpdate.birthYear } : {}),
          ...(dataToUpdate.gender ? { gender: dataToUpdate.gender } : {}),
          ...(dataToUpdate.identityNumber ? { identityNumber: dataToUpdate.identityNumber } : {}),
          ...(typeof dataToUpdate.isForeigner === 'boolean' ? { isForeigner: dataToUpdate.isForeigner } : {}),
        },
      });

      return user;
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    logger.error('Kullanıcı güncelleme hatası', { error });
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
} 