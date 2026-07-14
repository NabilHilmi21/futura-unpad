import {
  FAQSection,
  mechaturaFaqs,
  type FAQGroup,
} from "@/components/landing/faq-section";

const mechaturaFaqGroups: FAQGroup[] = [
  {
    title: "Mechatura",
    headingPadding: "pb-6",
    faqs: mechaturaFaqs,
  },
];

export function MechaturaFAQ() {
  return (
    <FAQSection
      id="mechatura-faq"
      title="FAQ Mechatura"
      groups={mechaturaFaqGroups}
      showAllButton={false}
    />
  );
}
