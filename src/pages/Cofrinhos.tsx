import CofrinhoPanel from '@/components/CofrinhoPanel';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Cofrinhos() {
    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link to="/">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Cofrinhos</h1>
                </div>
                <CofrinhoPanel />
            </div>
        </div>
    );
}
