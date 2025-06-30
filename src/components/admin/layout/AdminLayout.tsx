
"use client";
import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Toaster } from "@/components/ui/toaster";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // En móviles, el navbar se muestra solo cuando el sidebar está cerrado
  const showNavbar = isMobile ? !isSidebarOpen : true;
  const sidebarWidth = isSidebarOpen ? (isMobile ? '100%' : '16rem') : '5rem';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex text-gray-200 overflow-hidden relative">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: isMobile ? '-100%' : 0, opacity: isMobile ? 0 : 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isMobile ? '-100%' : 0, opacity: isMobile ? 0 : 1 }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300
            }}
            className={`fixed inset-y-0 z-50 ${isMobile ? 'w-full' : 'w-64'}`}
          >
            <Sidebar 
              isOpen={isSidebarOpen} 
              onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
              isMobile={isMobile}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Overlay para móviles con transición mejorada */}
      <AnimatePresence>
        {isSidebarOpen && isMobile && (
          <motion.div
            key="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="fixed inset-0 bg-black z-40 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
            style={{
              pointerEvents: isSidebarOpen ? 'auto' : 'none',
              willChange: 'opacity'
            }}
          />
        )}
      </AnimatePresence>
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isSidebarOpen && !isMobile ? 'ml-64' : ''
      }`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}
            className="flex-1 flex flex-col"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              duration: 0.5
            }}
          >
            {/* Navbar que se oculta cuando el sidebar está abierto */}
            <AnimatePresence>
              {!isSidebarOpen && (
                <motion.div
                  key="navbar"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ 
                    opacity: 1,
                    y: 0,
                    transition: { 
                      delay: 0.2,
                      type: 'spring',
                      stiffness: 400,
                      damping: 30
                    }
                  }}
                  exit={{ 
                    opacity: 0, 
                    y: -20,
                    transition: { 
                      duration: 0.2
                    }
                  }}
                  className="z-40 w-full"
                  style={{
                    transformOrigin: 'top',
                    willChange: 'transform, opacity'
                  }}
                >
                  <Navbar 
                    isScrolled={isScrolled} 
                    onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                    isSidebarOpen={isSidebarOpen}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.main 
              className="flex-1 overflow-y-auto p-4 md:p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.2,
                type: 'spring',
                stiffness: 400,
                damping: 30
              }}
            >
              <div className="max-w-7xl mx-auto w-full">
                <motion.div
                  className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
                  whileHover={{ scale: 1.005 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {children}
                </motion.div>
              </div>
            </motion.main>
          </motion.div>
        </AnimatePresence>
      </div>
      
      <Toaster />
    </div>
  );
}
