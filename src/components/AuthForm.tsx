import React, { useState } from 'react';
import { Mail, Lock, User, Hash, X, Upload, Camera, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthFormProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
  onSignIn: (email: string, password: string) => Promise<any>;
  onSignUp: (email: string, password: string, profileData?: {
    full_name: string;
    age: number;
    bio: string;
    photo_url: string;
  }) => Promise<any>;
}

export function AuthForm({ isOpen, onClose, mode, onSignIn, onSignUp }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isSignUp = mode === 'signup';

  if (!isOpen) return null;

  const getSchoolFromEmail = (email: string) => {
    return email.toLowerCase().includes('stanford') ? 'Stanford GSB' : 'Harvard Business School';
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      
      setPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const uploadPhoto = async (userId: string): Promise<string | null> => {
    if (!photoFile) return null;
    
    setUploadingPhoto(true);
    try {
      // Create unique filename
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('profilepictures')
        .upload(fileName, photoFile);
      
      if (error) {
        console.error('Upload error:', error);
        return null;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profilepictures')
        .getPublicUrl(fileName);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    } finally {
      setUploadingPhoto(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      
      if (mode === 'signup') {
        // Validate required fields for signup
        if (!fullName.trim()) {
          setError('Full name is required');
          setLoading(false);
          return;
        }
        if (!age || parseInt(age) < 18 || parseInt(age) > 100) {
          setError('Please enter a valid age (18-100)');
          setLoading(false);
          return;
        }
        if (!email.includes('@stanford.edu') && !email.includes('@hbs.edu')) {
          setError('Please use your Stanford GSB (@stanford.edu) or Harvard Business School (@hbs.edu) email');
          setLoading(false);
          return;
        }
        if (!bio.trim()) {
          setError('Bio is required');
          setLoading(false);
          return;
        }
        if (bio.length > 500) {
          setError('Bio must be 500 characters or less');
          setLoading(false);
          return;
        }
        if (!photoFile) {
          setError('Photo is required');
          setLoading(false);
          return;
        }

        // First create the user account
        result = await onSignUp(email, password);
        
        if (result.error) {
          setError(result.error.message);
          setLoading(false);
          return;
        }
        
        // If user creation successful, upload photo and update profile
        if (result.data?.user) {
          const photoUrl = await uploadPhoto(result.data.user.id);
          
          if (!photoUrl) {
            setError('Failed to upload photo. Please try again.');
            setLoading(false);
            return;
          }
          
          // Update profile with photo URL
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              photo_urls: [photoUrl],
              full_name: fullName.trim(),
              age: parseInt(age),
              bio: bio.trim(),
              school: getSchoolFromEmail(email)
            })
            .eq('id', result.data.user.id);
            
          if (updateError) {
            console.error('Error updating profile:', updateError);
            setError('Profile created but failed to update photo. Please try again.');
            setLoading(false);
            return;
          }
        }
      } else {
        result = await onSignIn(email, password);
        
        if (result.error) {
          setError(result.error.message);
        }
      }

      if (!result.error) {
        onClose();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLegacySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      
      if (mode === 'signup') {
        // Legacy flow for when Supabase isn't configured
        const profileData = {
          full_name: fullName.trim(),
          age: parseInt(age),
          bio: bio.trim(),
          photo_url: photoPreview || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
        };

        result = await onSignUp(email, password, profileData);
      } else {
        result = await onSignIn(email, password);
      }

      if (result.error) {
        setError(result.error.message);
      } else {
        onClose();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-center text-white">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Heart className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {mode === 'signup' ? 'Join YachtWeek' : 'Welcome Back'}
          </h1>
          <p className="text-blue-100">Stanford GSB × Harvard Business School</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your.email@stanford.edu"
                  required
                />
              </div>
              {isSignUp && email && (
                <p className="text-sm text-gray-600 mt-1">
                  School: {getSchoolFromEmail(email)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="25"
                      min="18"
                      max="100"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio <span className="text-gray-500">({bio.length}/500)</span>
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Tell us about yourself and what you're looking forward to on yacht week..."
                    rows={3}
                    maxLength={500}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Photo
                  </label>
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      id="photo-upload"
                      required
                    />
                    <label
                      htmlFor="photo-upload"
                      className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    >
                      <div className="text-center">
                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-600">
                          {photoFile ? photoFile.name : 'Click to upload photo'}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    </label>
                    {photoPreview && (
                      <div className="flex justify-center">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-24 h-24 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || uploadingPhoto}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50"
            >
              {loading || uploadingPhoto ? 
                (uploadingPhoto ? 'Uploading Photo...' : 'Loading...') : 
                (mode === 'signup' ? 'Create Account' : 'Sign In')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}