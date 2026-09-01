import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSiteContent } from '../api/contentApi';
import { Seo } from '../components/Seo';
import { defaultSiteContent, type SiteContent } from '../types/siteContent';

export function AboutPage() {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  useEffect(() => { getSiteContent().then((saved) => setContent({ ...defaultSiteContent, ...saved })).catch(() => undefined); }, []);

  return <>
    <Seo title="О мастерской ВоскоСвет — свечи ручной работы" description={content['about.intro']} path="/about" />
    <section className="story-page">
      <header className="story-hero">
        <div><p className="eyebrow">{content['about.eyebrow']}</p><h1>{content['about.title']}</h1><p>{content['about.intro']}</p></div>
        <img src="/images/about-natural-candle.webp" alt="Натуральная свеча ВоскоСвет из пчелиного воска" />
      </header>
      <div className="story-block"><p className="eyebrow">Наша история</p><h2>{content['about.storyTitle']}</h2><p>{content['about.storyText']}</p></div>
      <section className="story-values"><h2>{content['about.valuesTitle']}</h2><div>{[1, 2, 3].map((number) => <article key={number}><span>0{number}</span><p>{content[`about.value${number}` as keyof SiteContent]}</p></article>)}</div></section>
      <div className="story-cta"><p>Хотите увидеть процесс своими глазами?</p><Link className="primary-link" to="/craft">Пройти путь свечи</Link></div>
    </section>
  </>;
}
