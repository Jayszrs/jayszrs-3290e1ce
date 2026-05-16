import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";

interface LanyardData {
  name: string;
  division: string;
  idNumber: string;
  image?: string;
}

export function LanyardDisplay({ 
  data = {
    name: "Margarita Ovsyannikova",
    division: "Accountant",
    idNumber: "ID 6001526",
  }
}: { data?: LanyardData }) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const constraintsRef = useRef(null);
  const [image, setImage] = useState<string | null>(data.image || null);

  useEffect(() => {
    if (data.image) {
      setImage(data.image);
    }
  }, [data.image]);

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        ref={constraintsRef}
        className="relative"
        style={{
          perspective: "1000px",
        }}
      >
        {/* Draggable Lanyard Strap */}
        <motion.div
          drag="y"
          dragConstraints={constraintsRef}
          dragElastic={0.3}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          onDrag={(event, info) => setDragY(info.offset.y)}
          className="absolute -top-24 left-1/2 transform -translate-x-1/2 z-30 flex flex-col items-center cursor-grab active:cursor-grabbing"
          initial={{ y: 0 }}
        >
          {/* Fabric Strap */}
          <motion.div
            className="w-6 shadow-md"
            style={{
              height: Math.max(70 + Math.abs(dragY) * 0.5, 70),
              background: "repeating-linear-gradient(45deg, #18181b, #18181b 2px, #27272a 2px, #27272a 4px)",
              borderLeft: "1px solid rgba(255,255,255,0.05)",
              borderRight: "1px solid rgba(0,0,0,0.5)",
            }}
          />
          
          {/* Metal Crimp */}
          <div className="w-8 h-3 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-500 rounded-sm shadow-sm border border-gray-600/50 flex flex-col items-center justify-around py-0.5 z-10">
             <div className="w-6 h-px bg-gray-600/50" />
             <div className="w-6 h-px bg-gray-600/50" />
          </div>

          {/* Metal Lobster Clasp / Clip */}
          <div className="w-4 h-6 bg-gradient-to-b from-gray-300 to-gray-500 rounded-b-lg border border-gray-500/50 shadow-sm flex justify-center relative -top-0.5 z-0">
             <div className="w-1.5 h-3 bg-gray-800/40 rounded-full mt-1 inset-shadow-sm" />
          </div>
        </motion.div>

        {/* Badge Card */}
        <motion.div
          animate={{ y: dragY * 0.3 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-border/50"
          style={{
            background: "linear-gradient(135deg, rgba(20, 20, 28, 0.98) 0%, rgba(15, 15, 25, 0.98) 100%)",
            aspectRatio: "9/16",
          }}
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600" />

          {/* Header with logo and company */}
          <div className="relative px-6 pt-4 pb-6 flex items-start justify-between border-b border-orange-500/20">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              N
            </div>
            <div className="text-right">
              <div className="text-orange-500 font-bold text-sm leading-tight">
                NEOSCAPE
              </div>
              <div className="text-orange-400/50 text-xs font-medium">CREDENTIALS</div>
            </div>
          </div>

          {/* Profile Photo - Circular */}
          <div className="relative flex justify-center px-6 pt-6 pb-2">
            <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-orange-500/40 shadow-xl">
              {image ? (
                <img
                  src={image}
                  alt={data.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-700/60 to-gray-900/60 flex items-center justify-center">
                  <Upload className="size-12 text-foreground/20" />
                </div>
              )}
            </div>
            <div className="absolute inset-0 top-6 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-dark-green/30" />
          </div>

          {/* Name and Division */}
          <div className="relative px-6 pt-6 pb-4 text-center space-y-2">
            <h2 className="text-2xl font-black text-white leading-tight">
              {data.name}
            </h2>
            <p className="text-sm text-foreground/70 font-medium">
              {data.division}
            </p>
          </div>

          {/* Divider */}
          <div className="px-6 py-2">
            <div className="h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
          </div>

          {/* ID Info Section */}
          <div className="px-6 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground/60 font-semibold">ID NUMBER</span>
              <span className="text-sm font-bold text-orange-500">{data.idNumber}</span>
            </div>

            {/* Status dot */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-xs text-foreground/50 font-medium">Active Member</span>
            </div>
          </div>

          {/* Bottom badge */}
          <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-orange-500/20 border border-orange-500/40 rounded-full">
            <span className="text-xs font-semibold text-orange-400">Verified</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Interaction hint */}
      <motion.div
        className="text-center mt-6 text-xs text-foreground/50"
        animate={{ opacity: isDragging ? 0 : 1 }}
      >
        💡 Drag the lanyard strap to interact
      </motion.div>
    </div>
  );
}
