import { auth } from '../../auth';
import ProductsManager from './products-manager';

export default async function ProductsPage() {
  const session = await auth();
  const role = session?.user?.role as string | undefined;

  return <ProductsManager role={role} />;
}
