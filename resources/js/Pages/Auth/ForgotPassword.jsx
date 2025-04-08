import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import GuestLayout from '@/Layouts/GuestLayout';
import { cn } from '@/lib/utils';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Recuperar Senha" />

            <div className="mb-4 text-sm text-muted-foreground">
                Esqueceu sua senha? Sem problemas. Apenas informe seu endereço de email
                e enviaremos um link de recuperação de senha que permitirá
                que você escolha uma nova.
            </div>

            {status && (
                <div className="mb-4 rounded-md bg-green-50 p-3 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            autoComplete="username"
                            autoFocus
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        {errors.email && (
                            <p className="text-sm font-medium text-destructive">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-end">
                        <Button type="submit" disabled={processing}>
                            Enviar Link de Recuperação
                        </Button>
                    </div>
                    
                    <div className="mt-2 text-center">
                        <Link
                            href={route('login')}
                            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-primary"
                        >
                            Voltar para o login
                        </Link>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
