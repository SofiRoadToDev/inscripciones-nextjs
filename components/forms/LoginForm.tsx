'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validations/auth.schema';
import { loginAction } from '@/lib/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function LoginForm() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginInput) => {
        setLoading(true);
        setError(null);
        try {
            const result = await loginAction(data);
            if (result?.error) {
                setError(result.error);
                setLoading(false);
            }
        } catch (err) {
            setError('Ocurrió un error inesperado');
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-md border-primary-100 shadow-2xl">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-3xl font-display text-primary-900">Portal Administrativo</CardTitle>
                <CardDescription className="text-primary-600">
                    Inicie sesión para gestionar las inscripciones
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-primary-900">Correo Electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="admin@colegio.edu"
                            {...register('email')}
                            className="border-primary-100 focus-visible:ring-primary-500"
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" title="Contraseña" className="text-primary-900">Contraseña</Label>
                        <Input
                            id="password"
                            type="password"
                            {...register('password')}
                            className="border-primary-100 focus-visible:ring-primary-500"
                        />
                        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        type="submit"
                        className="w-full bg-primary-500 hover:bg-primary-600 text-white py-6 text-lg"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Acceder al Panel'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
