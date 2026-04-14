import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            // Using announcements as notifications per the requirement
            const response = await fetch('/api/announcements/all');
            const data = await response.json();
            if (response.ok) {
                const list = data.announcements || [];
                setNotifications(list.slice(0, 5)); // Just show the top 5
                
                // Simple logic: if there's a notification from the last 24 hours, count as unread
                const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                const unread = list.some(n => new Date(n.createdAt) > oneDayAgo);
                setHasUnread(unread);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        // Poll every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setHasUnread(false); // Clear red dot when opening
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={toggleDropdown}
                className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all relative group"
                aria-label="Notifications"
            >
                <svg className={`w-5 h-5 text-secondary group-hover:text-primary transition-colors ${isOpen ? 'text-primary' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                {hasUnread && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden z-[100] animate-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-border bg-gray-50 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Updates & Notices</h3>
                        <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">Recent</span>
                    </div>
                    
                    <div className="max-h-[350px] overflow-y-auto">
                        {loading && notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                <p className="text-[10px] font-bold text-secondary uppercase">Checking for updates...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-10 text-center">
                                <p className="text-sm font-bold text-gray-400">No new updates</p>
                                <p className="text-[10px] text-secondary mt-1">We'll notify you when something happens.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((n) => (
                                    <div key={n.id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col gap-1">
                                            <h4 className="text-xs font-bold text-foreground line-clamp-1">{n.title}</h4>
                                            <p className="text-[11px] text-secondary font-semibold line-clamp-2 leading-relaxed italic">
                                                "{n.content}"
                                            </p>
                                            <span className="text-[9px] font-bold text-primary mt-1">
                                                {new Date(n.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="p-3 bg-gray-50 border-t border-border text-center">
                        <Link 
                            href="/dashboard" 
                            className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
                            onClick={() => setIsOpen(false)}
                        >
                            View All Messages
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationBell;
