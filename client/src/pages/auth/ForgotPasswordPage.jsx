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
      <div className="flex flex-col items-center text-center animate-fade-in py-4 w-full">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 shadow-sm">
          <HiCheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed max-w-sm">
          If an account exists for this email, you will receive reset instructions shortly.
        </p>
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors"
        >
          <HiArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Forgot Password</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Enter your account email to receive reset instructions</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          iconLeft={HiEnvelope}
          disabled={isLoading}
          error={errors.email?.message}
          {...register('email')}
        />
        <Button 
          type="submit" 
          variant="primary" 
          size="lg" 
          isLoading={isLoading} 
          disabled={isLoading}
          className="w-full mt-4 font-bold text-sm shadow-md"
        >
          {isLoading ? 'Sending Instructions...' : 'Send Reset Instructions'}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <Link 
          to="/login" 
          className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <HiArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
