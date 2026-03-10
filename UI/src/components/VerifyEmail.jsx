import { useState } from 'react';
import { Mail, RefreshCw } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function VerifyEmail({ email, onBackToLogin }) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');

  const handleResend = async () => {
    setError('');
    setResending(true);
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    setResending(false);
    if (resendError) {
      setError(resendError.message);
      return;
    }
    setResent(true);
    setTimeout(() => setResent(false), 5000);
  };

  const handleBackToLogin = async () => {
    await supabase.auth.signOut();
    onBackToLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-4">
      <div className="w-full max-w-md bg-[#1E293B] rounded-2xl shadow-2xl p-10 text-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-[#E5A823]/20 flex items-center justify-center mx-auto mb-6">
          <Mail size={28} className="text-[#E5A823]" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-white mb-3">Check your email</h1>
        <p className="text-[#94A3B8] text-sm mb-2">
          We sent a verification link to
        </p>
        <p className="text-white font-medium text-sm mb-6">
          {email}
        </p>
        <p className="text-[#94A3B8] text-sm mb-8">
          Please confirm your account before using SJSU Copilot.
        </p>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        {/* Success */}
        {resent && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 text-green-400 text-sm mb-4">
            Verification email resent! Check your inbox.
          </div>
        )}

        {/* Resend Button */}
        <button
          onClick={handleResend}
          disabled={resending}
          className="w-full flex items-center justify-center gap-2 bg-[#E5A823] hover:bg-[#D49612] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors shadow-lg shadow-[#E5A823]/20 mb-4"
        >
          <RefreshCw size={16} className={resending ? 'animate-spin' : ''} />
          {resending ? 'Sending...' : 'Resend verification email'}
        </button>

        {/* Back to Login */}
        <button
          onClick={handleBackToLogin}
          className="w-full text-[#94A3B8] hover:text-white text-sm font-medium py-2 transition-colors"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
