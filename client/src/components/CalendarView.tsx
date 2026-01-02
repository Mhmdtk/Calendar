import { useState, useRef, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addMonths, subMonths, isSameMonth, isSameDay, isToday } from "date-fns";
import { ar } from "date-fns/locale";
import { useLocation } from "wouter";

const ARABIC_MONTHS = [
  "كانون الثاني", "شباط", "آذار", "نيسان", "أيار", "حزيران",
  "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول"
];

const formatArabicMonth = (date: Date) => {
  const monthIdx = date.getMonth();
  const year = date.getFullYear();
  return `${ARABIC_MONTHS[monthIdx]} ${year}`;
};
import { ChevronLeft, ChevronRight, Printer, Trash2, Download, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventDialog } from "./EventDialog";
import { useEvents } from "@/hooks/use-events";
import { useHijriOverrides } from "@/hooks/use-hijri";
import { getHijriDate } from "@/lib/hijri";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { type Event } from "@shared/schema";

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);
  const [location] = useLocation();
  
  // Calculate range for API
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 6 }); // Saturday start
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 6 });

  // Fetch data
  const { data: events = [] } = useEvents(calendarStart.toISOString(), calendarEnd.toISOString());
  const [overrides, setOverrides] = useState<any[]>([]);

  useEffect(() => {
    const primary = localStorage.getItem("theme_primary");
    const accent = localStorage.getItem("theme_accent");
    if (primary) document.documentElement.style.setProperty("--primary", primary);
    if (accent) document.documentElement.style.setProperty("--accent", accent);

    const saved = localStorage.getItem("hijri_overrides");
    if (saved) {
      setOverrides(JSON.parse(saved));
    }
  }, [currentDate, location]);

  // Generate days
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const handleExportPDF = async () => {
    if (!calendarRef.current) return;
    
    // Simple export logic for MVP
    const canvas = await html2canvas(calendarRef.current, {
      scale: 2, // Better quality
      useCORS: true,
      onclone: (clonedDoc) => {
        const header = clonedDoc.createElement('div');
        header.style.textAlign = 'center';
        header.style.marginBottom = '20px';
        header.style.padding = '10px';
        
        const monthName = formatArabicMonth(currentDate);
        header.innerHTML = `
          <h1 style="font-size: 24px; font-bold: true; margin-bottom: 10px;">${monthName}</h1>
          <p style="font-size: 12px; color: #666;">* التواريخ الهجرية معتمدة على مبنى الرؤية لسماحة السيد القائد علي الخامنئي (دام ظله)</p>
        `;
        
        const calendarEl = clonedDoc.querySelector('[ref="calendarRef"]') || clonedDoc.body.firstChild;
        if (calendarEl instanceof HTMLElement) {
          calendarEl.prepend(header);
        }
      }
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4'); // landscape
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`calendar-${format(currentDate, 'yyyy-MM')}.pdf`);
  };

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(new Date(event.startDate), day));
  };

  const handleExportEventsPDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Add font first, but don't use doc.text until it's loaded if using remote URL
    // For reliable Arabic support, we need to ensure the font is truly available
    doc.addFont("https://cdn.jsdelivr.net/npm/cairo-font-ttf@1.0.0/Cairo-Regular.ttf", "Cairo", "normal");
    doc.setFont("Cairo");
    
    const monthName = ARABIC_MONTHS[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    
    doc.setFontSize(22);
    // Use a fallback font if Cairo fails to load 'widths' properly for some characters
    // Or wrap in try-catch to debug
    try {
      doc.text(`مناسبات شهر ${monthName} ${year}`, 105, 20, { align: 'center' });
    } catch (e) {
      console.error("PDF Text Error:", e);
      // Fallback to standard font for header if Cairo fails
      doc.setFont("helvetica");
      doc.text(`Events for ${monthName} ${year}`, 105, 20, { align: 'center' });
      doc.setFont("Cairo");
    }
    
    // Add header text from settings if available
    const headerText = localStorage.getItem("export_header_text");
    if (headerText) {
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(headerText, 105, 30, { align: 'center' });
    }
    
    const tableData = events
      .filter(event => isSameMonth(new Date(event.startDate), currentDate))
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .map(event => {
        const d = new Date(event.startDate);
        const hijri = getHijriDate(d, overrides);
        return [
          event.description || '-',
          `${hijri.day} ${hijri.monthName}`,
          `${d.getDate()} ${ARABIC_MONTHS[d.getMonth()]}`,
          event.title
        ];
      });

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ] : [79, 70, 229];
    };

    const primaryColor = hexToRgb(localStorage.getItem("theme_primary") || "#4f46e5");

    (doc as any).autoTable({
      head: [['التفاصيل', 'التاريخ الهجري', 'التاريخ الميلادي', 'المناسبة']],
      body: tableData,
      startY: 40,
      styles: { font: "Cairo", halign: 'right' },
      headStyles: { fillStyle: 'f', fillColor: primaryColor }
    });
    
    doc.save(`events-${monthName}-${year}.pdf`);
  };

  const handleExportMultiMonthPDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.addFont("https://cdn.jsdelivr.net/npm/cairo-font-ttf@1.0.0/Cairo-Regular.ttf", "Cairo", "normal");
    doc.setFont("Cairo");
    
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [79, 70, 229];
    };
    const primaryColor = hexToRgb(localStorage.getItem("theme_primary") || "#4f46e5");
    const headerText = localStorage.getItem("export_header_text");

    for (let i = 0; i < 3; i++) {
      if (i > 0) doc.addPage();
      const targetDate = addMonths(currentDate, i);
      const monthName = ARABIC_MONTHS[targetDate.getMonth()];
      const year = targetDate.getFullYear();

      doc.setFontSize(22);
      try {
        doc.text(`مناسبات شهر ${monthName} ${year}`, 105, 20, { align: 'center' });
      } catch (e) {
        doc.setFont("helvetica");
        doc.text(`Events for ${monthName} ${year}`, 105, 20, { align: 'center' });
        doc.setFont("Cairo");
      }
      if (headerText) {
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(headerText, 105, 30, { align: 'center' });
      }

      const tableData = events
        .filter(event => isSameMonth(new Date(event.startDate), targetDate))
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .map(event => {
          const d = new Date(event.startDate);
          const hijri = getHijriDate(d, overrides);
          return [event.description || '-', `${hijri.day} ${hijri.monthName}`, `${d.getDate()} ${ARABIC_MONTHS[d.getMonth()]}`, event.title];
        });

      (doc as any).autoTable({
        head: [['التفاصيل', 'التاريخ الهجري', 'التاريخ الميلادي', 'المناسبة']],
        body: tableData,
        startY: 40,
        styles: { font: "Cairo", halign: 'right' },
        headStyles: { fillStyle: 'f', fillColor: primaryColor }
      });
    }
    doc.save(`multi-month-events-${targetDate.getFullYear()}.pdf`);
  };

  const currentYear = currentDate.getFullYear();

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-4 order-2 md:order-1">
           <Button variant="outline" size="icon" onClick={prevMonth}>
             <ChevronRight className="w-5 h-5" />
           </Button>
           <h2 className="text-xl font-bold font-display min-w-[200px] text-center">
             {formatArabicMonth(currentDate)}
           </h2>
           <Button variant="outline" size="icon" onClick={nextMonth}>
             <ChevronLeft className="w-5 h-5" />
           </Button>
        </div>
        
        <div className="flex items-center gap-2 order-1 md:order-2 flex-wrap justify-center">
          <Button variant="ghost" onClick={goToToday}>اليوم</Button>
          <Button variant="outline" onClick={handleExportPDF} className="gap-2">
            <Printer className="w-4 h-4" />
            تصدير الرزنامة
          </Button>
          <Button variant="outline" onClick={handleExportEventsPDF} className="gap-2">
            <Download className="w-4 h-4" />
            جدول المناسبات
          </Button>
          <Button variant="outline" onClick={handleExportMultiMonthPDF} className="gap-2">
            <CalendarIcon className="w-4 h-4" />
            تصدير 3 أشهر
          </Button>
          <EventDialog defaultDate={currentDate} />
        </div>
      </div>

      <div ref={calendarRef} className="bg-background p-4 rounded-xl border border-border shadow-lg">
        {/* Header for PDF (visible only in print usually, but here we capture the div) */}
        <div className="text-center mb-4 hidden print:block">
           <h1 className="text-2xl font-bold">التقويم الشهري</h1>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center font-bold text-muted-foreground py-2 border-b border-border/50">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 bg-muted/20 rounded-lg border border-border overflow-hidden">
          {days.map((day, dayIdx) => {
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isDayToday = isToday(day);
            const dayEvents = getEventsForDay(day);
            const hijri = getHijriDate(day, overrides);

            // Check if this day is exactly the start of a hijri month based on overrides
            const hiddenStarts = JSON.parse(localStorage.getItem("hidden_hijri_starts") || "[]");
            const isHijriStart = hijri.day === 1 && !hiddenStarts.includes(day.toISOString());

            return (
              <div
                key={day.toString()}
                className={`
                  min-h-[140px] p-2 relative bg-card transition-all hover:bg-accent/30
                  ${!isCurrentMonth ? 'opacity-50 bg-muted/30' : ''}
                  ${isDayToday ? 'ring-2 ring-primary ring-inset z-10' : ''}
                `}
              >
                {/* Dates Header */}
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-lg font-bold ${isDayToday ? 'text-primary' : 'text-foreground'}`}>
                    {format(day, 'd')}
                  </span>
                  <div className="text-xs font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                    <span className="text-secondary-foreground font-bold">{hijri.day}</span> {hijri.monthName}
                  </div>
                </div>

                {/* Events */}
                <div className="space-y-1">
                  {dayEvents.map((event) => (
                    <EventDialog 
                      key={event.id}
                      existingEvent={event}
                      trigger={
                        <button 
                          className="w-full text-right text-xs truncate px-1.5 py-1 rounded transition-colors border-r-2"
                          style={{ 
                            backgroundColor: `${event.color || '#4f46e5'}20`, 
                            color: event.color || '#4f46e5',
                            borderRightColor: event.color || '#4f46e5'
                          }}
                        >
                          {event.title}
                        </button>
                      }
                    />
                  ))}
                  
                  {/* Highlight specific hijri events if needed manually */}
                  {isHijriStart && (
                     <div className="group relative">
                       <div className="text-[10px] text-center text-secondary-foreground mt-1 font-bold bg-secondary/20 rounded py-0.5">
                         بداية {hijri.monthName}
                       </div>
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           if (confirm("هل تريد إخفاء مسمى بداية الشهر لهذا اليوم؟")) {
                             const hidden = JSON.parse(localStorage.getItem("hidden_hijri_starts") || "[]");
                             hidden.push(day.toISOString());
                             localStorage.setItem("hidden_hijri_starts", JSON.stringify(hidden));
                             window.location.reload();
                           }
                         }}
                         className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 bg-destructive text-white rounded-full p-0.5 hover:scale-110 transition-all z-20"
                         title="إخفاء"
                       >
                         <Trash2 className="w-2 h-2" />
                       </button>
                     </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 text-xs text-muted-foreground text-center">
          * التواريخ الهجرية معتمدة على مبنى الرؤية لسماحة السيد القائد علي الخامنئي (دام ظله)
        </div>
      </div>
    </div>
  );
}
