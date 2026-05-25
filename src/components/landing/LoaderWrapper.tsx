'use client';

import { useEffect, useState } from 'react';
import AlchemicalLoader from '@/components/landing/AlchemicalLoader';

export default function LoaderWrapper() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 4600);
        return () => clearTimeout(timer);
    }, []);

    if (!loading) return null;

    return <AlchemicalLoader />;
}