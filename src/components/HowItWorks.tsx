import { motion } from "framer-motion";
import { Search, Send, Link } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Find the post",
    description: "See a reel or post where the influencer asks you to comment & follow? Just copy the link or share it.",
  },
  {
    icon: Send,
    title: "Send it to us",
    description: "DM the reel or post link to our Instagram account. No commenting, no following random pages.",
  },
  {
    icon: Link,
    title: "Get your link",
    description: "We extract the product/resource link and send it right back to your DMs. Done in seconds.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">
            Three steps. <span className="gradient-text">That's it.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            No hoops to jump through. No algorithmic games.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative group"
            >
              <div className="rounded-2xl bg-card border border-border p-8 h-full shadow-card hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-xl gradient-warm-bg flex items-center justify-center mb-6 shadow-warm">
                  <step.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Step {i + 1}
                </div>
                <h3 className="text-xl font-bold font-display mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
