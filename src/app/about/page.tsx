import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Sobre Nosotros</h1>
        <p className='text-muted-foreground'>Fabrica de alpargatas.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiénes somos</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3 text-muted-foreground'>
          <p>
            Somos una fábrica de alpargatas dedicada a la venta mayorista.
            Trabajamos con producción a escala y desarrollamos distintas líneas
            según la necesidad de cada cliente.
          </p>
          <p>
            Nos enfocamos especialmente en la fabricación de alpargatas comunes
            y reforzadas, con base de goma EVA y con base de PVC.
          </p>
          <p>
            Brindamos atención directa, sin intermediarios, para ofrecer un
            trato más ágil y personalizado. No dude en contactarnos para
            resolver sus consultas. ¡Estamos listos para tomar su pedido!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
