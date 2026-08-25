import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import authService from '../../services/authService';
import toast from 'react-hot-toast';
import { HiEnvelope, HiArrowLeft, HiCheckCircle } from 'react-icons/hi2';

const forgotSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data) => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      await authService.forgotPassword(data.email);
      setSubmitted(true);
      toast.success('Reset instructions generated');
    } catch {
      // Even on error, set submitted to true so we don't reveal email existence
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center animate-fade-in py-2">
        <div className="w-14 h-14 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-4">
          <HiCheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
        <p className="text-xs text-gray-300 mb-6 leading-relaxed max-w-xs">
          If an account exists for this email, you will receive reset instructions.
        </p>
        <Link 
          to="/login" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-400 hover:text-primary-300 transition-colors"
        >
          <HiArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Forgot Password</h1>
        <p className="mt-1 text-xs text-gray-400">Enter your account email to receive reset instructions</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          iconLeft={HiEnvelope}
          disabled={isLoading}
          error={errors.email?.message}
          className="bg-white/10 text-white placeholder-gray-500 border-white/10 focus:border-primary-500 focus:ring-primary-500/40"
          {...register('email')}
        />
        <Button 
          type="submit" 
          variant="primary" 
          size="lg" 
          isLoading={isLoading} 
          disabled={isLoading}
          className="w-full mt-2 font-semibold text-sm shadow-lg shadow-primary-600/30"
        >
          {isLoading ? 'Sending Instructions...' : 'Send Reset Instructions'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link 
          to="/login" 
          className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-200 transition-colors"
        >
          <HiArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
