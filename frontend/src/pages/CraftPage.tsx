import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSiteContent } from '../api/contentApi';
import { Seo } from '../components/Seo';
import { defaultSiteContent, type SiteContent } from '../types/siteContent';
import { getCraftSteps } from '../utils/craftSteps';
import { getUploadedImage } from '../utils/images';

export function CraftPage() {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  useEffect(() => { getSiteContent().then((saved) => setContent({ ...defaultSiteContent, ...saved })).catch(() => undefined); }, []);
  const steps = getCraftSteps(content['craft.steps']);
  const faq = [1, 2, 3].map((number) => ({
    question: content[`craft.faq${number}Question` as keyof SiteContent],
    answer: content[`craft.faq${number}Answer` as keyof SiteContent],
  }));
  const structuredData = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
  };

  return <>
    <Seo title="Как создаются свечи из пчелиного воска — ВоскоСвет" description={content['craft.intro']} path="/craft" structuredData={structuredData} />
    <section className="craft-page">
      <header className="craft-hero"><p className="eyebrow">{content['craft.eyebrow']}</p><h1>{content['craft.title']}</h1><p>{content['craft.intro']}</p><a href="#craft-journey">Начать путешествие <span>↓</span></a></header>
      <div className="craft-journey" id="craft-journey">
        {steps.map((step, index) => <article className="craft-step" key={step.id}>
          <div className="craft-step-copy"><span>{step.number || String(index + 1).padStart(2, '0')}</span><p className="eyebrow">Этап {index + 1}</p><h2>{step.title}</h2><p>{step.text}</p></div>
          <div className="craft-step-media">
            {step.videoUrl ? <video controls playsInline preload="metadata" poster={getUploadedImage(step.posterUrl)}><source src={getUploadedImage(step.videoUrl)} /></video> : <img src={getUploadedImage(step.posterUrl)} alt={`${step.title} — этап создания свечи ВоскоСвет`} />}
            <small>{step.videoUrl ? 'Видео из мастерской' : 'Здесь появится видео из мастерской'}</small>
          </div>
        </article>)}
      </div>
      <section className="craft-knowledge">
        <article><p className="eyebrow">Материал</p><h2>{content['craft.benefitsTitle']}</h2><p>{content['craft.benefitsText']}</p></article>
        <article><p className="eyebrow">Уход</p><h2>{content['craft.burningTitle']}</h2><p>{content['craft.burningText']}</p></article>
      </section>
      <section className="craft-faq"><p className="eyebrow">Коротко о главном</p><h2>Частые вопросы</h2>{faq.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</section>
      <div className="story-cta"><p>Теперь можно выбрать свою свечу.</p><Link className="primary-link" to="/catalog">Перейти в каталог</Link></div>
    </section>
  </>;
}
