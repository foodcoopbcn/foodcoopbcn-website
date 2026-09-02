/*
 * GENERATED once by scripts/extract-page-copy.mjs, then maintained by hand.
 *
 * One Keystatic singleton per page, so the co-op can edit the prose that used to
 * live in .astro frontmatter. Figures stay as {tokens} and are substituted at
 * render by src/lib/copy.ts, so a number can never be typed into a sentence and
 * then drift from src/config/site.ts.
 */
import { fields, singleton } from '@keystatic/core';

type Schema = Parameters<typeof singleton>[0]['schema'];

const page = (label: string, path: `${string}/${string}`, schema: Schema) =>
  singleton({ label, path, format: { data: 'yaml' }, schema });

export const copySingletons = {
  copy_com_funciona_ca: page(
    'Text: com-funciona (CA)',
    'src/content/copy/ca/com-funciona',
    {
      eyebrow: fields.text({ label: 'Eyebrow' }),
      title: fields.text({ label: 'Title' }),
      intro: fields.text({ label: 'Intro', multiline: true }),
      stepsTitle: fields.text({ label: 'Steps Title' }),
      stepsIntro: fields.text({ label: 'Steps Intro', multiline: true }),
      steps: fields.array(fields.object(
          {
          icon: fields.text({ label: 'Icon' }),
          t: fields.text({ label: 'T' }),
          d: fields.text({ label: 'D', multiline: true }),
          },
          { label: 'Steps' },
        ), { label: 'Steps', itemLabel: (p) => p.fields.t.value }),
      whyTitle: fields.text({ label: 'Why Title' }),
      why: fields.array(fields.object(
          {
          icon: fields.text({ label: 'Icon' }),
          t: fields.text({ label: 'T' }),
          d: fields.text({ label: 'D', multiline: true }),
          },
          { label: 'Why' },
        ), { label: 'Why', itemLabel: (p) => p.fields.t.value }),
      compareTitle: fields.text({ label: 'Compare Title' }),
      compareRows: fields.array(fields.object(
          {
          a: fields.text({ label: 'A', multiline: true }),
          b: fields.text({ label: 'B' }),
          c: fields.text({ label: 'C' }),
          },
          { label: 'Compare Rows' },
        ), { label: 'Compare Rows' }),
      compareHeads: fields.array(fields.text({ label: 'Compare Heads' }), { label: 'Compare Heads' }),
      modelTitle: fields.text({ label: 'Model Title' }),
      modelText: fields.text({ label: 'Model Text', multiline: true }),
      finalTitle: fields.text({ label: 'Final Title' }),
      finalText: fields.text({ label: 'Final Text', multiline: true }),
    },
  ),
  copy_com_funciona_es: page(
    'Text: com-funciona (ES)',
    'src/content/copy/es/com-funciona',
    {
      eyebrow: fields.text({ label: 'Eyebrow' }),
      title: fields.text({ label: 'Title' }),
      intro: fields.text({ label: 'Intro', multiline: true }),
      stepsTitle: fields.text({ label: 'Steps Title' }),
      stepsIntro: fields.text({ label: 'Steps Intro', multiline: true }),
      steps: fields.array(fields.object(
          {
          icon: fields.text({ label: 'Icon' }),
          t: fields.text({ label: 'T' }),
          d: fields.text({ label: 'D', multiline: true }),
          },
          { label: 'Steps' },
        ), { label: 'Steps', itemLabel: (p) => p.fields.t.value }),
      whyTitle: fields.text({ label: 'Why Title' }),
      why: fields.array(fields.object(
          {
          icon: fields.text({ label: 'Icon' }),
          t: fields.text({ label: 'T' }),
          d: fields.text({ label: 'D', multiline: true }),
          },
          { label: 'Why' },
        ), { label: 'Why', itemLabel: (p) => p.fields.t.value }),
      compareTitle: fields.text({ label: 'Compare Title' }),
      compareRows: fields.array(fields.object(
          {
          a: fields.text({ label: 'A', multiline: true }),
          b: fields.text({ label: 'B' }),
          c: fields.text({ label: 'C' }),
          },
          { label: 'Compare Rows' },
        ), { label: 'Compare Rows' }),
      compareHeads: fields.array(fields.text({ label: 'Compare Heads' }), { label: 'Compare Heads' }),
      modelTitle: fields.text({ label: 'Model Title' }),
      modelText: fields.text({ label: 'Model Text', multiline: true }),
      finalTitle: fields.text({ label: 'Final Title' }),
      finalText: fields.text({ label: 'Final Text', multiline: true }),
    },
  ),
  copy_comparativa_ca: page(
    'Text: comparativa (CA)',
    'src/content/copy/ca/comparativa',
    {
      eyebrow: fields.text({ label: 'Eyebrow' }),
      title: fields.text({ label: 'Title' }),
      tableTitle: fields.text({ label: 'Table Title' }),
      intro: fields.text({ label: 'Intro', multiline: true }),
      unavailableTitle: fields.text({ label: 'Unavailable Title' }),
      unavailableText: fields.text({ label: 'Unavailable Text', multiline: true }),
      honestTitle: fields.text({ label: 'Honest Title' }),
      honest: fields.array(fields.object(
          {
          t: fields.text({ label: 'T' }),
          d: fields.text({ label: 'D', multiline: true }),
          },
          { label: 'Honest' },
        ), { label: 'Honest', itemLabel: (p) => p.fields.t.value }),
      finalTitle: fields.text({ label: 'Final Title' }),
      finalText: fields.text({ label: 'Final Text', multiline: true }),
    },
  ),
  copy_comparativa_es: page(
    'Text: comparativa (ES)',
    'src/content/copy/es/comparativa',
    {
      eyebrow: fields.text({ label: 'Eyebrow' }),
      title: fields.text({ label: 'Title' }),
      tableTitle: fields.text({ label: 'Table Title' }),
      intro: fields.text({ label: 'Intro', multiline: true }),
      unavailableTitle: fields.text({ label: 'Unavailable Title' }),
      unavailableText: fields.text({ label: 'Unavailable Text', multiline: true }),
      honestTitle: fields.text({ label: 'Honest Title' }),
      honest: fields.array(fields.object(
          {
          t: fields.text({ label: 'T' }),
          d: fields.text({ label: 'D', multiline: true }),
          },
          { label: 'Honest' },
        ), { label: 'Honest', itemLabel: (p) => p.fields.t.value }),
      finalTitle: fields.text({ label: 'Final Title' }),
      finalText: fields.text({ label: 'Final Text', multiline: true }),
    },
  ),
  copy_contacte_ca: page(
    'Text: contacte (CA)',
    'src/content/copy/ca/contacte',
    {
      topic: fields.text({ label: 'Topic' }),
      consent: fields.text({ label: 'Consent' }),
      consentNote: fields.text({ label: 'Consent Note', multiline: true }),
      read: fields.text({ label: 'Read' }),
    },
  ),
  copy_contacte_es: page(
    'Text: contacte (ES)',
    'src/content/copy/es/contacte',
    {
      topic: fields.text({ label: 'Topic' }),
      consent: fields.text({ label: 'Consent' }),
      consentNote: fields.text({ label: 'Consent Note', multiline: true }),
      read: fields.text({ label: 'Read' }),
    },
  ),
  copy_el_super_ca: page(
    'Text: el-super (CA)',
    'src/content/copy/ca/el-super',
    {
      title: fields.text({ label: 'Title' }),
      heading: fields.text({ label: 'Heading' }),
      intro: fields.text({ label: 'Intro', multiline: true }),
      features: fields.array(fields.object(
          {
          icon: fields.text({ label: 'Icon' }),
          title: fields.text({ label: 'Title' }),
          text: fields.text({ label: 'Text', multiline: true }),
          },
          { label: 'Features' },
        ), { label: 'Features', itemLabel: (p) => p.fields.title.value }),
      shopTitle: fields.text({ label: 'Shop Title' }),
      shopText: fields.text({ label: 'Shop Text', multiline: true }),
      hoursTitle: fields.text({ label: 'Hours Title' }),
      transit: fields.text({ label: 'Transit' }),
      directions: fields.text({ label: 'Directions' }),
      visit: fields.text({ label: 'Visit' }),
    },
  ),
  copy_el_super_es: page(
    'Text: el-super (ES)',
    'src/content/copy/es/el-super',
    {
      title: fields.text({ label: 'Title' }),
      heading: fields.text({ label: 'Heading' }),
      intro: fields.text({ label: 'Intro', multiline: true }),
      features: fields.array(fields.object(
          {
          icon: fields.text({ label: 'Icon' }),
          title: fields.text({ label: 'Title' }),
          text: fields.text({ label: 'Text', multiline: true }),
          },
          { label: 'Features' },
        ), { label: 'Features', itemLabel: (p) => p.fields.title.value }),
      shopTitle: fields.text({ label: 'Shop Title' }),
      shopText: fields.text({ label: 'Shop Text', multiline: true }),
      hoursTitle: fields.text({ label: 'Hours Title' }),
      transit: fields.text({ label: 'Transit' }),
      directions: fields.text({ label: 'Directions' }),
      visit: fields.text({ label: 'Visit' }),
    },
  ),
  copy_fes_te_socia_ca: page(
    'Text: fes-te-socia (CA)',
    'src/content/copy/ca/fes-te-socia',
    {
      eyebrow: fields.text({ label: 'Eyebrow' }),
      title: fields.text({ label: 'Title' }),
      intro: fields.text({ label: 'Intro', multiline: true }),
      ctaPrimary: fields.text({ label: 'Cta Primary' }),
      ctaSecondary: fields.text({ label: 'Cta Secondary' }),
      benefitsTitle: fields.text({ label: 'Benefits Title' }),
      benefits: fields.array(fields.text({ label: 'Benefits' }), { label: 'Benefits' }),
      priceLabel: fields.text({ label: 'Price Label' }),
      priceNote: fields.text({ label: 'Price Note', multiline: true }),
      waysTitle: fields.text({ label: 'Ways Title' }),
      waysIntro: fields.text({ label: 'Ways Intro', multiline: true }),
      ways: fields.array(fields.object(
          {
          icon: fields.text({ label: 'Icon' }),
          badge: fields.text({ label: 'Badge' }),
          title: fields.text({ label: 'Title' }),
          meta: fields.text({ label: 'Meta' }),
          text: fields.text({ label: 'Text', multiline: true }),
          points: fields.array(fields.text({ label: 'Points' }), { label: 'Points' }),
          },
          { label: 'Ways' },
        ), { label: 'Ways', itemLabel: (p) => p.fields.title.value }),
      waysNote: fields.text({ label: 'Ways Note', multiline: true }),
      stepsTitle: fields.text({ label: 'Steps Title' }),
      steps: fields.array(fields.object(
          {
          n: fields.text({ label: 'N' }),
          t: fields.text({ label: 'T' }),
          d: fields.text({ label: 'D', multiline: true }),
          },
          { label: 'Steps' },
        ), { label: 'Steps', itemLabel: (p) => p.fields.t.value }),
      doubtsTitle: fields.text({ label: 'Doubts Title' }),
      doubts: fields.array(fields.object(
          {
          q: fields.text({ label: 'Q' }),
          a: fields.text({ label: 'A', multiline: true }),
          },
          { label: 'Doubts' },
        ), { label: 'Doubts', itemLabel: (p) => p.fields.q.value }),
      whoTitle: fields.text({ label: 'Who Title' }),
      whoIntro: fields.text({ label: 'Who Intro', multiline: true }),
      options: fields.array(fields.object(
          {
          title: fields.text({ label: 'Title' }),
          featured: fields.checkbox({ label: 'Featured', defaultValue: true }),
          badge: fields.text({ label: 'Badge' }),
          text: fields.text({ label: 'Text', multiline: true }),
          points: fields.array(fields.text({ label: 'Points' }), { label: 'Points' }),
          cta: fields.object(
            {
            label: fields.text({ label: 'Label' }),
            href: fields.text({ label: 'Href' }),
            },
            { label: 'Cta' },
          ),
          },
          { label: 'Options' },
        ), { label: 'Options', itemLabel: (p) => p.fields.title.value }),
      finalTitle: fields.text({ label: 'Final Title' }),
      finalText: fields.text({ label: 'Final Text', multiline: true }),
    },
  ),
  copy_fes_te_socia_es: page(
    'Text: fes-te-socia (ES)',
    'src/content/copy/es/fes-te-socia',
    {
      eyebrow: fields.text({ label: 'Eyebrow' }),
      title: fields.text({ label: 'Title' }),
      intro: fields.text({ label: 'Intro', multiline: true }),
      ctaPrimary: fields.text({ label: 'Cta Primary' }),
      ctaSecondary: fields.text({ label: 'Cta Secondary' }),
      benefitsTitle: fields.text({ label: 'Benefits Title' }),
      benefits: fields.array(fields.text({ label: 'Benefits' }), { label: 'Benefits' }),
      priceLabel: fields.text({ label: 'Price Label' }),
      priceNote: fields.text({ label: 'Price Note', multiline: true }),
      waysTitle: fields.text({ label: 'Ways Title' }),
      waysIntro: fields.text({ label: 'Ways Intro', multiline: true }),
      ways: fields.array(fields.object(
          {
          icon: fields.text({ label: 'Icon' }),
          badge: fields.text({ label: 'Badge' }),
          title: fields.text({ label: 'Title' }),
          meta: fields.text({ label: 'Meta' }),
          text: fields.text({ label: 'Text', multiline: true }),
          points: fields.array(fields.text({ label: 'Points' }), { label: 'Points' }),
          },
          { label: 'Ways' },
        ), { label: 'Ways', itemLabel: (p) => p.fields.title.value }),
      waysNote: fields.text({ label: 'Ways Note', multiline: true }),
      stepsTitle: fields.text({ label: 'Steps Title' }),
      steps: fields.array(fields.object(
          {
          n: fields.text({ label: 'N' }),
          t: fields.text({ label: 'T' }),
          d: fields.text({ label: 'D', multiline: true }),
          },
          { label: 'Steps' },
        ), { label: 'Steps', itemLabel: (p) => p.fields.t.value }),
      doubtsTitle: fields.text({ label: 'Doubts Title' }),
      doubts: fields.array(fields.object(
          {
          q: fields.text({ label: 'Q' }),
          a: fields.text({ label: 'A', multiline: true }),
          },
          { label: 'Doubts' },
        ), { label: 'Doubts', itemLabel: (p) => p.fields.q.value }),
      whoTitle: fields.text({ label: 'Who Title' }),
      whoIntro: fields.text({ label: 'Who Intro', multiline: true }),
      options: fields.array(fields.object(
          {
          title: fields.text({ label: 'Title' }),
          featured: fields.checkbox({ label: 'Featured', defaultValue: true }),
          badge: fields.text({ label: 'Badge' }),
          text: fields.text({ label: 'Text', multiline: true }),
          points: fields.array(fields.text({ label: 'Points' }), { label: 'Points' }),
          cta: fields.object(
            {
            label: fields.text({ label: 'Label' }),
            href: fields.text({ label: 'Href' }),
            },
            { label: 'Cta' },
          ),
          },
          { label: 'Options' },
        ), { label: 'Options', itemLabel: (p) => p.fields.title.value }),
      finalTitle: fields.text({ label: 'Final Title' }),
      finalText: fields.text({ label: 'Final Text', multiline: true }),
    },
  ),
  copy_not_found_ca: page(
    'Text: not-found (CA)',
    'src/content/copy/ca/not-found',
    {
      title: fields.text({ label: 'Title' }),
      text: fields.text({ label: 'Text', multiline: true }),
      links: fields.array(fields.object(
          {
          label: fields.text({ label: 'Label' }),
          href: fields.text({ label: 'Href' }),
          primary: fields.checkbox({ label: 'Primary', defaultValue: true }),
          },
          { label: 'Links' },
        ), { label: 'Links', itemLabel: (p) => p.fields.label.value }),
      searchLabel: fields.text({ label: 'Search Label' }),
      searchCta: fields.text({ label: 'Search Cta' }),
      visit: fields.text({ label: 'Visit' }),
    },
  ),
  copy_not_found_es: page(
    'Text: not-found (ES)',
    'src/content/copy/es/not-found',
    {
      title: fields.text({ label: 'Title' }),
      text: fields.text({ label: 'Text', multiline: true }),
      links: fields.array(fields.object(
          {
          label: fields.text({ label: 'Label' }),
          href: fields.text({ label: 'Href' }),
          primary: fields.checkbox({ label: 'Primary', defaultValue: true }),
          },
          { label: 'Links' },
        ), { label: 'Links', itemLabel: (p) => p.fields.label.value }),
      searchLabel: fields.text({ label: 'Search Label' }),
      searchCta: fields.text({ label: 'Search Cta' }),
      visit: fields.text({ label: 'Visit' }),
    },
  ),
  copy_premsa_ca: page(
    'Text: premsa (CA)',
    'src/content/copy/ca/premsa',
    {
      eyebrow: fields.text({ label: 'Eyebrow' }),
      title: fields.text({ label: 'Title' }),
      intro: fields.text({ label: 'Intro', multiline: true }),
      kinds: fields.object(
        {
        premsa: fields.text({ label: 'Premsa' }),
        institucio: fields.text({ label: 'Institucio' }),
        guia: fields.text({ label: 'Guia' }),
        },
        { label: 'Kinds' },
      ),
      contactTitle: fields.text({ label: 'Contact Title' }),
      contactText: fields.text({ label: 'Contact Text', multiline: true }),
      materialTitle: fields.text({ label: 'Material Title' }),
      materials: fields.array(fields.object(
          {
          label: fields.text({ label: 'Label' }),
          href: fields.text({ label: 'Href' }),
          },
          { label: 'Materials' },
        ), { label: 'Materials', itemLabel: (p) => p.fields.label.value }),
      finalTitle: fields.text({ label: 'Final Title' }),
      finalText: fields.text({ label: 'Final Text', multiline: true }),
    },
  ),
  copy_premsa_es: page(
    'Text: premsa (ES)',
    'src/content/copy/es/premsa',
    {
      eyebrow: fields.text({ label: 'Eyebrow' }),
      title: fields.text({ label: 'Title' }),
      intro: fields.text({ label: 'Intro', multiline: true }),
      kinds: fields.object(
        {
        premsa: fields.text({ label: 'Premsa' }),
        institucio: fields.text({ label: 'Institucio' }),
        guia: fields.text({ label: 'Guia' }),
        },
        { label: 'Kinds' },
      ),
      contactTitle: fields.text({ label: 'Contact Title' }),
      contactText: fields.text({ label: 'Contact Text', multiline: true }),
      materialTitle: fields.text({ label: 'Material Title' }),
      materials: fields.array(fields.object(
          {
          label: fields.text({ label: 'Label' }),
          href: fields.text({ label: 'Href' }),
          },
          { label: 'Materials' },
        ), { label: 'Materials', itemLabel: (p) => p.fields.label.value }),
      finalTitle: fields.text({ label: 'Final Title' }),
      finalText: fields.text({ label: 'Final Text', multiline: true }),
    },
  ),
  copy_preus_ca: page(
    'Text: preus (CA)',
    'src/content/copy/ca/preus',
    {
      eyebrow: fields.text({ label: 'Eyebrow' }),
      title: fields.text({ label: 'Title' }),
      intro: fields.text({ label: 'Intro', multiline: true }),
      capitalTitle: fields.text({ label: 'Capital Title' }),
      capitalNote: fields.text({ label: 'Capital Note', multiline: true }),
      capitalText: fields.text({ label: 'Capital Text', multiline: true }),
      rows: fields.array(fields.object(
          {
          what: fields.text({ label: 'What' }),
          amount: fields.text({ label: 'Amount' }),
          when: fields.text({ label: 'When' }),
          },
          { label: 'Rows' },
        ), { label: 'Rows' }),
      quotaTitle: fields.text({ label: 'Quota Title' }),
      quotaText: fields.text({ label: 'Quota Text', multiline: true }),
      quotas: fields.array(fields.object(
          {
          name: fields.text({ label: 'Name' }),
          amount: fields.text({ label: 'Amount' }),
          per: fields.text({ label: 'Per' }),
          note: fields.text({ label: 'Note', multiline: true }),
          featured: fields.checkbox({ label: 'Featured', defaultValue: true }),
          },
          { label: 'Quotas' },
        ), { label: 'Quotas', itemLabel: (p) => p.fields.name.value }),
      deliveryTitle: fields.text({ label: 'Delivery Title' }),
      deliveryText: fields.text({ label: 'Delivery Text', multiline: true }),
      deliveries: fields.array(fields.object(
          {
          what: fields.text({ label: 'What' }),
          amount: fields.text({ label: 'Amount' }),
          },
          { label: 'Deliveries' },
        ), { label: 'Deliveries' }),
      freeTitle: fields.text({ label: 'Free Title' }),
      free: fields.array(fields.text({ label: 'Free' }), { label: 'Free' }),
      marginTitle: fields.text({ label: 'Margin Title' }),
      marginText: fields.text({ label: 'Margin Text', multiline: true }),
      marginLink: fields.text({ label: 'Margin Link' }),
      finalTitle: fields.text({ label: 'Final Title' }),
      finalText: fields.text({ label: 'Final Text', multiline: true }),
    },
  ),
  copy_preus_es: page(
    'Text: preus (ES)',
    'src/content/copy/es/preus',
    {
      eyebrow: fields.text({ label: 'Eyebrow' }),
      title: fields.text({ label: 'Title' }),
      intro: fields.text({ label: 'Intro', multiline: true }),
      capitalTitle: fields.text({ label: 'Capital Title' }),
      capitalNote: fields.text({ label: 'Capital Note', multiline: true }),
      capitalText: fields.text({ label: 'Capital Text', multiline: true }),
      rows: fields.array(fields.object(
          {
          what: fields.text({ label: 'What' }),
          amount: fields.text({ label: 'Amount' }),
          when: fields.text({ label: 'When' }),
          },
          { label: 'Rows' },
        ), { label: 'Rows' }),
      quotaTitle: fields.text({ label: 'Quota Title' }),
      quotaText: fields.text({ label: 'Quota Text', multiline: true }),
      quotas: fields.array(fields.object(
          {
          name: fields.text({ label: 'Name' }),
          amount: fields.text({ label: 'Amount' }),
          per: fields.text({ label: 'Per' }),
          note: fields.text({ label: 'Note', multiline: true }),
          featured: fields.checkbox({ label: 'Featured', defaultValue: true }),
          },
          { label: 'Quotas' },
        ), { label: 'Quotas', itemLabel: (p) => p.fields.name.value }),
      deliveryTitle: fields.text({ label: 'Delivery Title' }),
      deliveryText: fields.text({ label: 'Delivery Text', multiline: true }),
      deliveries: fields.array(fields.object(
          {
          what: fields.text({ label: 'What' }),
          amount: fields.text({ label: 'Amount' }),
          },
          { label: 'Deliveries' },
        ), { label: 'Deliveries' }),
      freeTitle: fields.text({ label: 'Free Title' }),
      free: fields.array(fields.text({ label: 'Free' }), { label: 'Free' }),
      marginTitle: fields.text({ label: 'Margin Title' }),
      marginText: fields.text({ label: 'Margin Text', multiline: true }),
      marginLink: fields.text({ label: 'Margin Link' }),
      finalTitle: fields.text({ label: 'Final Title' }),
      finalText: fields.text({ label: 'Final Text', multiline: true }),
    },
  ),
  copy_productes_ca: page(
    'Text: productes (CA)',
    'src/content/copy/ca/productes',
    {
      title: fields.text({ label: 'Title' }),
      heading: fields.text({ label: 'Heading' }),
      intro: fields.text({ label: 'Intro', multiline: true }),
      cats: fields.array(fields.object(
          {
          icon: fields.text({ label: 'Icon' }),
          title: fields.text({ label: 'Title' }),
          text: fields.text({ label: 'Text', multiline: true }),
          },
          { label: 'Cats' },
        ), { label: 'Cats', itemLabel: (p) => p.fields.title.value }),
      noteTitle: fields.text({ label: 'Note Title' }),
      note: fields.text({ label: 'Note', multiline: true }),
      noteCta: fields.text({ label: 'Note Cta' }),
    },
  ),
  copy_productes_es: page(
    'Text: productes (ES)',
    'src/content/copy/es/productes',
    {
      title: fields.text({ label: 'Title' }),
      heading: fields.text({ label: 'Heading' }),
      intro: fields.text({ label: 'Intro', multiline: true }),
      cats: fields.array(fields.object(
          {
          icon: fields.text({ label: 'Icon' }),
          title: fields.text({ label: 'Title' }),
          text: fields.text({ label: 'Text', multiline: true }),
          },
          { label: 'Cats' },
        ), { label: 'Cats', itemLabel: (p) => p.fields.title.value }),
      noteTitle: fields.text({ label: 'Note Title' }),
      note: fields.text({ label: 'Note', multiline: true }),
      noteCta: fields.text({ label: 'Note Cta' }),
    },
  ),
  copy_qui_som_ca: page(
    'Text: qui-som (CA)',
    'src/content/copy/ca/qui-som',
    {
      title: fields.text({ label: 'Title' }),
      intro: fields.text({ label: 'Intro', multiline: true }),
      valuesTitle: fields.text({ label: 'Values Title' }),
      valuesIntro: fields.text({ label: 'Values Intro', multiline: true }),
      values: fields.array(fields.object(
          {
          icon: fields.text({ label: 'Icon' }),
          title: fields.text({ label: 'Title' }),
          text: fields.text({ label: 'Text', multiline: true }),
          },
          { label: 'Values' },
        ), { label: 'Values', itemLabel: (p) => p.fields.title.value }),
      factsTitle: fields.text({ label: 'Facts Title' }),
      facts: fields.array(fields.object(
          {
          k: fields.text({ label: 'K' }),
          v: fields.text({ label: 'V' }),
          },
          { label: 'Facts' },
        ), { label: 'Facts' }),
      storyTitle: fields.text({ label: 'Story Title' }),
      story: fields.array(fields.text({ label: 'Story', multiline: true }), { label: 'Story' }),
      govTitle: fields.text({ label: 'Gov Title' }),
      govIntro: fields.text({ label: 'Gov Intro', multiline: true }),
      circles: fields.array(fields.object(
          {
          icon: fields.text({ label: 'Icon' }),
          title: fields.text({ label: 'Title' }),
          text: fields.text({ label: 'Text', multiline: true }),
          },
          { label: 'Circles' },
        ), { label: 'Circles', itemLabel: (p) => p.fields.title.value }),
      membersTitle: fields.text({ label: 'Members Title' }),
      members: fields.array(fields.object(
          {
          title: fields.text({ label: 'Title' }),
          text: fields.text({ label: 'Text', multiline: true }),
          },
          { label: 'Members' },
        ), { label: 'Members', itemLabel: (p) => p.fields.title.value }),
    },
  ),
  copy_qui_som_es: page(
    'Text: qui-som (ES)',
    'src/content/copy/es/qui-som',
    {
      title: fields.text({ label: 'Title' }),
      intro: fields.text({ label: 'Intro', multiline: true }),
      valuesTitle: fields.text({ label: 'Values Title' }),
      valuesIntro: fields.text({ label: 'Values Intro', multiline: true }),
      values: fields.array(fields.object(
          {
          icon: fields.text({ label: 'Icon' }),
          title: fields.text({ label: 'Title' }),
          text: fields.text({ label: 'Text', multiline: true }),
          },
          { label: 'Values' },
        ), { label: 'Values', itemLabel: (p) => p.fields.title.value }),
      factsTitle: fields.text({ label: 'Facts Title' }),
      facts: fields.array(fields.object(
          {
          k: fields.text({ label: 'K' }),
          v: fields.text({ label: 'V' }),
          },
          { label: 'Facts' },
        ), { label: 'Facts' }),
      storyTitle: fields.text({ label: 'Story Title' }),
      story: fields.array(fields.text({ label: 'Story', multiline: true }), { label: 'Story' }),
      govTitle: fields.text({ label: 'Gov Title' }),
      govIntro: fields.text({ label: 'Gov Intro', multiline: true }),
      circles: fields.array(fields.object(
          {
          icon: fields.text({ label: 'Icon' }),
          title: fields.text({ label: 'Title' }),
          text: fields.text({ label: 'Text', multiline: true }),
          },
          { label: 'Circles' },
        ), { label: 'Circles', itemLabel: (p) => p.fields.title.value }),
      membersTitle: fields.text({ label: 'Members Title' }),
      members: fields.array(fields.object(
          {
          title: fields.text({ label: 'Title' }),
          text: fields.text({ label: 'Text', multiline: true }),
          },
          { label: 'Members' },
        ), { label: 'Members', itemLabel: (p) => p.fields.title.value }),
    },
  ),
  copy_signup_ca: page(
    'Text: signup (CA)',
    'src/content/copy/ca/signup',
    {
      eyebrow: fields.text({ label: 'Eyebrow' }),
      title: fields.text({ label: 'Title' }),
      intro: fields.text({ label: 'Intro', multiline: true }),
      how: fields.text({ label: 'How' }),
      howNote: fields.text({ label: 'How Note', multiline: true }),
      ways: fields.array(fields.object(
          {
          v: fields.text({ label: 'V' }),
          l: fields.text({ label: 'L' }),
          },
          { label: 'Ways' },
        ), { label: 'Ways' }),
      name: fields.text({ label: 'Name' }),
      phone: fields.text({ label: 'Phone' }),
      comments: fields.text({ label: 'Comments' }),
      consent: fields.text({ label: 'Consent' }),
      consentNote: fields.text({ label: 'Consent Note', multiline: true }),
      submit: fields.text({ label: 'Submit' }),
      asideTitle: fields.text({ label: 'Aside Title' }),
      steps: fields.array(fields.text({ label: 'Steps' }), { label: 'Steps' }),
      prefer: fields.text({ label: 'Prefer' }),
    },
  ),
  copy_signup_es: page(
    'Text: signup (ES)',
    'src/content/copy/es/signup',
    {
      eyebrow: fields.text({ label: 'Eyebrow' }),
      title: fields.text({ label: 'Title' }),
      intro: fields.text({ label: 'Intro', multiline: true }),
      how: fields.text({ label: 'How' }),
      howNote: fields.text({ label: 'How Note', multiline: true }),
      ways: fields.array(fields.object(
          {
          v: fields.text({ label: 'V' }),
          l: fields.text({ label: 'L' }),
          },
          { label: 'Ways' },
        ), { label: 'Ways' }),
      name: fields.text({ label: 'Name' }),
      phone: fields.text({ label: 'Phone' }),
      comments: fields.text({ label: 'Comments' }),
      consent: fields.text({ label: 'Consent' }),
      consentNote: fields.text({ label: 'Consent Note', multiline: true }),
      submit: fields.text({ label: 'Submit' }),
      asideTitle: fields.text({ label: 'Aside Title' }),
      steps: fields.array(fields.text({ label: 'Steps' }), { label: 'Steps' }),
      prefer: fields.text({ label: 'Prefer' }),
    },
  ),
  copy_torns_ca: page(
    'Text: torns (CA)',
    'src/content/copy/ca/torns',
    {
      eyebrow: fields.text({ label: 'Eyebrow' }),
      title: fields.text({ label: 'Title' }),
      intro: fields.text({ label: 'Intro', multiline: true }),
      cycleTitle: fields.text({ label: 'Cycle Title' }),
      cycleText: fields.text({ label: 'Cycle Text', multiline: true }),
      tasksTitle: fields.text({ label: 'Tasks Title' }),
      tasks: fields.array(fields.text({ label: 'Tasks' }), { label: 'Tasks' }),
      tasksNote: fields.text({ label: 'Tasks Note', multiline: true }),
      typesTitle: fields.text({ label: 'Types Title' }),
      types: fields.array(fields.object(
          {
          icon: fields.text({ label: 'Icon' }),
          t: fields.text({ label: 'T' }),
          d: fields.text({ label: 'D', multiline: true }),
          },
          { label: 'Types' },
        ), { label: 'Types', itemLabel: (p) => p.fields.t.value }),
      flexTitle: fields.text({ label: 'Flex Title' }),
      flex: fields.array(fields.object(
          {
          q: fields.text({ label: 'Q' }),
          a: fields.text({ label: 'A', multiline: true }),
          },
          { label: 'Flex' },
        ), { label: 'Flex', itemLabel: (p) => p.fields.q.value }),
      circlesTitle: fields.text({ label: 'Circles Title' }),
      circlesText: fields.text({ label: 'Circles Text', multiline: true }),
      circles: fields.array(fields.object(
          {
          t: fields.text({ label: 'T' }),
          d: fields.text({ label: 'D', multiline: true }),
          },
          { label: 'Circles' },
        ), { label: 'Circles', itemLabel: (p) => p.fields.t.value }),
      quotaTitle: fields.text({ label: 'Quota Title' }),
      quotaText: fields.text({ label: 'Quota Text', multiline: true }),
      quotaLink: fields.text({ label: 'Quota Link' }),
      finalTitle: fields.text({ label: 'Final Title' }),
      finalText: fields.text({ label: 'Final Text', multiline: true }),
    },
  ),
  copy_torns_es: page(
    'Text: torns (ES)',
    'src/content/copy/es/torns',
    {
      eyebrow: fields.text({ label: 'Eyebrow' }),
      title: fields.text({ label: 'Title' }),
      intro: fields.text({ label: 'Intro', multiline: true }),
      cycleTitle: fields.text({ label: 'Cycle Title' }),
      cycleText: fields.text({ label: 'Cycle Text', multiline: true }),
      tasksTitle: fields.text({ label: 'Tasks Title' }),
      tasks: fields.array(fields.text({ label: 'Tasks' }), { label: 'Tasks' }),
      tasksNote: fields.text({ label: 'Tasks Note', multiline: true }),
      typesTitle: fields.text({ label: 'Types Title' }),
      types: fields.array(fields.object(
          {
          icon: fields.text({ label: 'Icon' }),
          t: fields.text({ label: 'T' }),
          d: fields.text({ label: 'D', multiline: true }),
          },
          { label: 'Types' },
        ), { label: 'Types', itemLabel: (p) => p.fields.t.value }),
      flexTitle: fields.text({ label: 'Flex Title' }),
      flex: fields.array(fields.object(
          {
          q: fields.text({ label: 'Q' }),
          a: fields.text({ label: 'A', multiline: true }),
          },
          { label: 'Flex' },
        ), { label: 'Flex', itemLabel: (p) => p.fields.q.value }),
      circlesTitle: fields.text({ label: 'Circles Title' }),
      circlesText: fields.text({ label: 'Circles Text', multiline: true }),
      circles: fields.array(fields.object(
          {
          t: fields.text({ label: 'T' }),
          d: fields.text({ label: 'D', multiline: true }),
          },
          { label: 'Circles' },
        ), { label: 'Circles', itemLabel: (p) => p.fields.t.value }),
      quotaTitle: fields.text({ label: 'Quota Title' }),
      quotaText: fields.text({ label: 'Quota Text', multiline: true }),
      quotaLink: fields.text({ label: 'Quota Link' }),
      finalTitle: fields.text({ label: 'Final Title' }),
      finalText: fields.text({ label: 'Final Text', multiline: true }),
    },
  ),
  copy_transparencia_ca: page(
    'Text: transparencia (CA)',
    'src/content/copy/ca/transparencia',
    {
      eyebrow: fields.text({ label: 'Eyebrow' }),
      title: fields.text({ label: 'Title' }),
      intro: fields.text({ label: 'Intro', multiline: true }),
      docsTitle: fields.text({ label: 'Docs Title' }),
      docs: fields.array(fields.object(
          {
          icon: fields.text({ label: 'Icon' }),
          t: fields.text({ label: 'T' }),
          d: fields.text({ label: 'D', multiline: true }),
          href: fields.text({ label: 'Href' }),
          page: fields.text({ label: 'Page' }),
          },
          { label: 'Docs' },
        ), { label: 'Docs', itemLabel: (p) => p.fields.t.value }),
      download: fields.text({ label: 'Download' }),
      howTitle: fields.text({ label: 'How Title' }),
      how: fields.array(fields.object(
          {
          t: fields.text({ label: 'T' }),
          d: fields.text({ label: 'D', multiline: true }),
          },
          { label: 'How' },
        ), { label: 'How', itemLabel: (p) => p.fields.t.value }),
      moneyTitle: fields.text({ label: 'Money Title' }),
      money: fields.array(fields.object(
          {
          t: fields.text({ label: 'T' }),
          d: fields.text({ label: 'D', multiline: true }),
          },
          { label: 'Money' },
        ), { label: 'Money', itemLabel: (p) => p.fields.t.value }),
      factsTitle: fields.text({ label: 'Facts Title' }),
      facts: fields.array(fields.object(
          {
          k: fields.text({ label: 'K' }),
          v: fields.text({ label: 'V' }),
          },
          { label: 'Facts' },
        ), { label: 'Facts' }),
      finalTitle: fields.text({ label: 'Final Title' }),
      finalText: fields.text({ label: 'Final Text', multiline: true }),
    },
  ),
  copy_transparencia_es: page(
    'Text: transparencia (ES)',
    'src/content/copy/es/transparencia',
    {
      eyebrow: fields.text({ label: 'Eyebrow' }),
      title: fields.text({ label: 'Title' }),
      intro: fields.text({ label: 'Intro', multiline: true }),
      docsTitle: fields.text({ label: 'Docs Title' }),
      docs: fields.array(fields.object(
          {
          icon: fields.text({ label: 'Icon' }),
          t: fields.text({ label: 'T' }),
          d: fields.text({ label: 'D', multiline: true }),
          href: fields.text({ label: 'Href' }),
          page: fields.text({ label: 'Page' }),
          },
          { label: 'Docs' },
        ), { label: 'Docs', itemLabel: (p) => p.fields.t.value }),
      download: fields.text({ label: 'Download' }),
      howTitle: fields.text({ label: 'How Title' }),
      how: fields.array(fields.object(
          {
          t: fields.text({ label: 'T' }),
          d: fields.text({ label: 'D', multiline: true }),
          },
          { label: 'How' },
        ), { label: 'How', itemLabel: (p) => p.fields.t.value }),
      moneyTitle: fields.text({ label: 'Money Title' }),
      money: fields.array(fields.object(
          {
          t: fields.text({ label: 'T' }),
          d: fields.text({ label: 'D', multiline: true }),
          },
          { label: 'Money' },
        ), { label: 'Money', itemLabel: (p) => p.fields.t.value }),
      factsTitle: fields.text({ label: 'Facts Title' }),
      facts: fields.array(fields.object(
          {
          k: fields.text({ label: 'K' }),
          v: fields.text({ label: 'V' }),
          },
          { label: 'Facts' },
        ), { label: 'Facts' }),
      finalTitle: fields.text({ label: 'Final Title' }),
      finalText: fields.text({ label: 'Final Text', multiline: true }),
    },
  ),
};
