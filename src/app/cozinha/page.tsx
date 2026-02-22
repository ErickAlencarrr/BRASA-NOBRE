import { auth } from '../../auth';
import KitchenManager from './kitchen-manager';

export default async function KitchenPage() {
  const session = await auth();
  const role = session?.user?.role as string | undefined;

  return <KitchenManager role={role} />;
}
