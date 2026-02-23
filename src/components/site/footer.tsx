import Link from 'next/link';

export function Footer() {
  return (
    <footer className='border-t'>
      <div className='mx-auto max-w-6xl px-4 py-10 text-sm text-muted-foreground'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
          <p>
            © {new Date().getFullYear()} Fábrica de Alpargatas. Venta mayorista.
          </p>
          <div className='flex items-center gap-4'>
            <Link href='/stock' className='hover:text-foreground'>
              Catálogo
            </Link>
            <Link href='/about' className='hover:text-foreground'>
              Nosotros
            </Link>
            <Link href='/contact' className='hover:text-foreground'>
              Contacto
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
