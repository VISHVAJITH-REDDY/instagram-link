import { motion } from "framer-motion";
import { ArrowRight, Instagram } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl gradient-warm-subtle-bg border border-primary/20 p-12 md:p-16 text-center overflow-hidden"
        >
          <div className="absolute inset-0 glow-bg opacity-40" />
          <div className="relative z-10">
            <Instagram className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
              Ready to skip the hassle?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              Send us any Instagram reel or post and get the hidden link instantly. It's free, fast, and automated.
            </p>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl gradient-warm-bg text-primary-foreground font-display font-semibold text-lg shadow-warm hover:scale-105 transition-transform"
            >
              Open Instagram
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="text-center mt-16 text-sm text-muted-foreground">
        <p>Not affiliated with Instagram or Meta. Built to save you time.</p>
      </div>
    </section>
  );
};

export default CTASection;
