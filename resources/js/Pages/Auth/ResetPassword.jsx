import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import GuestLayout from '@/Layouts/GuestLayout';
import { cn } from '@/lib/utils';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Redefinir Senha" />

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
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        {errors.email && (
                            <p className="text-sm font-medium text-destructive">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            autoComplete="new-password"
                            autoFocus
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        {errors.password && (
                            <p className="text-sm font-medium text-destructive">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">Confirmar Senha</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                        />
                        {errors.password_confirmation && (
                            <p className="text-sm font-medium text-destructive">
                                {errors.password_confirmation}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-end">
                        <Button type="submit" disabled={processing}>
                            Redefinir Senha
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
