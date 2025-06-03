import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface CaptchaDisplayProps {
  onRefresh: () => void;
  isLoading: boolean;
}

const CaptchaDisplay: React.FC<CaptchaDisplayProps> = ({ onRefresh, isLoading }) => {
  const { data, isFetching } = useQuery({
    queryKey: ["/api/captcha"],
    staleTime: 0, // Don't cache captcha
  });

  const handleRefresh = () => {
    onRefresh();
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-700">CAPTCHA Verification</label>
      <div className="border border-gray-300 rounded-md overflow-hidden">
        {/* CAPTCHA Display Area */}
        <div className="h-[70px] bg-[#F8F9FA] flex justify-center items-center p-2 relative" id="captchaContainer">
          {data?.image ? (
            <img 
              src={data.image} 
              alt="CAPTCHA verification" 
              className="rounded h-full"
              aria-label="CAPTCHA image containing characters to verify you are human"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              Loading CAPTCHA...
            </div>
          )}
          
          {/* Loading Overlay */}
          {(isFetching || isLoading) && (
            <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
              <div className="border-t-primary border-4 border-t-4 border-gray-200 h-12 w-12 rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        
        {/* CAPTCHA Controls */}
        <div className="bg-gray-50 px-4 py-2 flex justify-between items-center border-t border-gray-300">
          <span className="text-xs text-neutral-500">Enter the characters you see above</span>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            className="text-primary hover:text-primary-foreground hover:bg-primary text-sm font-medium"
            disabled={isFetching || isLoading}
          >
            <RefreshCcw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CaptchaDisplay;
