'use server';
 
import { signIn } from '../../auth';
import { AuthError } from 'next-auth';
import { z } from 'zod';
import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
 
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Email ou senha incorretos.';
        default:
          return 'Ocorreu um erro. Tente novamente.';
      }
    }
    throw error;
  }
}

const CreateUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'STAFF', 'COZINHA']),
});

export async function createUser(formData: FormData) {
  const validatedFields = CreateUserSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Campos obrigatórios faltando. Falha ao criar usuário.',
    };
  }

  const { name, email, password, role } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });
  } catch (error) {
    return {
      message: 'Erro no banco de dados: Falha ao criar usuário.',
    };
  }

  revalidatePath('/admin/users');
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    });
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    return { error: 'Falha ao excluir usuário.' };
  }
}

export async function updateUser(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as string;
  const password = formData.get('password') as string;

  try {
    const data: any = { name, email, role };
    
    if (password && password.length >= 6) {
        data.password = await bcrypt.hash(password, 10);
    }

    await prisma.user.update({
      where: { id },
      data,
    });
    
    revalidatePath('/admin/users');
    return { success: true, message: 'Usuário atualizado com sucesso!' };
  } catch (error) {
    return { error: 'Falha ao atualizar usuário.' };
  }
}

export async function updateOrderItemStatus(itemId: number, newStatus: string) {
  try {
    await prisma.orderItem.update({
      where: { id: itemId },
      data: { status: newStatus },
    });
    revalidatePath('/cozinha');
    revalidatePath('/mesas');
    revalidatePath('/'); 
    return { success: true };
  } catch (error) {
    return { error: 'Erro ao atualizar status.' };
  }
}
