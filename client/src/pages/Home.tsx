import { Navigation } from "@/components/Navigation";
import { CalendarView } from "@/components/CalendarView";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-background pb-12">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8 text-center md:text-right">
            <h1 className="text-3xl font-bold text-foreground font-display">الرزنامة</h1>
            <p className="mt-2 text-muted-foreground">
              عرض المناسبات الدينية والوطنية حسب التقويمين الميلادي والهجري
            </p>
          </div>

          <CalendarView />
        </motion.div>
      </main>
    </div>
  );
}
