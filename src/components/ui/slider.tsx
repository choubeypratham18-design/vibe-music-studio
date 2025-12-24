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
          variant === "accent" && "bg-gradient-to-r from-accent/80 to-accent",
          variant === "primary" && "bg-gradient-to-r from-primary/80 to-primary",
          variant === "default" && "bg-gradient-to-r from-primary/80 to-primary"
        )}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb 
      className={cn(
        "block h-4 w-4 rounded-full border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
        variant === "accent" && "border-accent bg-accent shadow-[0_0_10px_hsl(45_100%_50%/0.5)] focus-visible:ring-accent",
        variant === "primary" && "border-primary bg-primary shadow-[0_0_10px_hsl(187_100%_50%/0.5)] focus-visible:ring-primary",
        variant === "default" && "border-primary bg-primary shadow-[0_0_10px_hsl(187_100%_50%/0.5)] focus-visible:ring-primary"
      )}
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
