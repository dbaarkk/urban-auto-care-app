'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const { user, isLoading } = useAuth();
  const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        // Instant redirect when loading is finished
        if (user) {
          router.replace('/home');
        } else {
          router.replace('/signup');
        }
        setShow(false);
      }
    }, [isLoading, user, router]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative"
      >
        <Image
          src="/urban-auto-logo.jpg"
          alt="Urban Auto"
          width={120}
          height={120}
          className="rounded-2xl shadow-xl"
          priority
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-6 text-center"
      >
        <h1 className="text-2xl font-bold text-gray-900">
          URBAN <span className="text-primary">AUTO</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1 tracking-widest uppercase">Raipur</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-20"
      >
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </motion.div>
    </div>
  );
}
