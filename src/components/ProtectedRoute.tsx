import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isSubscribed, isLoading } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isSubscribed) {
      navigate('/pricing');
    }
  }, [isLoading, isSubscribed, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!isSubscribed) {
    return null;
  }

  return <>{children}</>;
}
