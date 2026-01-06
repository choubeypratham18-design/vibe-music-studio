import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  variant?: "default" | "primary" | "accent";
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, variant = "default", ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted">
      <SliderPrimitive.Range 
        className={cn(
          "absolute h-full",
          variant === "accent" && "bg-gradient-to-r from-ai-pink/80 to-ai-pink",
          variant === "primary" && "bg-gradient-to-r from-ai-purple/80 to-ai-purple",
          variant === "default" && "bg-gradient-to-r from-ai-purple/80 to-ai-purple"
        )}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb 
      className={cn(
        "block h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
        variant === "accent" && "border-ai-pink bg-ai-pink shadow-[0_0_10px_hsl(320_100%_60%/0.5)] focus-visible:ring-ai-pink",
        variant === "primary" && "border-ai-purple bg-ai-purple shadow-[0_0_10px_hsl(280_100%_65%/0.5)] focus-visible:ring-ai-purple",
        variant === "default" && "border-ai-purple bg-ai-purple shadow-[0_0_10px_hsl(280_100%_65%/0.5)] focus-visible:ring-ai-purple"
      )}
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
