import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Nosotros</h1>
        <p className='text-muted-foreground'>
          Contenido estático editable (placeholder).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiénes somos</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3 text-muted-foreground'>
          <p>
            Somos una fábrica de alpargatas enfocada en ventas mayoristas.
            Trabajamos con producción por escala y ofrecemos distintas líneas
            según necesidad.
          </p>
          <p>
            Este texto es un placeholder: podés reemplazarlo con la historia
            real, capacidad de producción, materiales y tiempos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
