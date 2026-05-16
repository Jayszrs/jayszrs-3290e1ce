import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, X, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LanyardBuilder() {
  const [name, setName] = useState("Margarita Ovsyannikova");
  const [division, setDivision] = useState("Accountant");
  const [image, setImage] = useState<string | null>(null);
  const [idNumber, setIdNumber] = useState("ID 6001526");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lanyardRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadLanyard = () => {
    if (!lanyardRef.current) return;
    
    try {
      const element = lanyardRef.current;
      const canvas = document.createElement("canvas");
      const rect = element.getBoundingClientRect();
      canvas.width = Math.ceil(rect.width * 2);
      canvas.height = Math.ceil(rect.height * 2);
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      ctx.scale(2, 2);
      
      // Create temporary container for rendering
      const temp = document.createElement("div");
      temp.style.position = "fixed";
      temp.style.left = "-9999px";
      temp.appendChild(element.cloneNode(true));
      document.body.appendChild(temp);
      
      // Simple SVG export as fallback
      const svg = `
        <svg width="${rect.width}" height="${rect.height}" xmlns="http://www.w3.org/2000/svg">
          <foreignObject width="100%" height="100%">
            ${element.outerHTML}
          </foreignObject>
        </svg>
      `;
      
      const svgBlob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(svgBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${name.replace(/\s+/g, "-")}-lanyard.svg`;
      link.click();
      
      document.body.removeChild(temp);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download lanyard:", err);
      // Fallback: alert user
      alert("To download your badge, please take a screenshot and save it as an image.");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Input Controls */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <div>
            <h3 className="text-3xl font-bold mb-2">
              Create Your
              <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent ml-2">
                ID Badge
              </span>
            </h3>
            <p className="text-foreground/60 text-base">
              Design your personalized digital lanyard credential
            </p>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/80">
              Full Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="glass rounded-xl bg-surface/50 border-border/50 text-foreground placeholder:text-foreground/40 focus:border-orange-500/50 transition-colors text-base"
            />
          </div>

          {/* Division/Role Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/80">
              Division / Position
            </label>
            <Input
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              placeholder="e.g. Lead Designer, Product Manager"
              className="glass rounded-xl bg-surface/50 border-border/50 text-foreground placeholder:text-foreground/40 focus:border-orange-500/50 transition-colors text-base"
            />
          </div>

          {/* ID Number Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/80">
              ID Number
            </label>
            <Input
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="e.g. ID 6001526"
              className="glass rounded-xl bg-surface/50 border-border/50 text-foreground placeholder:text-foreground/40 focus:border-orange-500/50 transition-colors text-base"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/80">
              Profile Photo
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative border-2 border-dashed border-border/50 rounded-xl p-8 cursor-pointer hover:border-orange-500/50 transition-colors glass"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center gap-3">
                <Upload className="size-10 text-orange-600/60" />
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">
                    Click to upload photo
                  </p>
                  <p className="text-xs text-foreground/60 mt-1">
                    PNG, JPG up to 10MB
                  </p>
                </div>
              </div>
            </div>

            {image && (
              <div className="relative inline-block w-full">
                <img
                  src={image}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-xl border border-border/30"
                />
                <button
                  onClick={clearImage}
                  className="absolute -top-3 -right-3 p-2 bg-orange-600 rounded-full hover:bg-orange-700 transition-colors shadow-lg"
                >
                  <X className="size-5 text-white" />
                </button>
              </div>
            )}
          </div>

          {/* Download Button */}
          <Button
            onClick={downloadLanyard}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all h-12 text-base"
          >
            <Download className="size-5 mr-2" />
            Download Badge
          </Button>
        </motion.div>

        {/* Lanyard Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-center min-h-[700px]"
        >
          <div className="w-full max-w-sm">
            <motion.div
              ref={lanyardRef}
              className="relative"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              {/* Lanyard Strap */}
              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center">
                {/* Fabric Strap */}
                <div
                  className="w-6 shadow-md"
                  style={{
                    height: "60px",
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
              </div>

              {/* Badge Card */}
              <div 
                className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-border/50 pt-12"
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
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-700/60 to-gray-900/60 flex items-center justify-center">
                        <Upload className="size-12 text-foreground/20" />
                      </div>
                    )}
                  </div>
                  {/* Gradient overlay on photo */}
                  <div className="absolute inset-0 top-6 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-dark-green/30" />
                </div>

                {/* Name and Division */}
                <div className="relative px-6 pt-6 pb-4 text-center space-y-2">
                  <h2 className="text-2xl font-black text-white leading-tight">
                    {name}
                  </h2>
                  <p className="text-sm text-foreground/70 font-medium">
                    {division}
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
                    <span className="text-sm font-bold text-orange-500">{idNumber}</span>
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
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
