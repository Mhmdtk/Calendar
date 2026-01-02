import { Navigation } from "@/components/Navigation";
import { useEvents, useDeleteEvent } from "@/hooks/use-events";
import { EventDialog } from "@/components/EventDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { Trash2, Calendar as CalendarIcon, Edit, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function EventsList() {
  // Fetch all events (no filter for now)
  const { data: events, isLoading, isError } = useEvents();
  const deleteMutation = useDeleteEvent();
  const { toast } = useToast();

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه المناسبة؟")) {
      await deleteMutation.mutateAsync(id);
      toast({ title: "تم الحذف بنجاح" });
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-12">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-display">قائمة المناسبات</h1>
            <p className="mt-1 text-muted-foreground">إدارة جميع المناسبات والفعاليات المسجلة</p>
          </div>
          <EventDialog />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events?.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-card rounded-xl border border-dashed border-border">
              <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">لا توجد مناسبات</h3>
              <p className="text-muted-foreground mt-1">قم بإضافة مناسبة جديدة لتبدأ</p>
            </div>
          ) : (
            events?.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`
                      px-2 py-1 rounded text-xs font-bold
                      ${event.calendarType === 'hijri' ? 'bg-secondary/20 text-secondary-foreground' : 'bg-primary/10 text-primary'}
                    `}>
                      {event.calendarType === 'hijri' ? 'هجري' : 'ميلادي'}
                    </div>
                    {event.recurrence === 'annual' && (
                      <div className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        <RefreshCw className="w-3 h-3 ml-1" />
                        سنوي
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold mb-2">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 min-h-[40px] line-clamp-2">
                    {event.description || "بدون وصف"}
                  </p>
                  
                  <div className="flex items-center text-sm text-muted-foreground mb-6">
                    <CalendarIcon className="w-4 h-4 ml-2" />
                    {format(new Date(event.startDate), 'EEEE, d MMMM yyyy', { locale: arSA })}
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-border">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(event.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <EventDialog 
                      existingEvent={event}
                      trigger={
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 ml-2" />
                          تعديل
                        </Button>
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
