import { Code2 } from 'lucide-react';
import { LoginForm } from '../components/auth/LoginForm';

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
            <Code2 size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Sign in to CodeAssist</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Your AI-powered coding companion</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
