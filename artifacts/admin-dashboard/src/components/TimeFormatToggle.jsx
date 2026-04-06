import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
export function TimeFormatToggle() {
    const [is24h, setIs24h] = useState(false);
    const toggle = () => {
        setIs24h((prev) => !prev);
        localStorage.setItem("timeFormat", !is24h ? "24h" : "12h");
    };
    return (<Button variant="outline" size="sm" onClick={toggle} className="gap-2 h-8 text-xs">
      <Clock className="h-3.5 w-3.5"/>
      {is24h ? "24h" : "12h"}
    </Button>);
}
