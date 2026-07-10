import {
  FAQSection,
  nationalSeminarFaqs,
  type FAQGroup,
} from "@/components/landing/faq-section";

const seminarFaqGroups: FAQGroup[] = [
  {
    title: "National Seminar",
    headingPadding: "pb-6",
    faqs: nationalSeminarFaqs,
  },
];

export function SeminarFAQ() {
  return (
    <FAQSection
      id="seminar-faq"
      title="Seminar Questions."
      groups={seminarFaqGroups}
      showAllButton={false}
    />
  );
}
