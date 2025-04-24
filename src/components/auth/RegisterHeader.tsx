
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/common/Logo';

export const RegisterHeader = () => {
  return (
    <CardHeader className="space-y-1 text-center">
      <div className="flex justify-center mb-4">
        <Logo />
      </div>
      <CardTitle className="text-2xl font-playfair">Crie sua conta</CardTitle>
      <CardDescription>
        Esta funcionalidade não está disponível
      </CardDescription>
    </CardHeader>
  );
};
