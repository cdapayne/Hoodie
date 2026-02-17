import { useState } from 'react';
import './FAQ.css';

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is Maison Hoodie?",
      answer: "Maison Hoodie is a luxury streetwear atelier offering limited edition pieces and curated collections. We specialize in exclusive, atelier-quality designs that are available for a limited time only. Our maison model means we create refined collections and singular pieces that embody the intersection of haute couture and street culture."
    },
    {
      question: "How does the pop-up shop model work?",
      answer: "Our pop-up shop operates on a limited-time basis. We release exclusive collections that are only available while supplies last. Once an item sells out or the collection period ends, it's gone forever. This creates a sense of urgency and exclusivity for our customers who want unique pieces."
    },
    {
      question: "What are your shipping options and costs?",
      answer: "We offer standard shipping (5-7 business days) and expedited shipping (2-3 business days). Free shipping is available on all orders over $100! For orders between $50-$99, enjoy $5 off shipping. Orders under $50 have a flat rate of $8.99 for standard shipping."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping takes 5-7 business days. Expedited shipping takes 2-3 business days. Orders are typically processed and shipped within 24-48 hours of purchase. You'll receive a tracking number via email once your order ships."
    },
    {
      question: "Do you ship internationally?",
      answer: "Currently, we only ship within the United States. We're working on expanding our shipping to international locations in the near future. Sign up for our email list to be notified when international shipping becomes available!"
    },
    {
      question: "What is your return policy?",
      answer: "Due to the limited edition nature of our pop-up collections, all sales are final. We cannot accept returns or exchanges. However, if you receive a defective or damaged item, please contact us within 7 days of delivery and we'll make it right."
    },
    {
      question: "How do I know if an item is limited edition?",
      answer: "Limited edition items are clearly marked with a 'LIMITED EDITION' badge on the product card and product page. These pieces are produced in very small quantities and once they're gone, they won't be restocked."
    },
    {
      question: "When will you restock items?",
      answer: "As a pop-up shop, we don't restock items. Once a product sells out, it's gone forever. This is what makes our collections special and exclusive. We recommend purchasing items you love right away to avoid missing out."
    },
    {
      question: "How can I track my order?",
      answer: "Once your order ships, you'll receive a tracking number via email. You can also track your order on our website by visiting the 'Track Order' page and entering your order number and email address."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, and other secure payment methods through our checkout system."
    },
    {
      question: "How do I contact customer support?",
      answer: "You can reach our customer support team by emailing support@hoodie.com. We typically respond within 24 hours during business days. For urgent matters related to recent orders, please include your order number in the subject line."
    },
    {
      question: "Can I cancel or modify my order?",
      answer: "Orders can only be canceled or modified within the first hour of purchase. After that, orders are processed and prepared for shipment and cannot be changed. Please contact us immediately at support@hoodie.com if you need to make changes."
    },
    {
      question: "Do you have a physical store?",
      answer: "As a pop-up shop, we operate primarily online. However, we occasionally host temporary physical pop-up events in select cities. Follow us on social media and subscribe to our email list to be notified about upcoming pop-up events in your area."
    },
    {
      question: "How do I stay updated on new releases?",
      answer: "Subscribe to our email newsletter to be the first to know about new collections, exclusive drops, and special promotions. You can sign up at the bottom of our homepage. We promise not to spam - only the good stuff!"
    },
    {
      question: "What sizes do you offer?",
      answer: "We offer sizes XS through XXL for most items. Specific sizing information is available on each product page. Due to our limited edition model, some sizes may sell out faster than others, so we recommend ordering early."
    },
    {
      question: "What materials are your products made from?",
      answer: "We use premium materials including high-quality cotton blends, organic cotton, and sustainable fabrics. Each product page includes detailed information about materials and care instructions."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <div className="container">
        <div className="faq-header">
          <h1>Questions & Answers</h1>
          <p>Everything you need to know about Maison Hoodie</p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className={`faq-item ${openIndex === index ? 'open' : ''}`}>
              <button 
                className="faq-question"
                onClick={() => toggleFAQ(index)}
              >
                <span>{faq.question}</span>
                <span className="faq-icon">{openIndex === index ? '−' : '+'}</span>
              </button>
              {openIndex === index && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="faq-contact">
          <h2>Need Further Assistance?</h2>
          <p>Our concierge team is available to address any additional inquiries you may have.</p>
          <a href="mailto:concierge@maisonhoodie.com" className="btn btn-primary">Contact Concierge</a>
        </div>
      </div>
    </div>
  );
}

export default FAQ;
