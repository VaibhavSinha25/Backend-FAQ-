const Faq = require("../model/faqModel"); // Importing the Faq model
const { translate } = require("@vitalets/google-translate-api");

exports.getFaq = async (req, res) => {
  try {
    const { lang } = req.query; // Get language from query parameter

    const faqs = await Faq.find(); // Fetch all FAQs from DB
    // Map FAQs and return translations if available
    const translatedFaqs = faqs.map((faq) => {
      if (lang && faq.translations.get(lang)) {
        return {
          question: faq.translations.get(lang).question,
          answer: faq.translations.get(lang).answer,
        };
      }
      return { question: faq.question, answer: faq.answer }; // Default to English
    });

    res.json({ success: true, data: translatedFaqs });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.createFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res
        .status(400)
        .json({ success: false, message: "Question and Answer are required." });
    }

    //Languages to be translated in :
    const languages = ["hi", "bn", "fr"];

    //Translations object to store all translations
    let translations = {};

    for (const lang of languages) {
      const translatedQuestion = await translate(question, { to: lang });
      const translatedAnswer = await translate(answer, { to: lang });

      translations[lang] = {
        question: translatedQuestion.text,
        answer: translatedAnswer.text,
      };
    }

    // Create FAQ document
    const newFaq = Faq.create({
      question,
      answer,
      translations,
    });

    res.status(201).json({
      success: true,
      message: "FAQ created successfully",
      data: newFaq,
    });
  } catch (error) {
    console.error("Error creating FAQ:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
