import { SessionSync } from '@/components/admin/session-sync';

export default function AdminProtectedLayout(props: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SessionSync />
      {props.children}
    </>
  );
}
