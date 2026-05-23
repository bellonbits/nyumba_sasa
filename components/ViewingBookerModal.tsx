"use client";

import { useState, useMemo } from "react";
import { Drawer } from "antd";
import { 
  Calendar, 
  Clock, 
  Compass, 
  Smartphone, 
  ShieldCheck, 
  Check, 
  X 
} from "lucide-react";
import { motion } from "framer-motion";

interface ViewingBookerModalProps {
  open: boolean;
  onClose: () => void;
  listingTitle: string;
  onBook: (bookingDetails: { date: string; time: string; type: "In-Person" | "Virtual" }) => void;
}

const TIME_SLOTS = [
  { time: "10:00 AM - 11:30 AM", period: "Morning", sub: "Perfect lighting" },
  { time: "2:00 PM - 3:30 PM", period: "Afternoon", sub: "Warm sun exposure" },
  { time: "4:30 PM - 6:00 PM", period: "Evening", sub: "Quiet neighborhood inspection" },
];

export default function ViewingBookerModal({ open, onClose, listingTitle, onBook }: ViewingBookerModalProps) {
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(0);
  const [tourType, setTourType] = useState<"In-Person" | "Virtual">("In-Person");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Compute next 5 days dynamically
  const dates = useMemo(() => {
    const list = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      let label = `${days[d.getDay()]} ${d.getDate()}`;
      let sub = months[d.getMonth()];
      
      if (i === 0) {
        label = "Today";
        sub = "Immediate";
      } else if (i === 1) {
        label = "Tomorrow";
        sub = "Fast Track";
      }
      
      list.push({
        dateStr: d.toLocaleDateString("en-KE", { weekday: "short", day: "numeric", month: "short" }),
        label,
        sub,
        rawDate: d.toISOString().split("T")[0],
      });
    }
    return list;
  }, []);

  const handleBooking = () => {
    setBookingSuccess(true);
    setTimeout(() => {
      onBook({
        date: dates[selectedDateIndex].dateStr,
        time: TIME_SLOTS[selectedTimeIndex].time,
        type: tourType,
      });
      setBookingSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <Drawer
      title={<span className="font-extrabold text-gray-900 text-base">Schedule a Vetted Tour</span>}
      placement="bottom"
      height="auto"
      open={open}
      onClose={onClose}
      styles={{
        header: { borderBottom: "1px solid #f3f4f6", paddingTop: 20, paddingBottom: 16 },
        body: { padding: "20px 20px 32px 20px" },
        wrapper: { borderRadius: "28px 28px 0 0", overflow: "hidden", maxWidth: 430, margin: "0 auto" },
      }}
      closeIcon={
        <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
          <X className="h-3.5 w-3.5" />
        </div>
      }
    >
      {bookingSuccess ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [1, 1.2, 1], opacity: 1 }}
            className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-sm"
          >
            <Check className="h-8 w-8" />
          </motion.div>
          <div>
            <h3 className="font-extrabold text-gray-900 text-lg">Tour Locked In!</h3>
            <p className="text-gray-400 text-sm mt-1">Routing to secure chat connection...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Headline */}
          <div className="bg-purple-50 rounded-2xl p-3.5 border border-[#7B2FBE]/10 flex gap-2.5 items-start">
            <div className="h-7 w-7 bg-purple-100 rounded-lg flex items-center justify-center text-[#7B2FBE] shrink-0 mt-0.5">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[#7B2FBE] text-xs font-bold mb-0.5">100% Verification Shield</p>
              <p className="text-gray-600 text-[11px] leading-tight">
                An audited Nyumba Sasa representative will personally moderate or guide this viewing of **{listingTitle}** to prevent fraud.
              </p>
            </div>
          </div>

          {/* Date Selector */}
          <div>
            <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Calendar className="text-[#7B2FBE] h-4 w-4" /> Select a Date
            </p>
            <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-1">
              {dates.map((d, index) => (
                <motion.button
                  key={index}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setSelectedDateIndex(index)}
                  className={`shrink-0 px-4 py-3 rounded-2xl flex flex-col items-center min-w-[76px] transition-all border ${
                    selectedDateIndex === index
                      ? "bg-[#7B2FBE] border-[#7B2FBE] text-white shadow-md shadow-purple-500/10"
                      : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-[13px] font-bold leading-none mb-1">{d.label}</span>
                  <span className={`text-[10px] uppercase font-semibold tracking-wider ${
                    selectedDateIndex === index ? "text-purple-200" : "text-gray-400"
                  }`}>{d.sub}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Time Selector */}
          <div>
            <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Clock className="text-[#7B2FBE] h-4 w-4" /> Select Time Slot
            </p>
            <div className="space-y-2.5">
              {TIME_SLOTS.map((slot, index) => (
                <motion.button
                  key={index}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTimeIndex(index)}
                  className={`w-full text-left p-3.5 rounded-2xl flex items-center justify-between border transition-all ${
                    selectedTimeIndex === index
                      ? "bg-[#7B2FBE]/5 border-[#7B2FBE] text-gray-900 shadow-sm"
                      : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <div>
                    <p className={`text-xs font-bold leading-none mb-1 ${
                      selectedTimeIndex === index ? "text-[#7B2FBE]" : "text-gray-700"
                    }`}>{slot.period}</p>
                    <p className="text-[13px] font-semibold leading-none">{slot.time}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    selectedTimeIndex === index ? "bg-[#7B2FBE]/10 text-[#7B2FBE]" : "bg-gray-200/60 text-gray-400"
                  }`}>{slot.sub}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Delivery Type */}
          <div>
            <p className="text-sm font-bold text-gray-800 mb-3">Viewing Method</p>
            <div className="flex gap-3">
              <button
                onClick={() => setTourType("In-Person")}
                className={`flex-1 py-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                  tourType === "In-Person"
                    ? "bg-[#7B2FBE] border-[#7B2FBE] text-white shadow-md"
                    : "bg-gray-50 border-gray-100 text-gray-600"
                }`}
              >
                <Compass className="h-4 w-4" />
                In-Person Visit
              </button>
              <button
                onClick={() => setTourType("Virtual")}
                className={`flex-1 py-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                  tourType === "Virtual"
                    ? "bg-[#7B2FBE] border-[#7B2FBE] text-white shadow-md"
                    : "bg-gray-50 border-gray-100 text-gray-600"
                }`}
              >
                <Smartphone className="h-4 w-4" />
                Virtual Video Call
              </button>
            </div>
          </div>

          {/* Book Action Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleBooking}
            className="w-full h-13 bg-[#7B2FBE] hover:bg-[#8e3ee6] text-white text-base font-bold rounded-full py-3.5 shadow-lg active:scale-97 transition-all mt-4"
          >
            Confirm & Route to Booking Chat
          </motion.button>
        </div>
      )}
    </Drawer>
  );
}
