import { useState } from "react";
import { useCreateEvent, useUpdateEvent } from "@/hooks/use-events";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Loader2, Plus } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { type Event } from "@shared/schema";

interface EventDialogProps {
  existingEvent?: Event;
  trigger?: React.ReactNode;
  defaultDate?: Date;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EventDialog({ existingEvent, trigger, defaultDate, open, onOpenChange }: EventDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange! : setInternalOpen;

  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: existingEvent?.title || "",
    description: existingEvent?.description || "",
    startDate: existingEvent?.startDate 
      ? new Date(existingEvent.startDate).toISOString().slice(0, 16) 
      : (defaultDate ? defaultDate.toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)),
    calendarType: existingEvent?.calendarType || "gregorian",
    recurrence: existingEvent?.recurrence || "none",
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (existingEvent) {
        await updateMutation.mutateAsync({
          id: existingEvent.id,
          ...formData,
          startDate: new Date(formData.startDate),
          isAllDay: true, // Defaulting to all day for simplicity in this MVP
        });
        toast({ title: "تم تحديث المناسبة بنجاح" });
      } else {
        await createMutation.mutateAsync({
          ...formData,
          startDate: new Date(formData.startDate),
          isAllDay: true,
          endDate: null,
          color: "#2563eb",
        });
        toast({ title: "تمت إضافة المناسبة بنجاح" });
      }
      setIsOpen(false);
      // Reset form if creating new
      if (!existingEvent) {
        setFormData({
          title: "",
          description: "",
          startDate: new Date().toISOString().slice(0, 16),
          calendarType: "gregorian",
          recurrence: "none",
        });
      }
    } catch (error) {
      toast({ 
        title: "حدث خطأ", 
        description: (error as Error).message, 
        variant: "destructive" 
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4" />
            <span>إضافة مناسبة</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right font-display text-xl">
            {existingEvent ? "تعديل المناسبة" : "إضافة مناسبة جديدة"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-right block">عنوان المناسبة</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="text-right"
              placeholder="مثلاً: بداية شهر رمضان"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-right block">نوع التقويم</Label>
              <Select
                value={formData.calendarType}
                onValueChange={(val) => setFormData({ ...formData, calendarType: val })}
              >
                <SelectTrigger className="w-full text-right" dir="rtl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="gregorian">ميلادي</SelectItem>
                  <SelectItem value="hijri">هجري</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-right block">التكرار</Label>
              <Select
                value={formData.recurrence}
                onValueChange={(val) => setFormData({ ...formData, recurrence: val })}
              >
                <SelectTrigger className="w-full text-right" dir="rtl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="none">بدون تكرار</SelectItem>
                  <SelectItem value="annual">سنوي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-right block">التاريخ</Label>
            <Input
              id="date"
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-right block">تفاصيل إضافية</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="text-right resize-none"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isPending} className="bg-primary text-primary-foreground">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              {existingEvent ? "حفظ التعديلات" : "إضافة المناسبة"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
