import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/auth';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    // Redirect to dashboard or home page after successful login
    navigate('/home');
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Subtle decorative background accents */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-br from-accent-pink to-brand-300 opacity-50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-tr from-accent-cream to-accent-pink opacity-50 blur-3xl" />

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-400 shadow-md flex items-center justify-center">
            <span className="text-white text-2xl font-bold tracking-tight">C</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900 tracking-tight">CEMS</h1>
          <p className="text-gray-500 text-sm mt-1">College Event Management System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 pt-8 pb-2">
            <h2 className="text-xl font-semibold text-gray-900">Welcome back</h2>
            <p className="text-sm text-gray-500 mt-1">Sign in to continue to your account</p>
          </div>
          <div className="px-8 pb-8 pt-4">
            <LoginForm onSuccess={handleLoginSuccess} />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} CEMS. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
