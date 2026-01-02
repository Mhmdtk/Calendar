import { Navigation } from "@/components/Navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Save, Info, Plus, Palette } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const ARABIC_MONTHS = [
  "كانون الثاني", "شباط", "آذار", "نيسان", "أيار", "حزيران",
  "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول"
];

const formatArabicDate = (date: Date) => {
  const day = date.getDate();
  const month = ARABIC_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

interface HijriOverride {
  id: string;
  hijriYear: number;
  hijriMonth: number;
  gregorianDate: string;
}

export default function SettingsPage() {
  const [overrides, setOverrides] = useState<HijriOverride[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem("hijri_overrides");
    if (saved) {
      setOverrides(JSON.parse(saved));
    }
  }, []);

  const saveOverrides = (newOverrides: HijriOverride[]) => {
    setOverrides(newOverrides);
    localStorage.setItem("hijri_overrides", JSON.stringify(newOverrides));
  };

  const [newOverride, setNewOverride] = useState({
    hijriYear: 1446,
    hijriMonth: 1,
    gregorianDate: "",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOverride.gregorianDate) return;

    const override = {
      ...newOverride,
      id: Math.random().toString(36).substr(2, 9),
    };

    const updated = [...overrides, override].sort((a, b) => 
      new Date(a.gregorianDate).getTime() - new Date(b.gregorianDate).getTime()
    );
    
    saveOverrides(updated);
    toast({ title: "تم حفظ التعديل بنجاح" });
    setNewOverride({ ...newOverride, gregorianDate: "" });
  };

  const handleDelete = (id: string) => {
    if (confirm("هل تريد حذف هذا التعديل؟")) {
      saveOverrides(overrides.filter(o => o.id !== id));
    }
  };

  const months = [
    { value: 1, label: "محرم" }, { value: 2, label: "صفر" }, { value: 3, label: "ربيع الأول" },
    { value: 4, label: "ربيع الثاني" }, { value: 5, label: "جمادى الأولى" }, { value: 6, label: "جمادى الثانية" },
    { value: 7, label: "رجب" }, { value: 8, label: "شعبان" }, { value: 9, label: "رمضان" },
    { value: 10, label: "شوال" }, { value: 11, label: "ذو القعدة" }, { value: 12, label: "ذو الحجة" },
  ];

  const getMonthLength = (override: HijriOverride, allOverrides: HijriOverride[]) => {
    const sorted = [...allOverrides].sort((a, b) => 
      new Date(a.gregorianDate).getTime() - new Date(b.gregorianDate).getTime()
    );
    
    const currentIndex = sorted.findIndex(o => o.id === override.id);
    const nextOverride = sorted[currentIndex + 1];

    if (nextOverride) {
      const start = new Date(override.gregorianDate);
      const end = new Date(nextOverride.gregorianDate);
      const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays;
    }

    return (override.hijriMonth % 2 === 1) ? 30 : 29;
  };

  const currentYear = new Date().getFullYear();
  const hijriYearGuess = currentYear - 579;

  const [theme, setTheme] = useState({
    primary: localStorage.getItem("theme_primary") || "#4f46e5",
    accent: localStorage.getItem("theme_accent") || "#10b981"
  });

  const updateTheme = (key: "primary" | "accent", value: string) => {
    const newTheme = { ...theme, [key]: value };
    setTheme(newTheme);
    localStorage.setItem(`theme_${key}`, value);
    document.documentElement.style.setProperty(`--${key}`, value);
  };

  useEffect(() => {
    document.documentElement.style.setProperty("--primary", theme.primary);
    document.documentElement.style.setProperty("--accent", theme.accent);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-12">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir="rtl">
        <div className="mb-8 text-right">
          <h1 className="text-3xl font-bold text-foreground font-display">الإعدادات الشاملة</h1>
          <p className="mt-2 text-muted-foreground">
            تعديل بدايات الأشهر الهجرية وتخصيص مظهر الرزنامة
          </p>
        </div>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-right">تخصيص المظهر</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="block text-right">اللون الأساسي</Label>
                  <div className="flex gap-2 items-center">
                    <Input 
                      type="color" 
                      value={theme.primary}
                      onChange={(e) => updateTheme("primary", e.target.value)}
                      className="h-10 w-20 p-1"
                    />
                    <Input 
                      type="text" 
                      value={theme.primary}
                      onChange={(e) => updateTheme("primary", e.target.value)}
                      className="text-right flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="block text-right">لون التمييز (Accent)</Label>
                  <div className="flex gap-2 items-center">
                    <Input 
                      type="color" 
                      value={theme.accent}
                      onChange={(e) => updateTheme("accent", e.target.value)}
                      className="h-10 w-20 p-1"
                    />
                    <Input 
                      type="text" 
                      value={theme.accent}
                      onChange={(e) => updateTheme("accent", e.target.value)}
                      className="text-right flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2 text-right">
                <Label>نص ترويسة التصدير</Label>
                <Input 
                  placeholder="مثال: التقويم السنوي - مكتب سماحة السيد القائد"
                  defaultValue={localStorage.getItem("export_header_text") || ""}
                  onChange={(e) => localStorage.setItem("export_header_text", e.target.value)}
                  className="text-right"
                />
              </div>
            </CardContent>
          </Card>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-4">
            <Info className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-primary mb-1 text-right">تنبيه تقني</h3>
              <p className="text-sm text-muted-foreground leading-relaxed text-right">
                يتم الآن حفظ جميع التعديلات في "التخزين المحلي" (Local Storage) لمتصفحك فقط. هذا يضمن سرعة الاستجابة وخصوصية البيانات.
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-right">إضافة شهر جديد</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2 text-right">
                  <Label>السنة الهجرية</Label>
                  <Input 
                    type="number" 
                    value={newOverride.hijriYear} 
                    onChange={e => setNewOverride({...newOverride, hijriYear: parseInt(e.target.value) || hijriYearGuess})}
                    className="text-right"
                  />
                </div>
                
                <div className="space-y-2 text-right">
                  <Label>الشهر الهجري</Label>
                  <Select 
                    value={newOverride.hijriMonth.toString()} 
                    onValueChange={val => setNewOverride({...newOverride, hijriMonth: parseInt(val)})}
                  >
                    <SelectTrigger className="w-full text-right" dir="rtl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent dir="rtl">
                      {months.map(m => (
                        <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 text-right">
                  <Label>بداية الشهر بالميلادي</Label>
                  <Input 
                    type="date" 
                    value={newOverride.gregorianDate}
                    onChange={e => setNewOverride({...newOverride, gregorianDate: e.target.value})}
                    required
                    className="text-right"
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Plus className="ml-2 w-4 h-4" />
                  إضافة
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-right">إدارة الأشهر والمدد</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overrides.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">لا توجد تعديلات محفوظة حالياً.</p>
                ) : (
                  overrides.map(override => (
                    <div key={override.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                      <div className="flex items-center gap-4 flex-wrap text-right">
                        <span className="font-bold text-primary min-w-[120px]">
                          1 {months.find(m => m.value === override.hijriMonth)?.label} {override.hijriYear}
                        </span>
                        <span className="text-muted-foreground text-sm">يوافق:</span>
                        <span className="font-medium bg-background px-3 py-1 rounded border">
                          {formatArabicDate(new Date(override.gregorianDate))}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {getMonthLength(override, overrides)} يوماً
                        </span>
                      </div>
                      <div className="flex gap-2 mr-auto" dir="ltr">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const currentLen = getMonthLength(override, overrides);
                            const newLength = prompt("أدخل عدد أيام الشهر:", currentLen.toString());
                            if (newLength) {
                              const days = parseInt(newLength);
                              if (!isNaN(days)) {
                                const start = new Date(override.gregorianDate);
                                const nextDate = new Date(start);
                                nextDate.setDate(start.getDate() + days);
                                
                                const nextMonth = override.hijriMonth === 12 ? 1 : override.hijriMonth + 1;
                                const nextYear = override.hijriMonth === 12 ? override.hijriYear + 1 : override.hijriYear;
                                
                                const newOverride = {
                                  id: Math.random().toString(36).substr(2, 9),
                                  hijriMonth: nextMonth,
                                  hijriYear: nextYear,
                                  gregorianDate: nextDate.toISOString().split('T')[0]
                                };
                                
                                const updated = [...overrides.filter(o => o.hijriMonth !== nextMonth || o.hijriYear !== nextYear), newOverride].sort((a, b) => 
                                  new Date(a.gregorianDate).getTime() - new Date(b.gregorianDate).getTime()
                                );
                                saveOverrides(updated);
                              }
                            }
                          }}
                        >
                          تعديل المدة
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(override.id)}
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-right">بدايات الأشهر المخفية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(() => {
                  const hidden = JSON.parse(localStorage.getItem("hidden_hijri_starts") || "[]");
                  if (hidden.length === 0) return <p className="text-center text-muted-foreground py-4">لا توجد تسميات مخفية.</p>;
                  return hidden.map((dateStr: string) => (
                    <div key={dateStr} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                      <span className="font-medium">
                        {formatArabicDate(new Date(dateStr))}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-primary hover:bg-primary/10"
                        onClick={() => {
                          const updated = hidden.filter((d: string) => d !== dateStr);
                          localStorage.setItem("hidden_hijri_starts", JSON.stringify(updated));
                          window.location.reload();
                        }}
                        title="إظهار مجدداً"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ));
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
