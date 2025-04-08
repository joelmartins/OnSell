import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardFooter } from '@/Components/ui/card';
import { cn } from "@/lib/utils";

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <div className="mb-6 w-full max-w-md text-center">
                <Link href="/" className="text-4xl font-bold text-primary">
                    OnSell
                </Link>
            </div>

            <Card className="w-full max-w-md">
                <CardContent className="px-6 pt-6 pb-4">
                    {children}
                </CardContent>
            </Card>
            
            <div className="mt-4 text-sm text-muted-foreground">
                © {new Date().getFullYear()} OnSell. Todos os direitos reservados.
            </div>
        </div>
    );
}
