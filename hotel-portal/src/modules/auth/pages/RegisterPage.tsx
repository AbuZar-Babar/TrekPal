import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, User, MapPin, FileText, Loader2, Upload, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../../api/axios';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Owner name is required'),
  hotelName: z.string().min(2, 'Hotel name is required'),
  hotelAddress: z.string().min(10, 'Complete address is required'),
  hotelDescription: z.string().min(20, 'Description should be at least 20 characters'),
  phoneNumber: z.string().min(10, 'Valid phone number is required'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationImage, setLocationImage] = useState<File | null>(null);
  const [businessDoc, setBusinessDoc] = useState<File | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    if (!locationImage || !businessDoc) {
      setError('Please upload both location image and business document');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('name', data.hotelName);
    formData.append('phone', data.phoneNumber);
    formData.append('address', data.hotelAddress);
    formData.append('location', data.hotelAddress.split(',').pop()?.trim() || data.hotelAddress);
    formData.append('description', data.hotelDescription);
    formData.append('locationImage', locationImage);
    formData.append('businessDoc', businessDoc);

    try {
      await api.post('/auth/register/hotel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Registration Successful!</h2>
          <p className="text-slate-600 mb-6">
            Your application has been submitted to TrekPal Admin for approval. You will be able to log in once your hotel is approved.
          </p>
          <p className="text-sm text-slate-400">Redirecting to login page...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-max-w-md text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-primary-600 p-3 rounded-2xl shadow-lg shadow-primary-200">
            <Building2 className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900">Hotel Partner Program</h2>
        <p className="mt-2 text-slate-600">Register your hotel and reach thousands of travelers</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Owner Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary-500" /> Owner Information
                </h3>
                <div>
                  <label className="label">Full Name</label>
                  <div className="relative">
                    <input {...register('name')} className="input-field pl-10" placeholder="John Doe" />
                    <User className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <input {...register('email')} className="input-field pl-10" placeholder="john@example.com" />
                    <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <input type="password" {...register('password')} className="input-field pl-10" placeholder="••••••••" />
                    <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>
              </div>

              {/* Hotel Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary-500" /> Hotel Details
                </h3>
                <div>
                  <label className="label">Hotel Name</label>
                  <div className="relative">
                    <input {...register('hotelName')} className="input-field pl-10" placeholder="Grand Luxury Hotel" />
                    <Building2 className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  {errors.hotelName && <p className="text-red-500 text-xs mt-1">{errors.hotelName.message}</p>}
                </div>

                <div>
                  <label className="label">Phone Number</label>
                  <div className="relative">
                    <input {...register('phoneNumber')} className="input-field pl-10" placeholder="+92 300 1234567" />
                    <User className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
                </div>

                <div>
                  <label className="label">Address</label>
                  <div className="relative">
                    <input {...register('hotelAddress')} className="input-field pl-10" placeholder="Main Mall Road, Murree" />
                    <MapPin className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  {errors.hotelAddress && <p className="text-red-500 text-xs mt-1">{errors.hotelAddress.message}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Description</label>
                <textarea 
                  {...register('hotelDescription')} 
                  className="input-field min-h-[100px] py-3" 
                  placeholder="Tell us about your hotel, amenities, and surroundings..."
                />
                {errors.hotelDescription && <p className="text-red-500 text-xs mt-1">{errors.hotelDescription.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Document Uploads */}
              <div className="space-y-2">
                <label className="label">Location Image</label>
                <div className={`relative border-2 border-dashed rounded-xl p-4 transition-all ${locationImage ? 'border-green-200 bg-green-50' : 'border-slate-200 hover:border-primary-300 bg-slate-50'}`}>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setLocationImage(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center text-center">
                    {locationImage ? (
                      <>
                        <CheckCircle2 className="w-8 h-8 text-green-500 mb-1" />
                        <span className="text-xs font-medium text-green-700">{locationImage.name}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-slate-400 mb-1" />
                        <span className="text-xs text-slate-500 font-medium">Upload Exterior Photo</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="label">Business Document (PDF/Image)</label>
                <div className={`relative border-2 border-dashed rounded-xl p-4 transition-all ${businessDoc ? 'border-green-200 bg-green-50' : 'border-slate-200 hover:border-primary-300 bg-slate-50'}`}>
                  <input 
                    type="file" 
                    onChange={(e) => setBusinessDoc(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center text-center">
                    {businessDoc ? (
                      <>
                        <FileText className="w-8 h-8 text-green-500 mb-1" />
                        <span className="text-xs font-medium text-green-700">{businessDoc.name}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-slate-400 mb-1" />
                        <span className="text-xs text-slate-500 font-medium">Upload Registration Copy</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3 text-lg"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  'Create Hotel Account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
