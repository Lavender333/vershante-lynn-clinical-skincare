import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Clock, Video, User, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { ConsultationSlot, OperatingHours } from '../types';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { format, addDays, startOfToday, parse, addMinutes, isBefore } from 'date-fns';

const DEFAULT_OPERATING_HOURS: OperatingHours = {
  id: 'default',
  days: {
    'Monday':    { open: '09:00', close: '17:00', closed: false },
    'Tuesday':   { open: '09:00', close: '17:00', closed: false },
    'Wednesday': { open: '09:00', close: '17:00', closed: false },
    'Thursday':  { open: '09:00', close: '17:00', closed: false },
    'Friday':    { open: '09:00', close: '17:00', closed: false },
    'Saturday':  { open: '10:00', close: '14:00', closed: false },
    'Sunday':    { open: '00:00', close: '00:00', closed: true },
  }
};

export default function BookingCalendar({ onBook, initialDate }: { onBook: (slot: ConsultationSlot) => void, initialDate?: string }) {
  const [selectedDate, setSelectedDate] = useState(initialDate || format(startOfToday(), 'yyyy-MM-dd'));
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [operatingHours, setOperatingHours] = useState<OperatingHours>(DEFAULT_OPERATING_HOURS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHours() {
      try {
        const docRef = doc(db, 'settings', 'operatingHours');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOperatingHours(docSnap.data() as OperatingHours);
        }
        // Falls back to DEFAULT_OPERATING_HOURS if doc doesn't exist or user is unauthenticated
      } catch (error) {
        // Permission denied or network error — use defaults
        console.info('Using default operating hours.', error);
      } finally {
        setLoading(false);
      }
    }
    fetchHours();
  }, []);

  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(startOfToday(), i));
    }
    return dates;
  };

  const generateSlotsForDate = (date: Date) => {
    if (!operatingHours) return [];
    const dayName = format(date, 'EEEE');
    const schedule = operatingHours.days[dayName];
    
    if (!schedule || schedule.closed) return [];

    const slots: ConsultationSlot[] = [];
    let currentTime = parse(schedule.open, 'HH:mm', date);
    const endTime = parse(schedule.close, 'HH:mm', date);

    while (isBefore(currentTime, endTime)) {
      const timeStr = format(currentTime, 'hh:mm a');
      slots.push({
        id: `${format(date, 'yyyy-MM-dd')}-${timeStr}`,
        date: format(date, 'yyyy-MM-dd'),
        time: timeStr,
        type: 'Virtual',
        available: true
      });
      currentTime = addMinutes(currentTime, 60); // 1 hour slots
    }
    return slots;
  };

  const dates = generateDates();
  const availableSlots = generateSlotsForDate(new Date(selectedDate));

  const handleBooking = () => {
    const slot = availableSlots.find(s => s.id === selectedSlot);
    if (slot) onBook(slot);
  };

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <div className="w-12 h-12 border-4 border-brand-terracotta border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl border border-brand-sand overflow-hidden">
      <div className="grid md:grid-cols-2">
        {/* Date Selection */}
        <div className="p-12 bg-brand-cream/50 border-r border-brand-sand space-y-8">
          <div className="space-y-2">
            <h3 className="text-2xl font-serif text-brand-slate italic">Select a Date</h3>
            <p className="text-xs uppercase tracking-widest text-brand-moss font-bold opacity-60">Consultation Phase 02</p>
          </div>
          
          <div className="space-y-3">
            {dates.map(date => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const dayName = format(date, 'EEEE');
              const dayNum = format(date, 'd');
              const month = format(date, 'MMM');

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={cn(
                    "w-full p-6 rounded-2xl border flex justify-between items-center transition-all group",
                    selectedDate === dateStr 
                      ? "bg-brand-moss text-white border-brand-moss shadow-xl" 
                      : "bg-white border-brand-sand hover:border-brand-moss text-brand-slate"
                  )}
                >
                  <div className="text-left">
                    <p className="text-[10px] uppercase tracking-widest font-black opacity-60">{month}</p>
                    <p className="text-2xl font-serif italic">{dayNum}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-xs font-bold uppercase", selectedDate === dateStr ? "text-brand-sand" : "text-brand-moss")}>
                      {dayName}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Selection */}
        <div className="p-12 space-y-8 relative">
          <div className="space-y-2">
            <h3 className="text-2xl font-serif text-brand-slate italic">Available Windows</h3>
            <p className="text-xs uppercase tracking-widest text-brand-moss font-bold opacity-60">Clinical Availability</p>
          </div>

          <div className="space-y-3">
            {availableSlots.length > 0 ? availableSlots.map(slot => (
              <button
                key={slot.id}
                onClick={() => setSelectedSlot(slot.id)}
                className={cn(
                  "w-full p-4 rounded-xl border flex items-center justify-between transition-all",
                  selectedSlot === slot.id
                    ? "bg-brand-terracotta text-white border-brand-terracotta shadow-lg"
                    : "bg-brand-cream/30 border-brand-sand hover:border-brand-terracotta text-brand-slate"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    selectedSlot === slot.id ? "bg-white/20" : "bg-brand-sand/50"
                  )}>
                    {slot.type === 'Virtual' ? <Video size={16} /> : <User size={16} />}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold">{slot.time}</p>
                    <p className="text-[9px] uppercase tracking-widest opacity-60">{slot.type} Session</p>
                  </div>
                </div>
                {selectedSlot === slot.id && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
              </button>
            )) : (
              <div className="py-12 text-center space-y-4">
                <CalendarIcon className="mx-auto text-brand-sand" size={32} />
                <p className="text-brand-moss/40 text-xs italic font-serif">"Clinical synchronization currently offline for this date."</p>
              </div>
            )}
          </div>

          <div className="pt-8 mt-8 border-t border-brand-sand">
            <button
              onClick={handleBooking}
              disabled={!selectedSlot}
              className="w-full bg-brand-slate text-white py-4 rounded-full font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brand-moss transition-all shadow-xl group"
            >
              Confirm Consultation
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="absolute top-4 right-4 opacity-10 pointer-events-none">
            <Clock size={48} />
          </div>
        </div>
      </div>
    </div>
  );
}
