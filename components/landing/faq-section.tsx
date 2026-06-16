const faqs = [
  {
    question: "Is this beginner-friendly?",
    answer:
      "Yes, especially the seminar. The competition and research tracks are better if you already have a team, project, or question to bring.",
  },
  {
    question: "How do I register?",
    answer:
      "Choose a program, complete the form, and follow the confirmation steps from the committee.",
  },
  {
    question: "Can I participate online?",
    answer:
      "Selected seminar sessions may support online participation. Competition and research formats depend on the technical guide.",
  },
  {
    question: "Will participants receive certificates?",
    answer:
      "Yes. Eligible participants who complete the event requirements will receive an official Futura certificate.",
  },
]

export function FAQSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="bg-[#fbfbf8] px-5 py-24 text-slate-950 sm:px-8"
    >
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-sky-700">
            FAQ
          </p>
          <h2
            id="faq-heading"
            className="font-heading mt-6 text-5xl font-medium leading-[0.96] text-balance sm:text-7xl"
          >
            A few useful answers.
          </h2>
        </div>

        <div className="mt-14 divide-y divide-slate-200 border-y border-slate-200">
          {faqs.map((faq, index) => (
            <details key={faq.question} className="py-6" open={index === 0}>
              <summary className="cursor-pointer list-none text-lg font-medium text-slate-950">
                {faq.question}
              </summary>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
