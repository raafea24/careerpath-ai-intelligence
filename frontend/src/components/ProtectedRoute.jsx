import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
 import { supabase } from "../../supabaseClient";

export default function ProtectedRoute() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    // Still checking session, show loading
    return <div>Loading...</div>;
  }
  if (!session) {
    // Not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }
  // Logged in, show the protected page
  return <Outlet />;
}
