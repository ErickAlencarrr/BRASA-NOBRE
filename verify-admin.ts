import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@brasanobre.com' },
    })
    
    if (user) {
      console.log('✅ Usuário Admin ENCONTRADO:', user.email, user.role);
    } else {
      console.log('❌ Usuário Admin NÃO ENCONTRADO.');
    }
  } catch (e) {
    console.error('❌ Erro ao conectar no banco:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
