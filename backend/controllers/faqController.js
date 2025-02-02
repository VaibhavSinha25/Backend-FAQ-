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

    // Languages to be translated to
    const languages = ["hi", "bn", "fr"];

    // Translations object to store all translations
    let translations = {};

    for (const lang of languages) {
      const translatedQuestion = await translate(question, {
        to: lang,
      });

      const translatedAnswer = await translate(answer, {
        to: lang,
      });

      translations[lang] = {
        question: translatedQuestion.text,
        answer: translatedAnswer.text,
      };
    }

    // Create FAQ document
    const newFaq = await Faq.create({
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

exports.updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res
        .status(400)
        .json({ success: false, message: "Question and Answer are required." });
    }

    const faq = await Faq.findById(id);
    if (!faq) {
      return res
        .status(404)
        .json({ success: false, message: "FAQ not found." });
    }

    // Languages to be translated to
    const languages = ["hi", "bn", "fr"];

    // Create a list of translation promises
    const translationPromises = languages.map((lang) =>
      Promise.all([
        translate(question, { to: lang }),
        translate(answer, { to: lang }),
      ])
    );

    // Wait for all translations to finish
    const translationsResults = await Promise.all(translationPromises);

    // Map the results into the translations object
    const translations = languages.reduce((acc, lang, index) => {
      const [translatedQuestion, translatedAnswer] = translationsResults[index];
      acc[lang] = {
        question: translatedQuestion.text,
        answer: translatedAnswer.text,
      };
      return acc;
    }, {});

    // Update FAQ document
    const updatedFaq = await Faq.findByIdAndUpdate(
      id,
      { question, answer, translations },
      { new: true } // Return updated document
    );

    res.json({
      success: true,
      message: "FAQ updated successfully",
      data: updatedFaq,
    });
  } catch (error) {
    console.error("Error updating FAQ:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedFaq = await Faq.findByIdAndDelete(id);

    if (!deletedFaq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    res.json({
      success: true,
      message: "FAQ deleted successfully",
      data: deletedFaq,
    });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
