import AgencyLayout from '@/Layouts/AgencyLayout';
import { Head } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/Components/ui/form';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { useEffect } from 'react';
import { PhoneInput } from '@/Components/ui/phone-input';

export default function Edit({ auth }) {
    const user = auth?.user;
    const form = useForm({
        mode: 'onBlur',
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            password: '',
            password_confirmation: '',
        },
    });

    useEffect(() => {
        form.reset({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            password: '',
            password_confirmation: '',
        });
    }, [user]);

    const onSubmit = (values) => {
        const payload = { ...values };
        if (!payload.password) {
            delete payload.password;
            delete payload.password_confirmation;
        }
        window.Inertia.patch(route('agency.settings.update-profile'), payload);
    };

    return (
        <AgencyLayout title="Perfil">
            <Head title="Perfil" />
            <div className="py-12 px-4 sm:px-6 lg:px-8 w-full">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Seus Dados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    rules={{ required: 'O nome é obrigatório.' }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Seu nome completo *</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Seu nome completo" required autoComplete="name" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    rules={{ required: 'O e-mail é obrigatório.' }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Seu e-mail *</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="email" placeholder="seu@email.com" required autoComplete="username" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    rules={{
                                        validate: (value) => {
                                            const digits = (value || '').replace(/\D/g, '');
                                            if (digits.length > 9) return 'O telefone deve ter no máximo 9 dígitos.';
                                            return true;
                                        },
                                    }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Seu telefone</FormLabel>
                                            <FormControl>
                                                <PhoneInput
                                                    id="phone"
                                                    name="phone"
                                                    value={field.value}
                                                    country={form.watch('country_code') || '+55'}
                                                    onValueChange={val => form.setValue('phone', val, { shouldValidate: true })}
                                                    onCountryChange={val => form.setValue('country_code', val)}
                                                    placeholder="(11) 91234-5678"
                                                    error={form.formState.errors.phone?.message}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    rules={{
                                        validate: (value) => {
                                            if (value && value.length < 6) return 'A senha deve ter pelo menos 6 caracteres.';
                                            return true;
                                        },
                                    }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Senha de acesso</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="password" placeholder="Senha de acesso" autoComplete="new-password" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password_confirmation"
                                    rules={{
                                        validate: (value) => {
                                            if (form.watch('password') && !value) return 'Confirme a senha.';
                                            if (value && value !== form.watch('password')) return 'As senhas não coincidem.';
                                            return true;
                                        },
                                    }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirme a senha</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="password" placeholder="Repita a senha" autoComplete="new-password" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex items-center gap-4">
                                    <Button type="submit" disabled={form.formState.isSubmitting}>Salvar</Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </AgencyLayout>
    );
}
