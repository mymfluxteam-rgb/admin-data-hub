import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
export function DataTable({ data, columns, searchKey, searchPlaceholder = "Search...", isLoading = false, }) {
    const [search, setSearch] = useState("");
    const filtered = searchKey
        ? data.filter((item) => {
            const val = item[searchKey];
            if (typeof val === "string") {
                return val.toLowerCase().includes(search.toLowerCase());
            }
            return true;
        })
        : data;
    return (<div className="space-y-3">
      {searchKey && (<div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"/>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={searchPlaceholder} className="pl-9 bg-secondary/50 text-sm h-8"/>
        </div>)}
      <div className="glass-card rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              {columns.map((col) => (<th key={col.key} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {col.label}
                </th>))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (Array.from({ length: 5 }).map((_, i) => (<tr key={i} className="border-b border-border/30">
                  {columns.map((col) => (<td key={col.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-full"/>
                    </td>))}
                </tr>))) : filtered.length === 0 ? (<tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground text-sm">
                  No data found
                </td>
              </tr>) : (filtered.map((item, idx) => (<tr key={idx} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                  {columns.map((col) => (<td key={col.key} className="px-4 py-3">
                      {col.render ? col.render(item) : String(item[col.key] ?? "")}
                    </td>))}
                </tr>)))}
          </tbody>
        </table>
      </div>
    </div>);
}
