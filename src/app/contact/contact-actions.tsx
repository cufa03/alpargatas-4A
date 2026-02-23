'use client';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function ContactActions(props: {
  template: string;
  whatsappUrl: string;
}) {
  return (
    <div className='flex flex-col gap-2 sm:flex-row'>
      <Button
        type='button'
        variant='outline'
        onClick={async () => {
          await navigator.clipboard.writeText(props.template);
          toast.success('Mensaje copiado');
        }}
      >
        Copiar mensaje
      </Button>
      <Button asChild>
        <a href={props.whatsappUrl} target='_blank' rel='noreferrer'>
          Consultar por WhatsApp
        </a>
      </Button>
    </div>
  );
}
