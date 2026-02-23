import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AdminLogoutButton } from '@/components/admin/logout-button';

export function AdminShell(props: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-semibold'>{props.title}</h1>
          <p className='text-sm text-muted-foreground'>Panel interno (admin)</p>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <Button asChild variant='outline'>
            <Link href='/admin'>Dashboard</Link>
          </Button>
          <Button asChild variant='outline'>
            <Link href='/admin/products'>Productos</Link>
          </Button>
          <AdminLogoutButton />
        </div>
      </div>
      <Separator />
      {props.children}
    </div>
  );
}
