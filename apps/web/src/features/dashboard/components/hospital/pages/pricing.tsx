"use client";

import { useState } from "react";
import {
  Check,
  X,
  ArrowRight,
  Zap,
  Shield,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/features/dashboard/components/ui/badge";
import { Card } from "@/features/dashboard/components/ui/card";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly"
  );

  const plans = [
    {
      id: "starter",
      name: "Starter",
      description: "Perfect for small clinics starting out",
      price: 9999,
      priceDisplay: "₹9,999",
      popular: false,
      badge: null,
      features: [
        { name: "Up to 500 patients", included: true },
        { name: "Basic appointment management", included: true },
        { name: "5 staff members", included: true },
        { name: "Standard support", included: true },
        { name: "Basic analytics", included: true },
        { name: "Email support", included: true },
        { name: "Advanced AI features", included: false },
        { name: "Multi-facility management", included: false },
        { name: "Priority support", included: false },
      ],
      cta: "Get Started",
      ctaVariant: "outline" as const,
    },
    {
      id: "professional",
      name: "Professional",
      description: "Best for growing healthcare facilities",
      price: 14999,
      priceDisplay: "₹14,999",
      popular: true,
      badge: "MOST POPULAR",
      features: [
        { name: "Unlimited patients", included: true },
        { name: "Advanced scheduling & automation", included: true },
        { name: "20 staff members", included: true },
        { name: "Priority 24/7 support", included: true },
        { name: "Advanced analytics & reporting", included: true },
        { name: "Custom integrations", included: true },
        { name: "AI Diagnostics Assistant", included: true },
        { name: "Multi-facility management", included: false },
        { name: "Dedicated account manager", included: false },
      ],
      cta: "Start Free Trial",
      ctaVariant: "default" as const,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "For large hospital networks & systems",
      price: 24999,
      priceDisplay: "₹24,999",
      popular: false,
      badge: "CUSTOM PRICING",
      features: [
        { name: "Custom patient capacity", included: true },
        { name: "Complete automation suite", included: true },
        { name: "Unlimited staff members", included: true },
        { name: "Dedicated support team", included: true },
        { name: "Real-time advanced analytics", included: true },
        { name: "Full API access & webhooks", included: true },
        { name: "AI Diagnostics + Predictive Analytics", included: true },
        { name: "Multi-facility with unlimited branches", included: true },
        { name: "Dedicated account manager", included: true },
      ],
      cta: "Contact Sales",
      ctaVariant: "outline" as const,
    },
  ];

  const comparison = [
    {
      category: "Core Features",
      features: [
        {
          name: "Patient Records",
          starter: "Up to 500",
          professional: "Unlimited",
          enterprise: "Custom",
        },
        {
          name: "Appointment Slots/Day",
          starter: "50",
          professional: "500",
          enterprise: "Unlimited",
        },
        {
          name: "Staff Members",
          starter: "5",
          professional: "20",
          enterprise: "Unlimited",
        },
        {
          name: "Facilities",
          starter: "1",
          professional: "3",
          enterprise: "Unlimited",
        },
      ],
    },
    {
      category: "Advanced Features",
      features: [
        {
          name: "AI Diagnostics Assistant",
          starter: false,
          professional: true,
          enterprise: true,
        },
        {
          name: "Predictive Analytics",
          starter: false,
          professional: false,
          enterprise: true,
        },
        {
          name: "Automated Billing",
          starter: false,
          professional: true,
          enterprise: true,
        },
        {
          name: "Custom Workflows",
          starter: false,
          professional: true,
          enterprise: true,
        },
        {
          name: "HIPAA Compliance",
          starter: true,
          professional: true,
          enterprise: true,
        },
      ],
    },
    {
      category: "Support & Integration",
      features: [
        {
          name: "Email Support",
          starter: true,
          professional: true,
          enterprise: true,
        },
        {
          name: "24/7 Phone Support",
          starter: false,
          professional: true,
          enterprise: true,
        },
        {
          name: "Dedicated Account Manager",
          starter: false,
          professional: false,
          enterprise: true,
        },
        {
          name: "Custom Integrations",
          starter: false,
          professional: true,
          enterprise: true,
        },
        {
          name: "API Access",
          starter: false,
          professional: true,
          enterprise: true,
        },
      ],
    },
  ];

  return (
    <div className="px-5 py-8 sm:px-6 lg:px-10">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <Badge className="mb-4 bg-accent/20 text-accent border-0">
          Flexible Pricing Plans
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
          Flexible Plans for Every Healthcare Facility
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Scale your clinic operations with our secure, multi-tenant ERP
          platform designed for modern healthcare providers
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={cn(
              "px-6 py-2 rounded-lg font-medium transition-all",
              billingCycle === "monthly"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={cn(
              "px-6 py-2 rounded-lg font-medium transition-all relative",
              billingCycle === "annual"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            Annual Billing
            <span className="absolute -top-8 right-0 text-xs font-semibold text-success">
              Save 15%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative group transition-all duration-300",
                plan.popular && "md:scale-105 md:z-10"
              )}
            >
              {/* Popular Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <Badge className="bg-accent text-accent-foreground border-0 px-4 py-1 font-semibold">
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <Card
                className={cn(
                  "h-full flex flex-col p-6 transition-all duration-300",
                  plan.popular
                    ? "border-2 border-primary bg-card shadow-2xl"
                    : "border border-border hover:border-primary/50"
                )}
              >
                {/* Plan Info */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-bold text-foreground">
                      {plan.priceDisplay}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>

                  <Button
                    className="w-full gap-2"
                    variant={plan.ctaVariant}
                    size="lg"
                  >
                    {plan.cta}
                    <ArrowRight size={18} />
                  </Button>
                </div>

                {/* Features */}
                <div className="flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-4 tracking-wide">
                    What&apos;s Included
                  </p>
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check
                            size={18}
                            className="text-success flex-shrink-0 mt-0.5"
                          />
                        ) : (
                          <X
                            size={18}
                            className="text-muted-foreground/30 flex-shrink-0 mt-0.5"
                          />
                        )}
                        <span
                          className={cn(
                            "text-sm",
                            feature.included
                              ? "text-foreground"
                              : "text-muted-foreground/50"
                          )}
                        >
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="max-w-4xl mx-auto mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Zap,
              title: "Lightning Fast",
              description: "Sub-second response times with real-time updates",
            },
            {
              icon: Shield,
              title: "Enterprise Security",
              description: "HIPAA compliant with end-to-end encryption",
            },
            {
              icon: Headphones,
              title: "Expert Support",
              description: "24/7 dedicated support team for Enterprise plans",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card key={idx} className="border border-border p-6">
                <Icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Detailed Comparison */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Detailed Feature Comparison
          </h2>
          <p className="text-muted-foreground">
            Complete breakdown of all capabilities across tiers
          </p>
        </div>

        <div className="space-y-8">
          {comparison.map((section, idx) => (
            <div
              key={idx}
              className="overflow-hidden rounded-lg border border-border"
            >
              <div className="bg-card/50 px-6 py-4 border-b border-border">
                <h3 className="font-semibold text-foreground">
                  {section.category}
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-6 py-3 font-semibold text-foreground text-sm">
                        Feature
                      </th>
                      <th className="text-center px-6 py-3 font-semibold text-foreground text-sm">
                        Starter
                      </th>
                      <th className="text-center px-6 py-3 font-semibold text-foreground text-sm">
                        Professional
                      </th>
                      <th className="text-center px-6 py-3 font-semibold text-foreground text-sm">
                        Enterprise
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.features.map((feature, featureIdx) => (
                      <tr
                        key={featureIdx}
                        className="border-b border-border/50 hover:bg-card/30 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-foreground font-medium">
                          {feature.name}
                        </td>
                        <td className="px-6 py-4 text-center text-sm">
                          {typeof feature.starter === "boolean" ? (
                            feature.starter ? (
                              <Check className="w-5 h-5 text-success inline" />
                            ) : (
                              <X className="w-5 h-5 text-muted-foreground/30 inline" />
                            )
                          ) : (
                            <span className="text-muted-foreground">
                              {feature.starter}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center text-sm">
                          {typeof feature.professional === "boolean" ? (
                            feature.professional ? (
                              <Check className="w-5 h-5 text-success inline" />
                            ) : (
                              <X className="w-5 h-5 text-muted-foreground/30 inline" />
                            )
                          ) : (
                            <span className="text-muted-foreground">
                              {feature.professional}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center text-sm">
                          {typeof feature.enterprise === "boolean" ? (
                            feature.enterprise ? (
                              <Check className="w-5 h-5 text-success inline" />
                            ) : (
                              <X className="w-5 h-5 text-muted-foreground/30 inline" />
                            )
                          ) : (
                            <span className="text-muted-foreground">
                              {feature.enterprise}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto mt-16 pt-12 border-t border-border">
        <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {[
            {
              q: "Can I change my plan anytime?",
              a: "Yes! You can upgrade or downgrade your plan anytime. Changes take effect on your next billing cycle.",
            },
            {
              q: "Do you offer discounts for annual billing?",
              a: "Yes! Save 15% when you switch to annual billing. You can change to annual anytime from your account settings.",
            },
            {
              q: "What payment methods do you accept?",
              a: "We accept all major credit cards, bank transfers, and digital payment methods. Custom payment arrangements available for Enterprise plans.",
            },
            {
              q: "Is there a free trial?",
              a: "Professional and Enterprise plans come with a 14-day free trial. No credit card required to get started.",
            },
          ].map((faq, idx) => (
            <details
              key={idx}
              className="group border border-border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors"
            >
              <summary className="flex items-center justify-between font-semibold text-foreground">
                {faq.q}
                <span className="group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="text-muted-foreground text-sm mt-4">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-2xl mx-auto mt-16 bg-primary/10 border border-primary/30 rounded-xl p-8 text-center">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Ready to Transform Your Healthcare Operations?
        </h3>
        <p className="text-muted-foreground mb-6">
          Join 500+ healthcare facilities already using Viruj Health to
          streamline their operations
        </p>
        <Button size="lg" className="gap-2">
          Start Free Trial <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
}
