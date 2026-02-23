'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { syncSessionCookie, clearSessionCookie } from '@/lib/auth/session';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginValues = z.infer<typeof loginSchema>;

export function AdminLoginClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get('next') || '/admin';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const formError = useMemo(() => {
    const { errors } = form.formState;
    return errors.email?.message || errors.password?.message || null;
  }, [form.formState]);

  return (
    <div className='mx-auto max-w-md space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Ingresar (admin)</h1>
        <p className='text-muted-foreground'>
          Acceso restringido a un único usuario.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className='space-y-4'
            onSubmit={form.handleSubmit(async (values) => {
              setIsSubmitting(true);
              try {
                await clearSessionCookie().catch(() => undefined);
                const cred = await signInWithEmailAndPassword(
                  getFirebaseAuth(),
                  values.email,
                  values.password,
                );

                const idToken = await cred.user.getIdToken();
                const res = await fetch('/api/auth/session', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ idToken }),
                });

                if (!res.ok) {
                  await signOut(getFirebaseAuth());
                  await clearSessionCookie().catch(() => undefined);
                  toast.error('No autorizado: usuario no permitido');
                  return;
                }

                await syncSessionCookie().catch(() => undefined);
                toast.success('Bienvenido');
                router.replace(next);
              } catch (e) {
                console.error('Error al iniciar sesion:', e);
                toast.error('No se pudo iniciar sesión');
              } finally {
                setIsSubmitting(false);
              }
            })}
          >
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input id='email' type='email' {...form.register('email')} />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>Contraseña</Label>
              <Input
                id='password'
                type='password'
                {...form.register('password')}
              />
            </div>

            {formError ? (
              <p className='text-sm text-destructive'>{formError}</p>
            ) : null}

            <Button type='submit' className='w-full' disabled={isSubmitting}>
              {isSubmitting ? 'Ingresando…' : 'Ingresar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
