import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const TypeformEmbed = () => {
    const router = useRouter();

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://embed.typeform.com/embed.js';
        script.id = 'typef_orm';
        document.body.appendChild(script);

        const timer = setTimeout(() => {
            router.push('/');
        }, 20000); 

        return () => {
            clearTimeout(timer);
            document.body.removeChild(script);
        };
    }, [router]);

    return (
        <div
            className="typeform-widget"
            data-url={process.env.NEXT_PUBLIC_TYPEFORM_URL}
            style={{ width: '100%', height: '90vh' }}
        ></div>
    );
};

export default TypeformEmbed;
