import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Boş stringleri undefined'a çeviren yardımcı
const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((val) => (val === '' ? undefined : val), schema.optional());

const updateUserSchema = z.object({
  firstName: emptyToUndefined(z.string().min(2, 'Ad en az 2 karakter olmalıdır.')),
  lastName: emptyToUndefined(z.string().min(2, 'Soyad en az 2 karakter olmalıdır.')),
  countryCode: emptyToUndefined(z.string()),
  phone: emptyToUndefined(z.string()),
  birthDay: emptyToUndefined(z.string()),
  birthMonth: emptyToUndefined(z.string()),
  birthYear: emptyToUndefined(z.string()),
  gender: emptyToUndefined(z.string()),
  identityNumber: emptyToUndefined(z.string()),
  isForeigner: z.boolean().optional(),
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
      const flat = validation.error.flatten();
      const firstMessage = Object.values(flat.fieldErrors).flat()[0] || 'Geçersiz istek.';
      return NextResponse.json({ error: firstMessage, details: flat.fieldErrors }, { status: 400 });
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
          firstName: dataToUpdate.firstName,
          lastName: dataToUpdate.lastName,
          phone: dataToUpdate.phone,
          countryCode: dataToUpdate.countryCode,
          birthDay: dataToUpdate.birthDay,
          birthMonth: dataToUpdate.birthMonth,
          birthYear: dataToUpdate.birthYear,
          gender: dataToUpdate.gender,
          identityNumber: dataToUpdate.identityNumber,
          isForeigner: dataToUpdate.isForeigner,
        },
      });

      return user;
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
} 