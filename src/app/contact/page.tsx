import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getClientEnv } from '@/lib/env';
import { ContactActions } from '@/app/contact/contact-actions';

export const dynamic = 'force-dynamic';

function buildWhatsappUrl(message: string) {
  const env = getClientEnv();
  const text = encodeURIComponent(message);
  const number = env.NEXT_PUBLIC_WHATSAPP_NUMBER.replace(/^\+/, '');
  return `https://wa.me/${number}?text=${text}`;
}

export default function ContactPage() {
  const template =
    'Hola! Quiero comprar al por mayor. ¿Me comparten disponibilidad, mínimo de compra y tiempos de entrega?';

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Contacto</h1>
        <p className='text-muted-foreground'>Ventas mayoristas únicamente.</p>
      </div>

      <div className='grid gap-4 lg:grid-cols-2'>
        {/* CARD de contacto */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Datos de contacto</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2 text-sm text-muted-foreground'>
            <p>
              <span className='font-medium text-foreground'>Dirección:</span>{' '}
              (Completar)
            </p>
            <p>
              <span className='font-medium text-foreground'>Teléfono:</span>{' '}
              (Completar)
            </p>
            <p>
              <span className='font-medium text-foreground'>Email:</span>{' '}
              (Completar)
            </p>
          </CardContent>
        </Card> */}

        {/* CARD de como realizar un pedido */}
        <Card>
          <CardHeader>
            <CardTitle>Cómo pedir</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3 text-sm text-muted-foreground'>
            <p>1) Elegí los productos en el catálogo.</p>
            <p>2) Enviá tu consulta por WhatsApp.</p>
            <p>
              3) Te respondemos con disponibilidad, oden minima y tiempos de
              entrega.
            </p>
            <div className='rounded-md border bg-muted/30 p-3'>
              <p className='mb-2 text-xs font-medium text-foreground'>
                Mensaje sugerido
              </p>
              <p className='whitespace-pre-wrap text-sm'>{template}</p>
            </div>
            <ContactActions
              template={template}
              whatsappUrl={buildWhatsappUrl(template)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
