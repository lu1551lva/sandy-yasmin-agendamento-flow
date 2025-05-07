
import { Input } from "@/components/ui/input";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  id?: string;
}

const ColorPicker = ({ color, onChange, id }: ColorPickerProps) => {
  return (
    <div className="flex items-center gap-2">
      <div 
        className="h-10 w-10 rounded-md border shadow-sm"
        style={{ backgroundColor: color }}
      />
      <Input
        id={id}
        type="text"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="w-32"
      />
      <input
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-10 cursor-pointer"
        aria-label="Escolher cor"
      />
    </div>
  );
};

export default ColorPicker;
