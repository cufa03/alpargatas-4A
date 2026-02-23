import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Navbar() {
  return (
    <header className='border-b bg-amber-500/20'>
      <div className='mx-auto flex h-16 max-w-6xl items-center justify-between px-4 '>
        <Link href='/' className='font-semibold'>
          Fábrica de Alpargatas <span className='font-black font-bolt'>4A</span>
        </Link>

        <nav className='flex items-center gap-2'>
          <Button asChild className='hidden sm:inline-flex'>
            <Link href='/stock'>Catálogo</Link>
          </Button>
          <Button asChild variant='ghost' className='hidden sm:inline-flex'>
            <Link href='/about'>Nosotros</Link>
          </Button>
          <Button asChild variant='ghost' className='hidden sm:inline-flex'>
            <Link href='/contact'>Contacto</Link>
          </Button>
          {/* <Button asChild>
            <Link href='/stock'>Ver stock</Link>
          </Button> */}
        </nav>
      </div>
    </header>
  );
}
